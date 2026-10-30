<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $promotion_id
 * @property int|null $tier_id
 * @property string $name
 * @property string $code
 * @property string $type
 * @property Carbon $start_date
 * @property Carbon $end_date
 */
#[Table(key: 'promotion_id', timestamps: false)]
#[Fillable(['tier_id', 'name', 'code', 'type', 'start_date', 'end_date'])]
class Promotion extends Model
{
    const TYPE_DISCOUNT = 'discount';

    const TYPE_BUY_GET = 'buy_get';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    /**
     * OFFERS: the tier this promotion is limited to, if any.
     *
     * @return BelongsTo<Tier, $this>
     */
    public function tier(): BelongsTo
    {
        return $this->belongsTo(Tier::class, 'tier_id', 'tier_id');
    }

    /**
     * APPLIES_TO: products covered by this promotion.
     *
     * @return BelongsToMany<Product, $this>
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'promotion_products', 'promotion_id', 'product_id');
    }

    /**
     * USED_IN: orders that used this promotion.
     *
     * @return HasMany<Summary, $this>
     */
    public function summaries(): HasMany
    {
        return $this->hasMany(Summary::class, 'promotion_id', 'promotion_id');
    }

    /**
     * Subclass details when type is "discount".
     *
     * @return HasOne<Discount, $this>
     */
    public function discount(): HasOne
    {
        return $this->hasOne(Discount::class, 'promotion_id', 'promotion_id');
    }

    /**
     * Subclass details when type is "buy_get".
     *
     * @return HasOne<BuyGet, $this>
     */
    public function buyGet(): HasOne
    {
        return $this->hasOne(BuyGet::class, 'promotion_id', 'promotion_id');
    }
}
