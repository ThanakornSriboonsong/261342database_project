<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Summary;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Every customer's orders (summaries).
 */
class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $search = $filters['search'] ?? null;

        $orders = Summary::query()
            ->with('cart.user:user_id,name,email', 'promotion:promotion_id,code')
            ->withCount('products')
            ->when($search, fn (Builder $query) => $query->where(fn (Builder $query) => $query
                ->when(ctype_digit(ltrim($search, '#')), fn (Builder $query) => $query->where('summary_id', ltrim($search, '#')))
                ->orWhereHas('cart.user', fn (Builder $query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"))))
            ->when($filters['from'] ?? null, fn (Builder $query, string $from) => $query->whereDate('order_date', '>=', $from))
            ->when($filters['to'] ?? null, fn (Builder $query, string $to) => $query->whereDate('order_date', '<=', $to))
            ->latest('order_date')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Summary $summary) => [
                'summary_id' => (int) $summary->summary_id,
                'order_date' => $summary->order_date->toIso8601String(),
                'customer' => ['user_id' => (int) $summary->cart->user->user_id, 'name' => $summary->cart->user->name, 'email' => $summary->cart->user->email],
                'items_count' => (int) $summary->products_count,
                'total_price' => (float) $summary->total_price,
                'discount_amount' => (float) $summary->discount_amount,
                'final_price' => (float) $summary->final_price,
                'promotion_code' => $summary->promotion?->code,
            ]);

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => [
                'search' => $search ?? '',
                'from' => $filters['from'] ?? '',
                'to' => $filters['to'] ?? '',
            ],
        ]);
    }

    public function show(Summary $summary): Response
    {
        $summary->load('cart.user', 'products', 'promotion');
        $customer = $summary->cart->user;

        return Inertia::render('admin/orders/show', [
            'order' => [
                'summary_id' => (int) $summary->summary_id,
                'order_date' => $summary->order_date->toIso8601String(),
                'shipping_address' => $summary->shipping_address,
                'customer' => [
                    'user_id' => (int) $customer->user_id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                ],
                'total_price' => (float) $summary->total_price,
                'discount_amount' => (float) $summary->discount_amount,
                'final_price' => (float) $summary->final_price,
                'promotion' => $summary->promotion
                    ? ['code' => $summary->promotion->code, 'name' => $summary->promotion->name]
                    : null,
                'items' => $summary->products->map(fn (Product $product) => [
                    'product_id' => (int) $product->product_id,
                    'name' => $product->name,
                    'quantity' => (int) $product->pivot->quantity,
                    'unit_price' => (float) $product->pivot->unit_price,
                    'line_total' => round((float) $product->pivot->unit_price * $product->pivot->quantity, 2),
                ])->values(),
            ],
        ]);
    }
}
