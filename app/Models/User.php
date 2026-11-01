<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $user_id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string|null $address
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string $total_spent
 * @property int|null $tier_id
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Table(key: 'user_id')]
#[Fillable(['name', 'email', 'phone', 'address', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'total_spent' => 'decimal:2',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Use "user_id" (not "user_user_id") as the foreign key for relations that don't name one, e.g. passkeys.
     */
    public function getForeignKey(): string
    {
        return $this->getKeyName();
    }

    /**
     * BELONGS_TO: the membership tier of the user.
     *
     * @return BelongsTo<Tier, $this>
     */
    public function tier(): BelongsTo
    {
        return $this->belongsTo(Tier::class, 'tier_id', 'tier_id');
    }

    /**
     * OWNS: the user's shopping cart.
     *
     * @return HasOne<Cart, $this>
     */
    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class, 'user_id', 'user_id');
    }

    /**
     * WRITES: comments written by the user.
     *
     * @return HasMany<Comment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'user_id', 'user_id');
    }

    /**
     * WISHES: products on the user's wishlist.
     *
     * @return BelongsToMany<Product, $this>
     */
    public function wishlist(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'wishlists', 'user_id', 'product_id')
            ->withPivot('added_at');
    }

    /**
     * Orders (summaries) checked out from the user's cart.
     *
     * @return HasManyThrough<Summary, Cart, $this>
     */
    public function summaries(): HasManyThrough
    {
        return $this->hasManyThrough(Summary::class, Cart::class, 'user_id', 'cart_id', 'user_id', 'cart_id');
    }
}
