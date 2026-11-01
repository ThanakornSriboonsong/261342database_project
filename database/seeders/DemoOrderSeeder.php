<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Summary;
use App\Models\Tier;
use App\Models\User;
use App\Services\PromotionCalculator;
use Carbon\CarbonInterface;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

/**
 * Demo customers with six months of past orders, reviews, wishlists and a filled cart,
 * so the shop pages, admin dashboard and sales report have data to show.
 *
 * Uses a fixed random seed: every run produces the same data.
 */
class DemoOrderSeeder extends Seeder
{
    private const CUSTOMERS = [
        ['name' => 'Somchai Jaidee', 'email' => 'somchai@banana.test', 'address' => '12 Nimmanhaemin Rd, Chiang Mai 50200'],
        ['name' => 'Suda Rakdee', 'email' => 'suda@banana.test', 'address' => '45 Sukhumvit Soi 11, Bangkok 10110'],
        ['name' => 'Anan Srisuk', 'email' => 'anan@banana.test', 'address' => '8 Moo 3, Hang Dong, Chiang Mai 50230'],
        ['name' => 'Malee Thongdee', 'email' => 'malee@banana.test', 'address' => '99 Mittraphap Rd, Khon Kaen 40000'],
        ['name' => 'Kittipong Wongsa', 'email' => 'kittipong@banana.test', 'address' => '21 Beach Rd, Pattaya, Chonburi 20150'],
        ['name' => 'Pimchanok Saelee', 'email' => 'pimchanok@banana.test', 'address' => '7 Ratchadamnoen Rd, Phitsanulok 65000'],
    ];

    private const REVIEWS = [
        5 => ['หวานมาก สดใหม่ ส่งไว', 'อร่อยสุดๆ จะสั่งอีกแน่นอน', 'แพ็กมาดี ไม่ช้ำเลย', 'ลูกใหญ่ คุ้มราคา'],
        4 => ['อร่อยดี แต่สุกเร็วไปนิด', 'ดีครับ ราคาโอเค', 'หอมดี ลูกขนาดกำลังพอดี'],
        3 => ['พอใช้ได้ บางลูกช้ำ', 'รสชาติธรรมดา', 'ส่งช้าไปหน่อย แต่ของโอเค'],
    ];

    private const ORDERS = 48;

    public function run(): void
    {
        mt_srand(261342);

        $calculator = new PromotionCalculator;
        $products = Product::all()->keyBy('product_id');
        $promotions = Promotion::with('products', 'discount', 'buyGet')
            ->whereIn('code', ['MONKEY10', 'SNACK2GET1'])
            ->get();

        $customers = collect(self::CUSTOMERS)->map(fn (array $data) => User::factory()->create([
            ...$data,
            'phone' => '08'.mt_rand(10000000, 99999999),
            'created_at' => now()->subMonths(7),
        ]));

        foreach ($this->orderPlans($customers) as [$customer, $date]) {
            $this->placeOrder($customer, $date, $products, $promotions, $calculator);
        }

        $tiers = Tier::orderByDesc('min_spent')->get();

        foreach ($customers as $customer) {
            $customer->refresh();
            $customer->tier_id = $tiers->first(fn (Tier $tier) => (float) $tier->min_spent <= (float) $customer->total_spent)?->tier_id;
            $customer->save();

            $this->review($customer);
            $customer->wishlist()->syncWithoutDetaching($this->pick($products, 2)->modelKeys());
        }

        // Somchai has something waiting in the cart.
        $customers->first()->cart->products()->attach([
            $products->firstWhere('name', 'Hom Thong Banana')->product_id => ['quantity' => 2, 'is_out' => false],
            $products->firstWhere('name', 'Banana Chips (100 g)')->product_id => ['quantity' => 3, 'is_out' => false],
            $products->firstWhere('name', 'Plantain')->product_id => ['quantity' => 1, 'is_out' => true],
        ]);
    }

