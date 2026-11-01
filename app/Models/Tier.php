<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $tier_id
 * @property string $name
 * @property string $min_spent
 */
#[Table(key: 'tier_id', timestamps: false)]
#[Fillable(['name', 'min_spent'])]
class Tier extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'min_spent' => 'decimal:2',
        ];
    }

    /**
     * BELONGS_TO: users in this tier.
     *
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'tier_id', 'tier_id');
    }

    /**
     * OFFERS: promotions offered to this tier.
     *
     * @return HasMany<Promotion, $this>
     */
    public function promotions(): HasMany
    {
        return $this->hasMany(Promotion::class, 'tier_id', 'tier_id');
    }
}
