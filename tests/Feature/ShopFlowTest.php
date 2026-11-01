<?php

namespace Tests\Feature;

use App\Models\BuyGet;
use App\Models\Comment;
use App\Models\Discount;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Summary;
use App\Models\Tier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ShopFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // The shop pages are built by the view team; these tests only check the props.
        $this->withoutVite();
    }

    private function banana(array $attributes = []): Product
    {
        return Product::create([
            'name' => 'Red Banana',
            'detail' => 'Sweet',
            'price' => 50,
            'stock' => 10,
            ...$attributes,
        ]);
    }

    private function promotion(string $type, array $attributes = []): Promotion
    {
        return Promotion::create([
            'name' => 'Promo',
            'code' => 'CODE'.uniqid(),
            'type' => $type,
            'start_date' => today()->subDay(),
            'end_date' => today()->addDay(),
            ...$attributes,
        ]);
    }

    public function test_guests_can_browse_products_with_ratings()
    {
        $product = $this->banana();
        $user = User::factory()->create();
        Comment::create(['user_id' => $user->user_id, 'product_id' => $product->product_id, 'comment' => 'ok', 'star' => 4]);

        $this->get('/products')->assertInertia(fn (Assert $page) => $page
            ->component('products/index', false)
            ->where('products.data.0.product_id', $product->product_id)
            ->where('products.data.0.price', 50)
            ->where('products.data.0.star', 4)
            ->where('products.data.0.comments_count', 1));

        $this->get("/products/{$product->product_id}")->assertInertia(fn (Assert $page) => $page
            ->component('products/show', false)
            ->where('comments.0.user_name', $user->name)
            ->where('comments.0.can_edit', false));
    }

    public function test_home_page_shows_products()
    {
        $this->banana();

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('welcome', false)
            ->has('newProducts', 1));
    }

    public function test_cart_discount_code_checkout_and_order_history()
    {
        $user = User::factory()->create(['address' => 'Chiang Mai']);
        $a = $this->banana(['name' => 'A', 'price' => 50, 'stock' => 5]);
        $b = $this->banana(['name' => 'B', 'price' => 20, 'stock' => 5]);
        $c = $this->banana(['name' => 'C', 'price' => 100, 'stock' => 5]);

        $promo = $this->promotion(Promotion::TYPE_DISCOUNT);
        Discount::create(['promotion_id' => $promo->promotion_id, 'percent' => 10, 'max_discount' => null]);
        $promo->products()->attach($a->product_id); // only A is discounted

        $this->actingAs($user);

        $this->post('/cart', ['product_id' => $a->product_id, 'quantity' => 2])->assertSessionHasNoErrors();
        $this->post('/cart', ['product_id' => $b->product_id])->assertSessionHasNoErrors();
        $this->post('/cart', ['product_id' => $c->product_id])->assertSessionHasNoErrors();
        $this->patch("/cart/{$c->product_id}", ['is_out' => true])->assertSessionHasNoErrors();

        // Too many: only 5 in stock.
        $this->post('/cart', ['product_id' => $a->product_id, 'quantity' => 4])->assertSessionHasErrors('quantity');

        $this->post('/cart/promotion', ['code' => $promo->code])->assertSessionHasNoErrors();

        // A: 2 x 50 = 100, B: 20, C left out. 10% off A only = 10.
        $this->get('/cart')->assertInertia(fn (Assert $page) => $page
            ->component('cart/index', false)
            ->has('items', 3)
            ->where('summary.subtotal', 120)
            ->where('summary.discount', 10)
            ->where('summary.total', 110)
            ->where('promotion.code', $promo->code));

        $this->get('/checkout')->assertInertia(fn (Assert $page) => $page
            ->component('checkout/create', false)
            ->has('items', 2)
            ->where('shippingAddress', 'Chiang Mai'));

        $a->update(['price' => 999]);

        $response = $this->post('/checkout', ['shipping_address' => 'Chiang Mai'])->assertSessionHasNoErrors();

        $summary = Summary::sole();
        $response->assertRedirect("/orders/{$summary->summary_id}");

        $this->assertSame(2018.0, (float) $summary->total_price); // 2 x 999 + 20
        $this->assertSame(199.8, (float) $summary->discount_amount);
        $this->assertSame(1818.2, (float) $summary->final_price);
        $this->assertSame($promo->promotion_id, $summary->promotion_id);
        $this->assertSame(3, $a->fresh()->stock);
        $this->assertSame(4, $b->fresh()->stock);
        $this->assertSame(5, $c->fresh()->stock);
        $this->assertSame(1818.2, (float) $user->fresh()->total_spent);

        // Only the left-out item stays in the cart.
        $this->assertSame([$c->product_id], $user->cart->products()->pluck('products.product_id')->all());

        // A later price change does not touch the order.
        $a->update(['price' => 1]);

        $this->get("/orders/{$summary->summary_id}")->assertInertia(fn (Assert $page) => $page
            ->component('orders/show', false)
            ->where('order.items.0.unit_price', 999)
            ->where('order.final_price', 1818.2));

        $this->get('/orders')->assertInertia(fn (Assert $page) => $page
            ->component('orders/index', false)
            ->where('orders.data.0.items_count', 2));
    }

    public function test_buy_x_get_y_and_tier_rules()
    {
        Tier::create(['name' => 'Silver', 'min_spent' => 0]);
        $gold = Tier::create(['name' => 'Gold', 'min_spent' => 1000]);
        $user = User::factory()->create();
        $product = $this->banana(['price' => 30]);

        $promo = $this->promotion(Promotion::TYPE_BUY_GET, ['tier_id' => $gold->tier_id]);
        BuyGet::create(['promotion_id' => $promo->promotion_id, 'buy_qty' => 2, 'get_qty' => 1]);

        $this->actingAs($user)->post('/cart', ['product_id' => $product->product_id, 'quantity' => 7]);

        // No tier yet: the Gold code is refused.
        $this->post('/cart/promotion', ['code' => $promo->code])->assertSessionHasErrors('code');

        $user->tier_id = $gold->tier_id;
        $user->save();

        $this->post('/cart/promotion', ['code' => $promo->code])->assertSessionHasNoErrors();

        // 7 items, buy 2 get 1 => 2 free => 60 off 210.
        $this->get('/cart')->assertInertia(fn (Assert $page) => $page
            ->where('summary.subtotal', 210)
            ->where('summary.discount', 60)
            ->where('summary.total', 150));
    }

    public function test_checkout_moves_member_up_a_tier()
    {
        Tier::create(['name' => 'Silver', 'min_spent' => 0]);
        $gold = Tier::create(['name' => 'Gold', 'min_spent' => 100]);
        $user = User::factory()->create();
        $product = $this->banana(['price' => 60]);

        $this->actingAs($user)->post('/cart', ['product_id' => $product->product_id, 'quantity' => 2]);
        $this->post('/checkout', ['shipping_address' => 'Bangkok'])->assertSessionHasNoErrors();

        $this->assertSame($gold->tier_id, $user->fresh()->tier_id);
    }

    public function test_expired_and_unknown_codes_are_rejected()
    {
        $user = User::factory()->create();
        $product = $this->banana();
        $expired = $this->promotion(Promotion::TYPE_DISCOUNT, ['start_date' => today()->subWeek(), 'end_date' => today()->subDay()]);
        Discount::create(['promotion_id' => $expired->promotion_id, 'percent' => 10]);

        $this->actingAs($user)->post('/cart', ['product_id' => $product->product_id]);

        $this->post('/cart/promotion', ['code' => $expired->code])->assertSessionHasErrors('code');
        $this->post('/cart/promotion', ['code' => 'NOPE'])->assertSessionHasErrors('code');
    }

    public function test_wishlist_and_reviews()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $product = $this->banana();

        $this->actingAs($user)->post("/wishlist/{$product->product_id}")->assertSessionHasNoErrors();
        $this->post("/wishlist/{$product->product_id}"); // adding twice is fine

        $this->get('/wishlist')->assertInertia(fn (Assert $page) => $page
            ->component('wishlist/index', false)
            ->has('products', 1)
            ->where('products.0.is_wished', true));

        $this->get('/products')->assertInertia(fn (Assert $page) => $page
            ->where('products.data.0.is_wished', true));

        $this->delete("/wishlist/{$product->product_id}");
        $this->assertSame(0, $user->wishlist()->count());

        $this->post("/products/{$product->product_id}/comments", ['comment' => 'Great', 'star' => 6])->assertSessionHasErrors('star');
        $this->post("/products/{$product->product_id}/comments", ['comment' => 'Great', 'star' => 5])->assertSessionHasNoErrors();

        $comment = Comment::sole();

        $this->actingAs($other)->patch("/comments/{$comment->comment_id}", ['comment' => 'hack', 'star' => 1])->assertForbidden();
        $this->actingAs($user)->patch("/comments/{$comment->comment_id}", ['comment' => 'Good', 'star' => 4])->assertSessionHasNoErrors();
        $this->assertSame(4, $comment->fresh()->star);
    }

    public function test_members_cannot_see_other_orders_and_guests_must_log_in()
    {
        $owner = User::factory()->create();
        $product = $this->banana();

        $this->actingAs($owner)->post('/cart', ['product_id' => $product->product_id]);
        $this->post('/checkout', ['shipping_address' => 'X']);
        $summary = Summary::sole();

        $this->actingAs(User::factory()->create())->get("/orders/{$summary->summary_id}")->assertNotFound();

        auth()->logout();
        $this->get('/cart')->assertRedirect('/login');
    }

    public function test_member_with_orders_cannot_delete_account()
    {
        $user = User::factory()->create();
        $product = $this->banana();

        $this->actingAs($user)->post('/cart', ['product_id' => $product->product_id]);
        $this->post('/checkout', ['shipping_address' => 'X']);

        $this->delete('/settings/profile', ['password' => 'password'])->assertRedirect('/settings/profile');
        $this->assertNotNull($user->fresh());
    }
}
