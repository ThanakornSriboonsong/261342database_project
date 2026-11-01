<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

/**
 * @property int $cart_id
 * @property int $user_id
 * @property-read float $price
 */
#[Table(key: 'cart_id', timestamps: false)]
#[Fillable(['user_id'])]
class Cart extends Model
{
    /**
     * Derived attribute: total of the items still in the cart (is_out = false).
     *
     * @return Attribute<float, never>
     */
    protected function price(): Attribute
    {
        return Attribute::get(fn (): float => (float) $this->products()
            ->wherePivot('is_out', false)
            ->sum(DB::raw('cart_items.quantity * products.price')));
    }

    /**
     * OWNS: the owner of this cart.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * CONTAINS: products in this cart.
     *
     * @return BelongsToMany<Product, $this>
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'cart_items', 'cart_id', 'product_id')
            ->withPivot('quantity', 'is_out');
    }

    /**
     * CHECKOUT: orders created from this cart.
     *
     * @return HasMany<Summary, $this>
     */
    public function summaries(): HasMany
    {
        return $this->hasMany(Summary::class, 'cart_id', 'cart_id');
    }
}
