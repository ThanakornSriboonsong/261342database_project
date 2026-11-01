<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $product_id
 * @property string $name
 * @property string|null $detail
 * @property string $price
 * @property int $stock
 * @property string|null $image_url
 * @property-read float|null $star
 */
#[Table(key: 'product_id', timestamps: false)]
#[Fillable(['name', 'detail', 'price', 'stock', 'image_url'])]
class Product extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock' => 'integer',
        ];
    }

    /**
     * Derived attribute: average star rating from comments (null when there are none).
     *
     * For lists of products, prefer Product::withAvg('comments', 'star') to avoid one query per product.
     *
     * @return Attribute<float|null, never>
     */
    protected function star(): Attribute
    {
        return Attribute::get(function (): ?float {
            $average = $this->comments()->avg('star');

            return $average === null ? null : round((float) $average, 1);
        });
    }

    /**
     * HAS: comments about this product.
     *
     * @return HasMany<Comment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'product_id', 'product_id');
    }

    /**
     * WISHES: users who have this product on their wishlist.
     *
     * @return BelongsToMany<User, $this>
     */
    public function wishedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'wishlists', 'product_id', 'user_id')
            ->withPivot('added_at');
    }

    /**
     * CONTAINS: carts holding this product.
     *
     * @return BelongsToMany<Cart, $this>
     */
    public function carts(): BelongsToMany
    {
        return $this->belongsToMany(Cart::class, 'cart_items', 'product_id', 'cart_id')
            ->withPivot('quantity', 'is_out');
    }

    /**
     * INCLUDES: orders that include this product.
     *
     * @return BelongsToMany<Summary, $this>
     */
    public function summaries(): BelongsToMany
    {
        return $this->belongsToMany(Summary::class, 'summary_items', 'product_id', 'summary_id')
            ->withPivot('quantity', 'unit_price');
    }

    /**
     * APPLIES_TO: promotions that apply to this product.
     *
     * @return BelongsToMany<Promotion, $this>
     */
    public function promotions(): BelongsToMany
    {
        return $this->belongsToMany(Promotion::class, 'promotion_products', 'product_id', 'promotion_id');
    }
}
