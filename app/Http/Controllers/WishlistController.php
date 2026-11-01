<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\PresentsShopData;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    use PresentsShopData;

    public function index(Request $request): Response
    {
        $products = $request->user()->wishlist()
            ->withAvg('comments', 'star')
            ->withCount('comments')
            ->orderByPivot('added_at', 'desc')
            ->get()
            ->map(fn (Product $product) => [
                ...$this->productCard($product),
                'is_wished' => true,
                'added_at' => $product->pivot->added_at,
            ]);

        return Inertia::render('wishlist/index', [
            'products' => $products,
        ]);
    }

    public function store(Request $request, Product $product): RedirectResponse
    {
        // added_at is filled in by the database.
        $request->user()->wishlist()->syncWithoutDetaching([$product->getKey()]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name added to wishlist.', ['name' => $product->name])]);

        return back();
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $request->user()->wishlist()->detach($product->getKey());

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name removed from wishlist.', ['name' => $product->name])]);

        return back();
    }
}
