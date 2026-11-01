<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Summary;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Sales between two dates: totals, a day/month series, best sellers and promotion usage.
 */
class SalesReportController extends Controller
{
    public function index(Request $request): Response
    {
        [$from, $to, $groupBy] = $this->filters($request);
        $orders = $this->orders($from, $to);

        $totals = (clone $orders)->selectRaw(
            'COUNT(*) as orders, COALESCE(SUM(total_price), 0) as gross, COALESCE(SUM(discount_amount), 0) as discount, COALESCE(SUM(final_price), 0) as revenue'
        )->first();

        $itemsSold = (int) DB::table('summary_items')
            ->whereIn('summary_id', (clone $orders)->select('summary_id'))
            ->sum('quantity');

        $ordersCount = (int) $totals->orders;

        return Inertia::render('admin/sales-report', [
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'group_by' => $groupBy,
            ],
            'totals' => [
                'orders' => $ordersCount,
                'items_sold' => $itemsSold,
                'gross' => round((float) $totals->gross, 2),
                'discount' => round((float) $totals->discount, 2),
                'revenue' => round((float) $totals->revenue, 2),
                'average_order' => $ordersCount > 0 ? round((float) $totals->revenue / $ordersCount, 2) : 0.0,
            ],
            'series' => $this->series($orders, $from, $to, $groupBy),
            'byProduct' => DB::table('summary_items')
                ->join('products', 'products.product_id', '=', 'summary_items.product_id')
                ->whereIn('summary_items.summary_id', (clone $orders)->select('summary_id'))
                ->groupBy('products.product_id', 'products.name')
                ->orderByDesc('revenue')
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
            'byPromotion' => (clone $orders)
                ->join('promotions', 'promotions.promotion_id', '=', 'summaries.promotion_id')
                ->groupBy('promotions.promotion_id', 'promotions.code', 'promotions.name')
                ->orderByDesc('orders')
                ->get([
                    'promotions.promotion_id',
                    'promotions.code',
                    'promotions.name',
                    DB::raw('COUNT(*) as orders'),
                    DB::raw('SUM(summaries.discount_amount) as discount'),
                ])
                ->map(fn ($row) => [
                    'promotion_id' => (int) $row->promotion_id,
                    'code' => $row->code,
                    'name' => $row->name,
                    'orders' => (int) $row->orders,
                    'discount' => round((float) $row->discount, 2),
                ]),
        ]);
    }

    /**
     * Download the orders in the range as CSV (opens in Excel / Google Sheets).
     */
    public function export(Request $request): StreamedResponse
    {
        [$from, $to] = $this->filters($request);

        $orders = $this->orders($from, $to)
            ->with('cart.user:user_id,name,email', 'promotion:promotion_id,code')
            ->orderBy('order_date')
            ->get();

        $filename = "sales-{$from->toDateString()}-to-{$to->toDateString()}.csv";

        return response()->streamDownload(function () use ($orders) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // BOM so Excel reads Thai text correctly
            fputcsv($out, ['order_id', 'order_date', 'customer', 'email', 'total_price', 'discount_amount', 'final_price', 'promotion_code']);

            foreach ($orders as $summary) {
                fputcsv($out, [
                    $summary->summary_id,
                    $summary->order_date->toDateTimeString(),
                    $summary->cart->user->name,
                    $summary->cart->user->email,
                    $summary->total_price,
                    $summary->discount_amount,
                    $summary->final_price,
                    $summary->promotion?->code,
                ]);
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable, 2: string}
     */
    private function filters(Request $request): array
    {
        $data = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'group_by' => ['nullable', 'in:day,month'],
        ]);

        return [
            CarbonImmutable::parse($data['from'] ?? now()->startOfMonth())->startOfDay(),
            CarbonImmutable::parse($data['to'] ?? now())->endOfDay(),
            $data['group_by'] ?? 'day',
        ];
    }

    /**
     * @return Builder<Summary>
     */
    private function orders(CarbonImmutable $from, CarbonImmutable $to): Builder
    {
        return Summary::query()->whereBetween('summaries.order_date', [$from, $to]);
    }

    /**
     * One row per day (or month) in the range, empty ones as 0.
     *
     * @param  Builder<Summary>  $orders
     * @return list<array{period: string, revenue: float, orders: int}>
     */
    private function series(Builder $orders, CarbonImmutable $from, CarbonImmutable $to, string $groupBy): array
    {
        $format = $groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';

        $rows = (clone $orders)
            ->selectRaw("DATE_FORMAT(order_date, '{$format}') as period, SUM(final_price) as revenue, COUNT(*) as orders")
            ->groupBy('period')
            ->get()
            ->keyBy('period');

        $series = [];
        $date = $groupBy === 'month' ? $from->startOfMonth() : $from->startOfDay();

        // Reassign on every step: dates may be immutable (AppServiceProvider uses CarbonImmutable).
        for (; $date->lte($to); $date = $groupBy === 'month' ? $date->addMonth() : $date->addDay()) {
            $key = $date->format($groupBy === 'month' ? 'Y-m' : 'Y-m-d');
            $series[] = [
                'period' => $key,
                'revenue' => round((float) ($rows[$key]->revenue ?? 0), 2),
                'orders' => (int) ($rows[$key]->orders ?? 0),
            ];
        }

        return $series;
    }
}
