import { Head, Link, router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import Pagination from '@/components/pagination';
import ProductCard from '@/components/product-card';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { index as productsIndex } from '@/routes/products';
import type { Paginated, ProductCard as ProductCardData } from '@/types';

type Sort = 'newest' | 'price_asc' | 'price_desc' | 'rating';

type Filters = {
    search: string;
    sort: Sort;
    in_stock: boolean;
};

type Props = {
    products: Paginated<ProductCardData>;
    filters: Filters;
};

const sortOptions: { value: Sort; label: string }[] = [
    { value: 'newest', label: 'มาใหม่ล่าสุด' },
    { value: 'rating', label: 'คะแนนรีวิวสูงสุด' },
    { value: 'price_asc', label: 'ราคาต่ำไปสูง' },
    { value: 'price_desc', label: 'ราคาสูงไปต่ำ' },
];

export default function ProductsIndex({ products, filters }: Props) {
    const applyFilters = (changes: Partial<Filters>) => {
        const next = { ...filters, ...changes };

        // ส่งเฉพาะค่าที่ไม่ใช่ค่าเริ่มต้น ให้ URL สั้น
        router.get(
            productsIndex.url(),
            {
                ...(next.search ? { search: next.search } : {}),
                ...(next.sort !== 'newest' ? { sort: next.sort } : {}),
            },
            { preserveState: true, replace: true },
        );
    };

    const hasFilters = filters.search !== '' || filters.sort !== 'newest';

    return (
        <>
            <Head title="Products" />

            <nav className="mb-3 text-sm text-muted-foreground">
                <Link href={home()} className="hover:text-foreground">
                    หน้าแรก
                </Link>{' '}
                / <span className="text-foreground">สินค้าทั้งหมด</span>
            </nav>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        สินค้าทั้งหมด
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        {filters.search
                            ? `ผลการค้นหา “${filters.search}” · ${products.total} รายการ`
                            : `${products.total} รายการ`}
                    </p>
                </div>

                <form
                    className="relative w-full sm:w-72"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const search = new FormData(e.currentTarget).get(
                            'search',
                        );
                        applyFilters({
                            search:
                                typeof search === 'string' ? search.trim() : '',
                        });
                    }}
                >
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        key={filters.search}
                        name="search"
                        type="search"
                        defaultValue={filters.search}
                        placeholder="ค้นหาชื่อสินค้า"
                        className="h-10 w-full rounded-full border bg-card pr-4 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
                    />
                </form>
            </div>

            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                <aside className="h-fit space-y-6 rounded-xl border bg-card p-5 lg:sticky lg:top-24">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold">ตัวกรอง</p>
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={() =>
                                    applyFilters({ search: '', sort: 'newest' })
                                }
                                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-3.5" />
                                ล้างทั้งหมด
                            </button>
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            เรียงตาม
                        </p>
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                    applyFilters({ sort: option.value })
                                }
                                className={cn(
                                    'block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                    filters.sort === option.value
                                        ? 'bg-banana-soft font-medium'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </aside>

                <div>
                    {products.data.length > 0 ? (
                        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
                            {products.data.map((product) => (
                                <ProductCard
                                    key={product.product_id}
                                    product={product}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed bg-card py-16 text-center">
                            <p className="font-medium">ไม่พบสินค้าที่ค้นหา</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง
                            </p>
                        </div>
                    )}

                    <Pagination paginator={products} />
                </div>
            </div>
        </>
    );
}
