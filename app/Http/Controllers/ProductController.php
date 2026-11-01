<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PresentsShopData;
use App\Models\Comment;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    use PresentsShopData;

    /**
     * Public product list with search and sorting.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'in:newest,price_asc,price_desc,rating'],
            'in_stock' => ['nullable', 'boolean'],
        ]);

        $sort = $filters['sort'] ?? 'newest';

        $products = $this->cardQuery($request)
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query
                ->where(fn (Builder $query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('detail', 'like', "%{$search}%")))
            ->when($request->boolean('in_stock'), fn (Builder $query) => $query->where('stock', '>', 0))
            ->when($sort === 'price_asc', fn (Builder $query) => $query->orderBy('price'))
            ->when($sort === 'price_desc', fn (Builder $query) => $query->orderByDesc('price'))
            ->when($sort === 'rating', fn (Builder $query) => $query->orderByDesc('comments_avg_star'))
            ->orderByDesc('product_id')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Product $product) => $this->productCard($product));

        return Inertia::render('products/index', [
            'products' => $products,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'sort' => $sort,
                'in_stock' => $request->boolean('in_stock'),
            ],
        ]);
    }

    /**
     * Product detail page with reviews and active promotions.
     */
    public function show(Request $request, Product $product): Response
    {
        $product = $this->cardQuery($request)->whereKey($product->getKey())->firstOrFail();

        $comments = $product->comments()
            ->with('user:user_id,name')
            ->latest('created_at')
            ->get()
            ->map(fn (Comment $comment) => [
                'comment_id' => (int) $comment->comment_id,
                'user_id' => (int) $comment->user_id,
                'user_name' => $comment->user->name,
                'star' => $comment->star,
                'comment' => $comment->comment,
                'created_at' => $comment->created_at->toIso8601String(),
                'can_edit' => $request->user()?->getKey() === (int) $comment->user_id,
            ]);

        $promotions = $product->promotions()
            ->whereDate('start_date', '<=', today())
            ->whereDate('end_date', '>=', today())
            ->with('discount', 'buyGet', 'tier')
            ->get()
            ->map(fn (Promotion $promotion) => $this->promotionSummary($promotion));

        return Inertia::render('products/show', [
            'product' => [
                ...$this->productCard($product),
                'detail' => $product->detail,
            ],
            'comments' => $comments,
            'promotions' => $promotions,
            'starCounts' => $product->comments()
                ->selectRaw('star, count(*) as total')
                ->groupBy('star')
                ->pluck('total', 'star')
                ->map(fn ($total) => (int) $total),
        ]);
    }

    /**
     * Products with average star, review count and whether the current user wished for it.
     *
     * @return Builder<Product>
     */
    private function cardQuery(Request $request): Builder
    {
        $userId = $request->user()?->getKey();

        return Product::query()
            ->withAvg('comments', 'star')
            ->withCount('comments')
            ->when($userId, fn (Builder $query) => $query->withExists([
                'wishedBy as is_wished' => fn (Builder $query) => $query->where('wishlists.user_id', $userId),
            ]));
    }
}
