<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Product management. Images can be uploaded (stored on the "public" disk) or given as a URL.
 */
class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'low_stock' => ['nullable', 'boolean'],
        ]);

        $products = Product::query()
            ->withSum('summaries as sold', 'summary_items.quantity')
            ->when($filters['search'] ?? null, fn (Builder $query, string $search) => $query->where('name', 'like', "%{$search}%"))
            ->when($request->boolean('low_stock'), fn (Builder $query) => $query->where('stock', '<=', DashboardController::LOW_STOCK))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Product $product) => [
                ...$this->present($product),
                'sold' => (int) $product->sold,
            ]);

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'low_stock' => $request->boolean('low_stock'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $product = Product::create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name created.', ['name' => $product->name])]);

        return to_route('admin.products.index');
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/edit', [
            'product' => $this->present($product),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $this->validated($request, $product);
        $oldImage = $product->image_url;

        $product->update($data);

        if ($oldImage !== $product->image_url) {
            $this->deleteUploadedImage($oldImage);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name updated.', ['name' => $product->name])]);

        return to_route('admin.products.index');
    }

    public function destroy(Product $product): RedirectResponse
    {
        // summary_items restricts deletes so order history keeps its products.
        if ($product->summaries()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __(':name has been ordered before and cannot be deleted. Set its stock to 0 instead.', ['name' => $product->name])]);

            return back();
        }

        $product->delete();
        $this->deleteUploadedImage($product->image_url);

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name deleted.', ['name' => $product->name])]);

        return to_route('admin.products.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Product $product = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'detail' => ['nullable', 'string', 'max:5000'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'stock' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'max:2048'],
            'image_url' => ['nullable', 'string', 'max:255'],
        ]);

        if ($request->hasFile('image')) {
            $data['image_url'] = Storage::disk('public')->url($request->file('image')->store('products', 'public'));
        } elseif (! $request->exists('image_url') && $product) {
            $data['image_url'] = $product->image_url; // no image fields sent: keep the current one
        }

        unset($data['image']);

        return $data;
    }

    private function deleteUploadedImage(?string $url): void
    {
        $prefix = Storage::disk('public')->url('');

        if ($url && str_starts_with($url, $prefix)) {
            Storage::disk('public')->delete(substr($url, strlen($prefix)));
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Product $product): array
    {
        return [
            'product_id' => (int) $product->product_id,
            'name' => $product->name,
            'detail' => $product->detail,
            'price' => (float) $product->price,
            'stock' => (int) $product->stock,
            'image_url' => $product->image_url,
        ];
    }
}
