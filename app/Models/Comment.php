<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $comment_id
 * @property int $user_id
 * @property int $product_id
 * @property string $comment
 * @property int $star
 * @property Carbon|null $created_at
 */
#[Table(key: 'comment_id')]
#[Fillable(['user_id', 'product_id', 'comment', 'star'])]
class Comment extends Model
{
    /**
     * The comments table only has created_at.
     */
    const UPDATED_AT = null;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'star' => 'integer',
        ];
    }

    /**
     * WRITES: the author of this comment.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * HAS: the product this comment is about.
     *
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
