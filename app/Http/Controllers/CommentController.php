<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Product reviews: a text comment plus a 1-5 star rating.
 */
class CommentController extends Controller
{
    public function store(Request $request, Product $product): RedirectResponse
    {
        $product->comments()->create([
            ...$this->validated($request),
            'user_id' => $request->user()->getKey(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Thanks for your review!')]);

        return back();
    }

    public function update(Request $request, Comment $comment): RedirectResponse
    {
        $this->ensureOwner($request, $comment);

        $comment->update($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Review updated.')]);

        return back();
    }

    public function destroy(Request $request, Comment $comment): RedirectResponse
    {
        $this->ensureOwner($request, $comment);

        $comment->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Review deleted.')]);

        return back();
    }

    /**
     * @return array{comment: string, star: int}
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'comment' => ['required', 'string', 'max:2000'],
            'star' => ['required', 'integer', 'between:1,5'],
        ]);
    }

    private function ensureOwner(Request $request, Comment $comment): void
    {
        abort_unless((int) $comment->user_id === $request->user()->getKey(), 403);
    }
}
