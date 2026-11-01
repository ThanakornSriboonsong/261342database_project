<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PresentsShopData;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    use PresentsShopData;

    /**
     * Landing page: newest products, best rated products and running promotions.
     */
    public function __invoke(Request $request): Response
    {
        $userId = $request->user()?->getKey();

        $query = fn () => Product::query()
            ->withAvg('comments', 'star')
            ->withCount('comments')
            ->when($userId, fn ($query) => $query->withExists([
                'wishedBy as is_wished' => fn ($query) => $query->where('wishlists.user_id', $userId),
            ]));

        return Inertia::render('welcome', [
            'newProducts' => $query()->latest('product_id')->take(8)->get()
                ->map(fn (Product $product) => $this->productCard($product)),
            'topRated' => $query()->has('comments')->orderByDesc('comments_avg_star')->take(4)->get()
                ->map(fn (Product $product) => $this->productCard($product)),
            // Codes limited to a tier stay hidden here; members see them on their own pages.
            'promotions' => Promotion::query()
                ->whereNull('tier_id')
                ->whereDate('start_date', '<=', today())
                ->whereDate('end_date', '>=', today())
                ->orderBy('end_date')
                ->get()
                ->map(fn (Promotion $promotion) => $this->promotionSummary($promotion)),
        ]);
    }
}
