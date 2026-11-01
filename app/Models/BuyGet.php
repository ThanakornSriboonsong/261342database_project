<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $promotion_id
 * @property int $buy_qty
 * @property int $get_qty
 */
#[Table(name: 'buy_gets', key: 'promotion_id', incrementing: false, timestamps: false)]
#[Fillable(['promotion_id', 'buy_qty', 'get_qty'])]
class BuyGet extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'buy_qty' => 'integer',
            'get_qty' => 'integer',
        ];
    }

    /**
     * The parent promotion (superclass).
     *
     * @return BelongsTo<Promotion, $this>
     */
    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class, 'promotion_id', 'promotion_id');
    }
}
