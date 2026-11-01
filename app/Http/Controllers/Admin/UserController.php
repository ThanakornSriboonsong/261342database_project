<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tier;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Members list. Admins can change a member's tier and grant/remove admin rights.
 */
class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'tier_id' => ['nullable', 'integer'],
        ]);

        $users = User::query()
            ->with('tier:tier_id,name')
            ->withCount('summaries')
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")))
            ->when($filters['tier_id'] ?? null, fn (Builder $query, int $tierId) => $query->where('tier_id', $tierId))
            ->orderByDesc('total_spent')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user) => [
                'user_id' => (int) $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'total_spent' => (float) $user->total_spent,
                'tier' => $user->tier?->name,
                'tier_id' => $user->tier_id,
                'orders_count' => (int) $user->summaries_count,
                'is_admin' => (bool) $user->is_admin,
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'tiers' => Tier::orderBy('min_spent')->get(['tier_id', 'name']),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'tier_id' => $filters['tier_id'] ?? null,
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'is_admin' => ['sometimes', 'boolean'],
            'tier_id' => ['sometimes', 'nullable', 'exists:tiers,tier_id'],
        ]);

        if (array_key_exists('is_admin', $data) && ! $data['is_admin'] && $user->is($request->user())) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('You cannot remove your own admin rights.')]);

            return back();
        }

        // Neither field is fillable on purpose, so set them directly.
        foreach ($data as $field => $value) {
            $user->{$field} = $value;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name updated.', ['name' => $user->name])]);

        return back();
    }
}
