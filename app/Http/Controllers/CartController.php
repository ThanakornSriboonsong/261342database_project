<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\User;
use App\Services\PromotionCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The member's cart.
 *
 * cart_items.is_out = true means "keep in cart but don't buy now": it is left out
 * of the price and out of checkout. Checkout removes the items it bought.
 *
 * The applied promotion code lives in the session under "cart.promotion_id".
 */
class CartController extends Controller
{
    public const PROMOTION_SESSION_KEY = 'cart.promotion_id';

    public function __construct(private PromotionCalculator $calculator) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $cart = $this->cartFor($user);
        $products = $cart->products()->orderBy('name')->get();
        $selected = $products->reject(fn (Product $product) => (bool) $product->pivot->is_out);
        $promotion = $this->currentPromotion($request);

        return Inertia::render('cart/index', [
            'items' => $products->map(fn (Product $product) => [
                'product_id' => (int) $product->product_id,
                'name' => $product->name,
                'image_url' => $product->image_url,
                'price' => (float) $product->price,
                'stock' => (int) $product->stock,
                'quantity' => (int) $product->pivot->quantity,
                'is_out' => (bool) $product->pivot->is_out,
                'line_total' => round((float) $product->price * $product->pivot->quantity, 2),
            ])->values(),
            'summary' => $this->calculator->summarize($this->calculator->lines($selected), $promotion),
            'promotion' => $promotion ? [
                'code' => $promotion->code,
                'name' => $promotion->name,
                'type' => $promotion->type,
            ] : null,
        ]);
    }

    /**
     * Add a product, or add more of one that is already in the cart.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,product_id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:99'],
        ]);

        $product = Product::findOrFail($data['product_id']);
        $cart = $this->cartFor($request->user());
        $inCart = $cart->products()->whereKey($product->getKey())->first();
        $quantity = ($inCart ? (int) $inCart->pivot->quantity : 0) + ($data['quantity'] ?? 1);

        $this->ensureInStock($product, $quantity);

        if ($inCart) {
            $cart->products()->updateExistingPivot($product->getKey(), ['quantity' => $quantity, 'is_out' => false]);
        } else {
            $cart->products()->attach($product->getKey(), ['quantity' => $quantity, 'is_out' => false]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name added to cart.', ['name' => $product->name])]);

        return back();
    }

    /**
     * Change the quantity, or tick/untick an item for checkout.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'quantity' => ['sometimes', 'integer', 'min:1', 'max:99'],
            'is_out' => ['sometimes', 'boolean'],
        ]);

        $cart = $this->cartFor($request->user());
        abort_unless($cart->products()->whereKey($product->getKey())->exists(), 404);

        if (isset($data['quantity'])) {
            $this->ensureInStock($product, $data['quantity']);
        }

        if ($data !== []) {
            $cart->products()->updateExistingPivot($product->getKey(), $data);
        }

        return back();
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $this->cartFor($request->user())->products()->detach($product->getKey());

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name removed from cart.', ['name' => $product->name])]);

        return back();
    }

    /**
     * Apply a promotion code to the cart.
     */
    public function applyPromotion(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50'],
        ]);

        $user = $request->user();
        $promotion = Promotion::with('products', 'discount', 'buyGet', 'tier')->firstWhere('code', $data['code']);

        if ($promotion === null) {
            throw ValidationException::withMessages(['code' => __('This code does not exist.')]);
        }

        if ($reason = $this->calculator->unusableReason($promotion, $user)) {
            throw ValidationException::withMessages(['code' => $reason]);
        }

        $selected = $this->cartFor($user)->products()->wherePivot('is_out', false)->get();

        if ($this->calculator->discountFor($promotion, $this->calculator->lines($selected)) <= 0) {
            throw ValidationException::withMessages(['code' => __('This code does not apply to the items in your cart.')]);
        }

        $request->session()->put(self::PROMOTION_SESSION_KEY, $promotion->getKey());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Code :code applied.', ['code' => $promotion->code])]);

        return back();
    }

    public function removePromotion(Request $request): RedirectResponse
    {
        $request->session()->forget(self::PROMOTION_SESSION_KEY);

        return back();
    }

    /**
     * The user's cart, created on first use.
     */
    public static function cartFor(User $user): Cart
    {
        return $user->cart()->firstOrCreate();
    }

    /**
     * The promotion in the session, if it still exists and the user can still use it.
     */
    private function currentPromotion(Request $request): ?Promotion
    {
        $promotionId = $request->session()->get(self::PROMOTION_SESSION_KEY);
        $promotion = $promotionId ? Promotion::with('products', 'discount', 'buyGet', 'tier')->find($promotionId) : null;

        if ($promotion && $this->calculator->unusableReason($promotion, $request->user()) === null) {
            return $promotion;
        }

        $request->session()->forget(self::PROMOTION_SESSION_KEY);

        return null;
    }

    private function ensureInStock(Product $product, int $quantity): void
    {
        if ($quantity > $product->stock) {
            throw ValidationException::withMessages([
                'quantity' => $product->stock > 0
                    ? __('Only :stock of :name left.', ['stock' => $product->stock, 'name' => $product->name])
                    : __(':name is out of stock.', ['name' => $product->name]),
            ]);
        }
    }
}
