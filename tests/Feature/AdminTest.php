<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Promotion;
use App\Models\Summary;
use App\Models\Tier;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function order(User $customer, Product $product, int $quantity, ?string $date = null): Summary
    {
        $this->actingAs($customer)->post('/cart', ['product_id' => $product->product_id, 'quantity' => $quantity]);
        $this->post('/checkout', ['shipping_address' => 'X'])->assertSessionHasNoErrors();

        $summary = Summary::latest('summary_id')->first();

        if ($date) {
            $summary->update(['order_date' => $date]);
        }

        return $summary;
    }

    public function test_only_admins_can_open_admin_pages()
    {
        $this->get('/admin')->assertRedirect('/login');
        $this->actingAs(User::factory()->create())->get('/admin')->assertForbidden();
        $this->actingAs($this->admin())->get('/admin')->assertOk();
    }

    public function test_cart_count_is_shared_with_every_page()
    {
        $user = User::factory()->create();
        $product = Product::create(['name' => 'A', 'price' => 10, 'stock' => 10]);

        $this->actingAs($user)->get('/products')->assertInertia(fn (Assert $page) => $page->where('cartCount', 0));

        $this->post('/cart', ['product_id' => $product->product_id, 'quantity' => 3]);

        $this->get('/products')->assertInertia(fn (Assert $page) => $page->where('cartCount', 3));
    }

    public function test_dashboard_numbers()
    {
        $product = Product::create(['name' => 'A', 'price' => 100, 'stock' => 10]);
        Product::create(['name' => 'Low', 'price' => 5, 'stock' => 2]);
        $customer = User::factory()->create();

        $this->order($customer, $product, 2);

        $this->actingAs($this->admin())->get('/admin')->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard', false)
            ->where('stats.today_revenue', 200)
            ->where('stats.today_orders', 1)
            ->where('stats.members', 1)
            ->where('stats.low_stock_count', 1)
            ->has('salesByMonth', 12)
            ->where('topProducts.0.quantity', 2)
            ->where('recentOrders.0.customer', $customer->name));
    }

    public function test_product_crud_with_image_upload()
    {
        Storage::fake('public');
        $this->actingAs($this->admin());

        $this->post('/admin/products', [
            'name' => 'Red Banana',
            'price' => 120,
            'stock' => 5,
            'image' => UploadedFile::fake()->image('red.jpg'),
        ])->assertRedirect('/admin/products');

        $product = Product::sole();
        $this->assertStringContainsString('/storage/products/', $product->image_url);

        $this->put("/admin/products/{$product->product_id}", ['name' => 'Red Banana', 'price' => 99, 'stock' => 7])
            ->assertSessionHasNoErrors();
        $this->assertSame(7, $product->fresh()->stock);
        $this->assertSame($product->image_url, $product->fresh()->image_url); // image kept

        $this->get('/admin/products')->assertInertia(fn (Assert $page) => $page
            ->component('admin/products/index', false)
            ->where('products.data.0.price', 99)
            ->where('products.data.0.sold', 0));

        $this->delete("/admin/products/{$product->product_id}");
        $this->assertSame(0, Product::count());
    }

    public function test_ordered_products_cannot_be_deleted()
    {
        $product = Product::create(['name' => 'A', 'price' => 10, 'stock' => 10]);
        $this->order(User::factory()->create(), $product, 1);

        $this->actingAs($this->admin())->delete("/admin/products/{$product->product_id}");

        $this->assertNotNull($product->fresh());
    }

    public function test_promotions_write_both_tables_and_switch_type()
    {
        $tier = Tier::create(['name' => 'Gold', 'min_spent' => 1000]);
        $product = Product::create(['name' => 'A', 'price' => 10, 'stock' => 10]);
        $this->actingAs($this->admin());

        $this->post('/admin/promotions', [
            'name' => 'Gold deal',
            'code' => 'gold20',
            'type' => 'discount',
            'tier_id' => $tier->tier_id,
            'start_date' => today()->toDateString(),
            'end_date' => today()->addWeek()->toDateString(),
            'percent' => 20,
            'max_discount' => 50,
            'product_ids' => [$product->product_id],
        ])->assertSessionHasNoErrors();

        $promotion = Promotion::sole();
        $this->assertSame('GOLD20', $promotion->code);
        $this->assertSame(20.0, (float) $promotion->discount->percent);
        $this->assertSame([$product->product_id], $promotion->products->modelKeys());

        // discount -> buy_get: the discounts row goes away, a buy_gets row appears.
        $this->put("/admin/promotions/{$promotion->promotion_id}", [
            'name' => 'Gold deal',
            'code' => 'GOLD20',
            'type' => 'buy_get',
            'start_date' => today()->toDateString(),
            'end_date' => today()->addWeek()->toDateString(),
            'buy_qty' => 2,
            'get_qty' => 1,
        ])->assertSessionHasNoErrors();

        $promotion->refresh();
        $this->assertNull($promotion->discount);
        $this->assertSame(2, $promotion->buyGet->buy_qty);
        $this->assertSame(0, $promotion->products()->count());

        $this->post('/admin/promotions', ['name' => 'x', 'code' => 'GOLD20', 'type' => 'discount', 'start_date' => '2026-01-01', 'end_date' => '2026-01-02'])
            ->assertSessionHasErrors(['code', 'percent']);

        $this->get('/admin/promotions')->assertInertia(fn (Assert $page) => $page
            ->component('admin/promotions/index', false)
            ->where('promotions.0.status', 'active')
            ->where('promotions.0.used_count', 0));
    }

    public function test_sales_report_totals_series_and_csv()
    {
        $a = Product::create(['name' => 'A', 'price' => 100, 'stock' => 50]);
        $b = Product::create(['name' => 'B', 'price' => 30, 'stock' => 50]);
        $customer = User::factory()->create();

        $this->order($customer, $a, 1, '2026-03-05 10:00:00');
        $this->order($customer, $b, 3, '2026-03-20 10:00:00');
        $this->order($customer, $a, 2, '2026-04-02 10:00:00'); // outside the range

        $this->actingAs($this->admin());

        $this->get('/admin/sales-report?from=2026-03-01&to=2026-03-31')->assertInertia(fn (Assert $page) => $page
            ->component('admin/sales-report', false)
            ->where('totals.orders', 2)
            ->where('totals.items_sold', 4)
            ->where('totals.revenue', 190)
            ->where('totals.average_order', 95)
            ->has('series', 31)
            ->where('series.4.revenue', 100)
            ->where('byProduct.0.name', 'A')
            ->where('byProduct.1.quantity', 3));

        $this->get('/admin/sales-report?from=2026-03-01&to=2026-04-30&group_by=month')->assertInertia(fn (Assert $page) => $page
            ->has('series', 2)
            ->where('series.1.revenue', 200));

        $csv = $this->get('/admin/sales-report/export?from=2026-03-01&to=2026-03-31')->assertOk()->streamedContent();
        $this->assertSame(3, substr_count(trim($csv), "\n") + 1); // header + 2 orders
    }

    public function test_admin_can_change_tier_and_admin_flag_but_not_demote_self()
    {
        $admin = $this->admin();
        $tier = Tier::create(['name' => 'Gold', 'min_spent' => 1000]);
        $customer = User::factory()->create();

        $this->actingAs($admin)->patch("/admin/users/{$customer->user_id}", ['tier_id' => $tier->tier_id, 'is_admin' => true]);
        $this->assertSame($tier->tier_id, $customer->fresh()->tier_id);
        $this->assertTrue($customer->fresh()->is_admin);

        $this->patch("/admin/users/{$admin->user_id}", ['is_admin' => false]);
        $this->assertTrue($admin->fresh()->is_admin);

        $this->get('/admin/users?search='.urlencode($customer->email))->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index', false)
            ->has('users.data', 1)
            ->where('users.data.0.tier', 'Gold'));
    }

    public function test_admin_orders_list_and_search()
    {
        $product = Product::create(['name' => 'A', 'price' => 10, 'stock' => 10]);
        $customer = User::factory()->create(['name' => 'Somchai']);
        $summary = $this->order($customer, $product, 1);

        $this->actingAs($this->admin());

        $this->get('/admin/orders?search=somchai')->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders/index', false)
            ->where('orders.data.0.summary_id', $summary->summary_id));

        $this->get("/admin/orders?search=%23{$summary->summary_id}")->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1));

        $this->get("/admin/orders/{$summary->summary_id}")->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders/show', false)
            ->where('order.customer.name', 'Somchai'));
    }

    public function test_seeders_build_a_consistent_demo_shop()
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(3, Tier::count());
        $this->assertSame(12, Product::count());
        $this->assertSame(4, Promotion::count());
        $this->assertTrue(User::where('email', 'admin@banana.test')->value('is_admin'));
        $this->assertSame(48, Summary::count());

        // Every promotion has exactly one detail row of its own type.
        foreach (Promotion::with('discount', 'buyGet')->get() as $promotion) {
            $this->assertSame($promotion->type === 'discount', $promotion->discount !== null);
            $this->assertSame($promotion->type === 'buy_get', $promotion->buyGet !== null);
        }

        // Stored order totals add up.
        foreach (Summary::with('products')->get() as $summary) {
            $lines = $summary->products->sum(fn ($p) => $p->pivot->quantity * $p->pivot->unit_price);
            $this->assertEqualsWithDelta($lines, (float) $summary->total_price, 0.01);
            $this->assertEqualsWithDelta((float) $summary->total_price - (float) $summary->discount_amount, (float) $summary->final_price, 0.01);
        }

        // total_spent matches the customer's orders.
        $somchai = User::where('email', 'somchai@banana.test')->first();
        $this->assertEqualsWithDelta((float) $somchai->summaries()->sum('final_price'), (float) $somchai->total_spent, 0.01);

        // The demo cart works with a seeded code.
        $this->actingAs($somchai)->post('/cart/promotion', ['code' => 'SNACK2GET1'])->assertSessionHasNoErrors();
        $this->post('/cart/promotion', ['code' => 'EXPIRED5'])->assertSessionHasErrors('code');
    }
}
