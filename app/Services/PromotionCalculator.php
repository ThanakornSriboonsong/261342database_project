<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Promotion;
use App\Models\Tier;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Prices a set of cart lines and works out what a promotion takes off.
 *
 * Shared by the cart page and checkout so both show the same numbers.
 */
class PromotionCalculator
{
    /**
     * Turn cart products (with pivot quantity) into price lines.
     *
     * @param  Collection<int, Product>  $products
     * @return Collection<int, array{product_id: int, quantity: int, unit_price: float, line_total: float}>
     */
    public function lines(Collection $products): Collection
    {
        return $products->map(function (Product $product): array {
            $quantity = (int) $product->pivot->quantity;
            $unitPrice = (float) $product->price;

            return [
                'product_id' => (int) $product->product_id,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'line_total' => round($unitPrice * $quantity, 2),
            ];
        })->values();
    }

    /**
     * Subtotal, discount and total for the given lines.
     *
     * @param  Collection<int, array{product_id: int, quantity: int, unit_price: float, line_total: float}>  $lines
     * @return array{subtotal: float, discount: float, total: float}
     */
    public function summarize(Collection $lines, ?Promotion $promotion): array
    {
        $subtotal = round($lines->sum('line_total'), 2);
        $discount = $promotion ? min($this->discountFor($promotion, $lines), $subtotal) : 0.0;

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'total' => round($subtotal - $discount, 2),
        ];
    }

    /**
     * How much the promotion takes off these lines.
     *
     * A promotion with no products attached applies to every product.
     *
     * @param  Collection<int, array{product_id: int, quantity: int, unit_price: float, line_total: float}>  $lines
     */
    public function discountFor(Promotion $promotion, Collection $lines): float
    {
        $promotion->loadMissing('products', 'discount', 'buyGet');

        $productIds = $promotion->products->pluck('product_id')->map(fn ($id) => (int) $id);
        $eligible = $productIds->isEmpty()
            ? $lines
            : $lines->whereIn('product_id', $productIds->all());

        $amount = match ($promotion->type) {
            Promotion::TYPE_DISCOUNT => $this->percentOff($promotion, $eligible),
            Promotion::TYPE_BUY_GET => $this->freeItems($promotion, $eligible),
            default => 0.0,
        };

        return round($amount, 2);
    }

    /**
     * Why this user can't use the promotion right now, or null if they can.
     */
    public function unusableReason(Promotion $promotion, User $user): ?string
    {
        $today = now()->startOfDay();

        if ($promotion->start_date->gt($today) || $promotion->end_date->lt($today)) {
            return __('This code is not active.');
        }

        if ($promotion->tier_id === null) {
            return null;
        }

        $promotion->loadMissing('tier');
        // Read the tier fresh: checkout may have just moved the user up.
        $userTier = $user->tier_id ? Tier::find($user->tier_id) : null;

        // Higher tiers (bigger min_spent) can also use lower-tier promotions.
        if ($userTier === null || (float) $userTier->min_spent < (float) $promotion->tier->min_spent) {
            return __('This code is for :tier members and above.', ['tier' => $promotion->tier->name]);
        }

        return null;
    }

    /**
     * @param  Collection<int, array{product_id: int, quantity: int, unit_price: float, line_total: float}>  $lines
     */
    private function percentOff(Promotion $promotion, Collection $lines): float
    {
        if ($promotion->discount === null) {
            return 0.0;
        }

        $amount = $lines->sum('line_total') * (float) $promotion->discount->percent / 100;

        if ($promotion->discount->max_discount !== null) {
            $amount = min($amount, (float) $promotion->discount->max_discount);
        }

        return $amount;
    }

    /**
     * Buy X get Y: every full group of (X + Y) of the same product gets Y free.
     *
     * @param  Collection<int, array{product_id: int, quantity: int, unit_price: float, line_total: float}>  $lines
     */
    private function freeItems(Promotion $promotion, Collection $lines): float
    {
        $rule = $promotion->buyGet;

        if ($rule === null || $rule->buy_qty + $rule->get_qty === 0) {
            return 0.0;
        }

        return $lines->sum(function (array $line) use ($rule): float {
            $groups = intdiv($line['quantity'], $rule->buy_qty + $rule->get_qty);

            return $groups * $rule->get_qty * $line['unit_price'];
        });
    }
}
