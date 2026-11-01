<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Summary;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The member's order history (orders are stored in "summaries").
 */
class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = $request->user()->summaries()
            ->withCount('products')
            ->with('promotion:promotion_id,code')
            ->orderByDesc('summaries.order_date')
            ->paginate(10)
            ->through(fn (Summary $summary) => [
                'summary_id' => (int) $summary->summary_id,
                'order_date' => $summary->order_date->toIso8601String(),
                'items_count' => (int) $summary->products_count,
                'total_price' => (float) $summary->total_price,
                'discount_amount' => (float) $summary->discount_amount,
                'final_price' => (float) $summary->final_price,
                'promotion_code' => $summary->promotion?->code,
            ]);

        return Inertia::render('orders/index', [
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, Summary $summary): Response
    {
        // Someone else's order looks the same as one that doesn't exist.
        abort_unless((int) $summary->cart()->value('user_id') === $request->user()->getKey(), 404);

        $summary->load('products', 'promotion');

        return Inertia::render('orders/show', [
            'order' => [
                'summary_id' => (int) $summary->summary_id,
                'order_date' => $summary->order_date->toIso8601String(),
                'shipping_address' => $summary->shipping_address,
                'total_price' => (float) $summary->total_price,
                'discount_amount' => (float) $summary->discount_amount,
                'final_price' => (float) $summary->final_price,
                'promotion' => $summary->promotion
                    ? ['code' => $summary->promotion->code, 'name' => $summary->promotion->name]
                    : null,
                // unit_price is the price when the order was placed, not today's price.
                'items' => $summary->products->map(fn (Product $product) => [
                    'product_id' => (int) $product->product_id,
                    'name' => $product->name,
                    'image_url' => $product->image_url,
                    'quantity' => (int) $product->pivot->quantity,
                    'unit_price' => (float) $product->pivot->unit_price,
                    'line_total' => round((float) $product->pivot->unit_price * $product->pivot->quantity, 2),
                ])->values(),
            ],
        ]);
    }
}
