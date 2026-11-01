<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $promotion_id
 * @property string $percent
 * @property string|null $max_discount
 */
#[Table(key: 'promotion_id', incrementing: false, timestamps: false)]
#[Fillable(['promotion_id', 'percent', 'max_discount'])]
class Discount extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'percent' => 'decimal:2',
            'max_discount' => 'decimal:2',
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
