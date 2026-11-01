<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Product;
use App\Models\Promotion;

/**
 * Shapes models into the props the React pages expect.
 *
 * Money comes out of the DB as strings like "50.00"; everything here is cast to numbers.
 */
trait PresentsShopData
{
    /**
     * A product as shown on cards and lists.
     *
     * Load it with withAvg('comments', 'star') and withCount('comments') to avoid a query per product.
     *
     * @return array<string, mixed>
     */
    protected function productCard(Product $product): array
    {
        $star = $product->comments_avg_star ?? null;

        return [
            'product_id' => (int) $product->product_id,
            'name' => $product->name,
            'price' => (float) $product->price,
            'stock' => (int) $product->stock,
            'image_url' => $product->image_url,
            'star' => $star === null ? null : round((float) $star, 1),
            'comments_count' => (int) ($product->comments_count ?? 0),
            'is_wished' => (bool) ($product->is_wished ?? false),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function promotionSummary(Promotion $promotion): array
    {
        $promotion->loadMissing('discount', 'buyGet', 'tier');

        return [
            'promotion_id' => (int) $promotion->promotion_id,
            'name' => $promotion->name,
            'code' => $promotion->code,
            'type' => $promotion->type,
            'percent' => $promotion->discount ? (float) $promotion->discount->percent : null,
            'max_discount' => $promotion->discount?->max_discount !== null ? (float) $promotion->discount->max_discount : null,
            'buy_qty' => $promotion->buyGet?->buy_qty,
            'get_qty' => $promotion->buyGet?->get_qty,
            'tier' => $promotion->tier?->name,
            'end_date' => $promotion->end_date->toDateString(),
        ];
    }
}
