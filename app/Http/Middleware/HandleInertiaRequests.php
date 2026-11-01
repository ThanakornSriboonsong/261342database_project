<?php

namespace App\Http\Middleware;

use App\Models\Tier;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            // Total quantity in the cart, for the navbar badge. Lazy, so it only runs when sent.
            // Queried directly so a cart created earlier in the request is counted.
            'cartCount' => fn (): int => $request->user()
                ? (int) DB::table('cart_items')
                    ->join('carts', 'carts.cart_id', '=', 'cart_items.cart_id')
                    ->where('carts.user_id', $request->user()->getKey())
                    ->sum('cart_items.quantity')
                : 0,
            // Tier name, total spent and the next tier, for the account menu and profile page.
            'membership' => fn (): ?array => $request->user() ? $this->membership($request->user()) : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * @return array{tier: ?array{name: string, min_spent: float}, total_spent: float, next_tier: ?array{name: string, min_spent: float, remaining: float}}
     */
    private function membership(User $user): array
    {
        $totalSpent = (float) $user->total_spent;
        $next = Tier::where('min_spent', '>', $totalSpent)->orderBy('min_spent')->first();

        return [
            'tier' => $user->tier ? ['name' => $user->tier->name, 'min_spent' => (float) $user->tier->min_spent] : null,
            'total_spent' => $totalSpent,
            'next_tier' => $next ? [
                'name' => $next->name,
                'min_spent' => (float) $next->min_spent,
                'remaining' => round((float) $next->min_spent - $totalSpent, 2),
            ] : null,
        ];
    }
}