    /**
     * Who orders when, oldest first. The first two orders are today so the dashboard shows "today" numbers.
     *
     * @param  Collection<int, User>  $customers
     * @return list<array{0: User, 1: CarbonInterface}>
     */
    private function orderPlans(Collection $customers): array
    {
        $plans = [];

        for ($i = 0; $i < self::ORDERS; $i++) {
            $date = $i < 2
                ? now()->setTime(9 + $i, mt_rand(0, 59))
                : now()->subDays(mt_rand(1, 180))->setTime(mt_rand(8, 21), mt_rand(0, 59));

            $plans[] = [$customers[mt_rand(0, $customers->count() - 1)], $date];
        }

        usort($plans, fn (array $a, array $b) => $a[1] <=> $b[1]);

        return $plans;
    }

    /**
     * @param  Collection<int, Product>  $products
     * @param  Collection<int, Promotion>  $promotions
     */
    private function placeOrder(User $customer, CarbonInterface $date, Collection $products, Collection $promotions, PromotionCalculator $calculator): void
    {
        $cart = $customer->cart()->firstOrCreate();

        $lines = $this->pick($products, mt_rand(1, 3))->map(fn (Product $product) => [
            'product_id' => (int) $product->product_id,
            'quantity' => $quantity = mt_rand(1, 4),
            'unit_price' => (float) $product->price,
            'line_total' => round((float) $product->price * $quantity, 2),
        ])->values();

        // Some orders use whichever demo code gives a discount.
        $promotion = mt_rand(1, 100) <= 40
            ? $promotions->first(fn (Promotion $promotion) => $calculator->discountFor($promotion, $lines) > 0)
            : null;

        $totals = $calculator->summarize($lines, $promotion);

        $summary = Summary::create([
            'cart_id' => $cart->getKey(),
            'promotion_id' => $promotion?->getKey(),
            'order_date' => $date,
            'total_price' => $totals['subtotal'],
            'discount_amount' => $totals['discount'],
            'final_price' => $totals['total'],
            'shipping_address' => $customer->address,
        ]);

        $summary->products()->attach($lines->mapWithKeys(fn (array $line) => [
            $line['product_id'] => ['quantity' => $line['quantity'], 'unit_price' => $line['unit_price']],
        ])->all());

        $customer->total_spent = round((float) $customer->total_spent + $totals['total'], 2);
        $customer->save();
    }

    /**
     * $count different items, chosen with mt_rand so the fixed seed gives the same picks every run
     * (Collection::random() uses its own random source).
     *
     * @template T
     *
     * @param  Collection<int, T>  $items
     * @return Collection<int, T>
     */
    private function pick(Collection $items, int $count): Collection
    {
        $pool = $items->values()->all();

        for ($i = count($pool) - 1; $i > 0; $i--) {
            $j = mt_rand(0, $i);
            [$pool[$i], $pool[$j]] = [$pool[$j], $pool[$i]];
        }

        return $items->make(array_slice($pool, 0, $count));
    }

    /**
     * Reviews on about 60% of the products the customer has bought.
     */
    private function review(User $customer): void
    {
        $bought = $customer->summaries()->with('products:product_id')->get()
            ->flatMap(fn (Summary $summary) => $summary->products->pluck('product_id'))
            ->unique();

        foreach ($bought as $productId) {
            if (mt_rand(1, 100) > 60) {
                continue;
            }

            $star = [5, 5, 5, 4, 4, 3][mt_rand(0, 5)];
            $texts = self::REVIEWS[$star];

            // forceFill: created_at is not fillable.
            (new Comment)->forceFill([
                'user_id' => $customer->user_id,
                'product_id' => $productId,
                'comment' => $texts[mt_rand(0, count($texts) - 1)],
                'star' => $star,
                'created_at' => now()->subDays(mt_rand(0, 30)),
            ])->save();
        }
    }
}
