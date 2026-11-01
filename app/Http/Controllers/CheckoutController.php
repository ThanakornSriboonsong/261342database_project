<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Promotion;
use App\Models\Summary;
use App\Models\Tier;
use App\Models\User;
use App\Services\PromotionCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Review the selected cart items and place the order.
 */
class CheckoutController extends Controller
{
    public function __construct(private PromotionCalculator $calculator) {}

    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $selected = CartController::cartFor($user)->products()->wherePivot('is_out', false)->orderBy('name')->get();

        if ($selected->isEmpty()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Pick at least one item to check out.')]);

            return to_route('cart.index');
        }

        $promotion = $this->promotionFromSession($request);

        return Inertia::render('checkout/create', [
            'items' => $selected->map(fn (Product $product) => [
                'product_id' => (int) $product->product_id,
                'name' => $product->name,
                'image_url' => $product->image_url,
                'price' => (float) $product->price,
                'quantity' => (int) $product->pivot->quantity,
                'line_total' => round((float) $product->price * $product->pivot->quantity, 2),
            ])->values(),
            'summary' => $this->calculator->summarize($this->calculator->lines($selected), $promotion),
            'promotion' => $promotion ? ['code' => $promotion->code, 'name' => $promotion->name] : null,
            'shippingAddress' => $user->address,
        ]);
    }

    /**
     * Turn the selected cart items into a summary (order).
     *
     * Runs in one transaction: prices and stock are read with a row lock, the price at
     * the time of ordering goes into summary_items.unit_price, stock is reduced, the bought
     * items leave the cart, and the member's total_spent / tier are updated.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'shipping_address' => ['required', 'string', 'max:1000'],
        ]);

        $user = $request->user();
        $cart = CartController::cartFor($user);
        $promotion = $this->promotionFromSession($request);

        $summary = DB::transaction(function () use ($cart, $user, $promotion, $data): Summary {
            $selected = $cart->products()->wherePivot('is_out', false)->lockForUpdate()->get();

            if ($selected->isEmpty()) {
                throw ValidationException::withMessages(['cart' => __('Your cart is empty.')]);
            }

            foreach ($selected as $product) {
                if ($product->pivot->quantity > $product->stock) {
                    throw ValidationException::withMessages([
                        'cart' => __('Only :stock of :name left. Please update your cart.', [
                            'stock' => $product->stock,
                            'name' => $product->name,
                        ]),
                    ]);
                }
            }

            $lines = $this->calculator->lines($selected);
            $totals = $this->calculator->summarize($lines, $promotion);

            $summary = Summary::create([
                'cart_id' => $cart->getKey(),
                'promotion_id' => $totals['discount'] > 0 ? $promotion?->getKey() : null,
                'total_price' => $totals['subtotal'],
                'discount_amount' => $totals['discount'],
                'final_price' => $totals['total'],
                'shipping_address' => $data['shipping_address'],
            ]);

            $summary->products()->attach($lines->mapWithKeys(fn (array $line) => [
                $line['product_id'] => ['quantity' => $line['quantity'], 'unit_price' => $line['unit_price']],
            ])->all());

            foreach ($selected as $product) {
                $product->decrement('stock', $product->pivot->quantity);
            }

            $cart->products()->detach($selected->modelKeys());

            $this->recordSpending($user, $totals['total']);

            return $summary;
        });

        $request->session()->forget(CartController::PROMOTION_SESSION_KEY);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Order #:id placed.', ['id' => $summary->getKey()])]);

        return to_route('orders.show', $summary);
    }

    /**
     * Add the order to total_spent and move the member to the highest tier they reached.
     *
     * total_spent and tier_id are not fillable on purpose, so they are set directly.
     */
    private function recordSpending(User $user, float $amount): void
    {
        $user->total_spent = round((float) $user->total_spent + $amount, 2);

        $user->tier_id = Tier::where('min_spent', '<=', $user->total_spent)
            ->orderByDesc('min_spent')
            ->value('tier_id') ?? $user->tier_id;

        $user->save();
    }

    /**
     * The promotion applied on the cart page, checked again in case it expired.
     */
    private function promotionFromSession(Request $request): ?Promotion
    {
        $promotionId = $request->session()->get(CartController::PROMOTION_SESSION_KEY);

        if ($promotionId === null) {
            return null;
        }

        $promotion = Promotion::with('products', 'discount', 'buyGet', 'tier')->find($promotionId);
        $reason = $promotion ? $this->calculator->unusableReason($promotion, $request->user()) : __('This code no longer exists.');

        if ($reason !== null) {
            $request->session()->forget(CartController::PROMOTION_SESSION_KEY);

            throw ValidationException::withMessages(['code' => $reason]);
        }

        return $promotion;
    }
}
