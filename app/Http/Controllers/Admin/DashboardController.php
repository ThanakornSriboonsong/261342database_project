<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Summary;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public const LOW_STOCK = 5;

    public function __invoke(Request $request): Response
    {
        $today = Summary::whereDate('order_date', today());
        $thisMonth = Summary::where('order_date', '>=', now()->startOfMonth());

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'today_revenue' => (float) (clone $today)->sum('final_price'),
                'today_orders' => (clone $today)->count(),
                'month_revenue' => (float) (clone $thisMonth)->sum('final_price'),
                'month_orders' => (clone $thisMonth)->count(),
                'members' => User::where('is_admin', false)->count(),
                'new_members_this_month' => User::where('is_admin', false)->where('created_at', '>=', now()->startOfMonth())->count(),
                'low_stock_count' => Product::where('stock', '<=', self::LOW_STOCK)->count(),
            ],
            'salesByMonth' => $this->salesByMonth(12),
            'topProducts' => DB::table('summary_items')
                ->join('products', 'products.product_id', '=', 'summary_items.product_id')
                ->groupBy('products.product_id', 'products.name')
                ->orderByDesc('quantity')
                ->limit(5)
                ->get([
                    'products.product_id',
                    'products.name',
                    DB::raw('SUM(summary_items.quantity) as quantity'),
                    DB::raw('SUM(summary_items.quantity * summary_items.unit_price) as revenue'),
                ])
                ->map(fn ($row) => [
                    'product_id' => (int) $row->product_id,
                    'name' => $row->name,
                    'quantity' => (int) $row->quantity,
                    'revenue' => round((float) $row->revenue, 2),
                ]),
            'lowStock' => Product::where('stock', '<=', self::LOW_STOCK)
                ->orderBy('stock')
                ->limit(10)
                ->get(['product_id', 'name', 'stock'])
                ->map(fn (Product $product) => [
                    'product_id' => (int) $product->product_id,
                    'name' => $product->name,
                    'stock' => (int) $product->stock,
                ]),
            'recentOrders' => Summary::with('cart.user:user_id,name')
                ->latest('order_date')
                ->limit(5)
                ->get()
                ->map(fn (Summary $summary) => [
                    'summary_id' => (int) $summary->summary_id,
                    'order_date' => $summary->order_date->toIso8601String(),
                    'customer' => $summary->cart->user->name,
                    'final_price' => (float) $summary->final_price,
                ]),
        ]);
    }

    /**
     * Revenue and order count per month for the last $months months, oldest first, empty months as 0.
     *
     * @return list<array{month: string, revenue: float, orders: int}>
     */
    private function salesByMonth(int $months): array
    {
        $from = now()->startOfMonth()->subMonths($months - 1);

        $rows = Summary::where('order_date', '>=', $from)
            ->selectRaw("DATE_FORMAT(order_date, '%Y-%m') as month, SUM(final_price) as revenue, COUNT(*) as orders")
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $series = [];

        // Dates are immutable in this app (AppServiceProvider), so reassign on every step.
        for ($date = $from; $date->lte(now()); $date = $date->addMonth()) {
            $key = $date->format('Y-m');
            $series[] = [
                'month' => $key,
                'revenue' => round((float) ($rows[$key]->revenue ?? 0), 2),
                'orders' => (int) ($rows[$key]->orders ?? 0),
            ];
        }

        return $series;
    }
}
