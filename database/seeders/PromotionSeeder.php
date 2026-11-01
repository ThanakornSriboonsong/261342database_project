<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Promotion;
use App\Models\Tier;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    /**
     * Dates are relative to today so the codes stay usable whenever the seeder runs.
     * EXPIRED5 is there on purpose, for testing the "code not active" message.
     */
    public function run(): void
    {
        $products = Product::pluck('product_id', 'name');
        $gold = Tier::where('name', 'Gold')->value('tier_id');

        $this->discount('MONKEY10', 'ลด 10% กล้วยสด', 10, 100, null, [
            $products['Cavendish Banana'],
            $products['Hom Thong Banana'],
            $products['Namwa Banana'],
            $products['Khai Banana'],
        ]);

        $this->buyGet('SNACK2GET1', 'ขนมกล้วย ซื้อ 2 แถม 1', 2, 1, null, [
            $products['Banana Chips (100 g)'],
            $products['Sun-dried Banana (200 g)'],
        ]);

        // No products attached = applies to everything.
        $this->discount('GOLD15', 'สมาชิก Gold ลด 15% ทุกสินค้า', 15, 300, $gold, []);

        $this->discount('EXPIRED5', 'โปรหมดอายุ (ไว้ทดสอบ)', 5, null, null, [], expired: true);
    }

    /**
     * @param  list<int>  $productIds
     */
    private function discount(string $code, string $name, float $percent, ?float $max, ?int $tierId, array $productIds, bool $expired = false): void
    {
        $promotion = $this->promotion($code, $name, Promotion::TYPE_DISCOUNT, $tierId, $productIds, $expired);
        $promotion->discount()->create(['percent' => $percent, 'max_discount' => $max]);
    }

    /**
     * @param  list<int>  $productIds
     */
    private function buyGet(string $code, string $name, int $buy, int $get, ?int $tierId, array $productIds): void
    {
        $promotion = $this->promotion($code, $name, Promotion::TYPE_BUY_GET, $tierId, $productIds);
        $promotion->buyGet()->create(['buy_qty' => $buy, 'get_qty' => $get]);
    }

    /**
     * @param  list<int>  $productIds
     */
    private function promotion(string $code, string $name, string $type, ?int $tierId, array $productIds, bool $expired = false): Promotion
    {
        $promotion = Promotion::create([
            'name' => $name,
            'code' => $code,
            'type' => $type,
            'tier_id' => $tierId,
            'start_date' => $expired ? today()->subMonths(2) : today()->subMonths(6),
            'end_date' => $expired ? today()->subMonth() : today()->addMonths(3),
        ]);

        $promotion->products()->attach($productIds);

        return $promotion;
    }
}
