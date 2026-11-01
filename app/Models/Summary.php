<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property int $summary_id
 * @property int $cart_id
 * @property int|null $promotion_id
 * @property Carbon $order_date
 * @property string $total_price
 * @property string $discount_amount
 * @property string $final_price
 * @property string $shipping_address
 */
#[Table(name: 'summaries', key: 'summary_id', timestamps: false)]
#[Fillable(['cart_id', 'promotion_id', 'order_date', 'total_price', 'discount_amount', 'final_price', 'shipping_address'])]
class Summary extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'order_date' => 'datetime',
            'total_price' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'final_price' => 'decimal:2',
        ];
    }

    /**
     * CHECKOUT: the cart this order was created from.
     *
     * @return BelongsTo<Cart, $this>
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class, 'cart_id', 'cart_id');
    }

    /**
     * USED_IN: the promotion used for this order, if any.
     *
     * @return BelongsTo<Promotion, $this>
     */
    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class, 'promotion_id', 'promotion_id');
    }

    /**
     * INCLUDES: products in this order with the quantity and unit price at checkout.
     *
     * @return BelongsToMany<Product, $this>
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'summary_items', 'summary_id', 'product_id')
            ->withPivot('quantity', 'unit_price');
    }
}
