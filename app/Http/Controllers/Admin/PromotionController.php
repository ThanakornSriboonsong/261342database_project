<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Tier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Promotion codes. Each promotion is one row in "promotions" plus one row in
 * "discounts" or "buy_gets" (disjoint specialization), always written together.
 */
class PromotionController extends Controller
{
    public function index(): Response
    {
        $promotions = Promotion::with('tier:tier_id,name', 'discount', 'buyGet')
            ->withCount('products', 'summaries')
            ->orderByDesc('end_date')
            ->get()
            ->map(fn (Promotion $promotion) => [
                ...$this->present($promotion),
                'products_count' => (int) $promotion->products_count,
                'used_count' => (int) $promotion->summaries_count,
            ]);

        return Inertia::render('admin/promotions/index', [
            'promotions' => $promotions,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/promotions/create', $this->formOptions());
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        DB::transaction(function () use ($data) {
            $promotion = Promotion::create($data['promotion']);
            $this->saveDetails($promotion, $data);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Promotion :code created.', ['code' => $data['promotion']['code']])]);

        return to_route('admin.promotions.index');
    }

    public function edit(Promotion $promotion): Response
    {
        $promotion->load('tier', 'discount', 'buyGet', 'products:product_id');

        return Inertia::render('admin/promotions/edit', [
            ...$this->formOptions(),
            'promotion' => [
                ...$this->present($promotion),
                'tier_id' => $promotion->tier_id,
                'product_ids' => $promotion->products->pluck('product_id')->map(fn ($id) => (int) $id)->values(),
            ],
        ]);
    }

    public function update(Request $request, Promotion $promotion): RedirectResponse
    {
        $data = $this->validated($request, $promotion);

        DB::transaction(function () use ($promotion, $data) {
            $promotion->update($data['promotion']);
            $this->saveDetails($promotion, $data);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Promotion :code updated.', ['code' => $promotion->code])]);

        return to_route('admin.promotions.index');
    }

    public function destroy(Promotion $promotion): RedirectResponse
    {
        // Past orders keep their amounts; summaries.promotion_id becomes null.
        $promotion->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Promotion :code deleted.', ['code' => $promotion->code])]);

        return to_route('admin.promotions.index');
    }

    /**
     * Write the subtype row that matches "type", drop the other one, and sync products.
     *
     * @param  array<string, mixed>  $data
     */
    private function saveDetails(Promotion $promotion, array $data): void
    {
        if ($promotion->type === Promotion::TYPE_DISCOUNT) {
            $promotion->buyGet()->delete();
            $promotion->discount()->updateOrCreate([], [
                'percent' => $data['percent'],
                'max_discount' => $data['max_discount'] ?? null,
            ]);
        } else {
            $promotion->discount()->delete();
            $promotion->buyGet()->updateOrCreate([], [
                'buy_qty' => $data['buy_qty'],
                'get_qty' => $data['get_qty'],
            ]);
        }

        // No products = the promotion applies to every product.
        $promotion->products()->sync($data['product_ids'] ?? []);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Promotion $promotion = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'alpha_dash', Rule::unique('promotions', 'code')->ignore($promotion?->getKey(), 'promotion_id')],
            'type' => ['required', Rule::in([Promotion::TYPE_DISCOUNT, Promotion::TYPE_BUY_GET])],
            'tier_id' => ['nullable', 'exists:tiers,tier_id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'percent' => ['required_if:type,discount', 'nullable', 'numeric', 'min:0.01', 'max:100'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'buy_qty' => ['required_if:type,buy_get', 'nullable', 'integer', 'min:1'],
            'get_qty' => ['required_if:type,buy_get', 'nullable', 'integer', 'min:1'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', 'exists:products,product_id'],
        ]);

        $data['promotion'] = [
            'name' => $data['name'],
            'code' => strtoupper($data['code']),
            'type' => $data['type'],
            'tier_id' => $data['tier_id'] ?? null,
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
        ];

        return $data;
    }

    /**
     * Tiers and products for the form's dropdown / checkboxes.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'tiers' => Tier::orderBy('min_spent')->get(['tier_id', 'name']),
            'products' => Product::orderBy('name')->get(['product_id', 'name']),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Promotion $promotion): array
    {
        $today = today();

        return [
            'promotion_id' => (int) $promotion->promotion_id,
            'name' => $promotion->name,
            'code' => $promotion->code,
            'type' => $promotion->type,
            'tier' => $promotion->tier?->name,
            'start_date' => $promotion->start_date->toDateString(),
            'end_date' => $promotion->end_date->toDateString(),
            'status' => match (true) {
                $promotion->start_date->gt($today) => 'scheduled',
                $promotion->end_date->lt($today) => 'expired',
                default => 'active',
            },
            'percent' => $promotion->discount ? (float) $promotion->discount->percent : null,
            'max_discount' => $promotion->discount?->max_discount !== null ? (float) $promotion->discount->max_discount : null,
            'buy_qty' => $promotion->buyGet?->buy_qty,
            'get_qty' => $promotion->buyGet?->get_qty,
        ];
    }
}
