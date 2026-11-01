import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import PageHeader from '@/components/admin/page-header';
import StockLabel from '@/components/admin/stock-label';
import Pagination from '@/components/pagination';
import ProductImage from '@/components/product-image';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatBaht } from '@/lib/format';
import { dashboard } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/products';
import type { AdminProduct, Paginated } from '@/types';

type Filters = { search: string; low_stock: boolean };

type Props = {
    products: Paginated<AdminProduct & { sold: number }>;
    filters: Filters;
};

export default function AdminProductsIndex({ products, filters }: Props) {
    const applyFilters = (next: Filters) =>
        router.get(
            index.url(),
            {
                ...(next.search && { search: next.search }),
                ...(next.low_stock && { low_stock: 1 }),
            },
            { preserveState: true, replace: true },
        );

    return (
        <>
            <Head title="Products" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="สินค้า"
                    description={`ทั้งหมด ${products.total} รายการ`}
                    actions={
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                เพิ่มสินค้า
                            </Link>
                        </Button>
                    }
                />

                <div className="flex flex-wrap items-center gap-4">
                    <form
                        className="relative w-full max-w-xs"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const value = new FormData(e.currentTarget).get(
                                'search',
                            );
                            applyFilters({
                                ...filters,
                                search:
                                    typeof value === 'string'
                                        ? value.trim()
                                        : '',
                            });
                        }}
                    >
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            name="search"
                            type="search"
                            defaultValue={filters.search}
                            placeholder="ค้นหาชื่อสินค้า"
                            className="pl-9"
                        />
                    </form>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="low_stock"
                            checked={filters.low_stock}
                            onCheckedChange={(checked) =>
                                applyFilters({
                                    ...filters,
                                    low_stock: checked === true,
                                })
                            }
                        />
                        <Label htmlFor="low_stock">เฉพาะสินค้าใกล้หมด</Label>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-card">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">
                                    สินค้า
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    ราคา
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    คงเหลือ
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    ขายแล้ว
                                </th>
                                <th className="w-24 px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-12 text-center text-muted-foreground"
                                    >
                                        ไม่พบสินค้า
                                    </td>
                                </tr>
                            )}
                            {products.data.map((product) => (
                                <tr key={product.product_id}>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={edit(product.product_id)}
                                            className="flex items-center gap-3 hover:underline"
                                        >
                                            <ProductImage
                                                src={product.image_url}
                                                alt={product.name}
                                                className="size-10 shrink-0 rounded-md"
                                            />
                                            <span className="font-medium">
                                                {product.name}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums">
                                        {formatBaht(product.price)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <StockLabel stock={product.stock} />
                                    </td>
                                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                                        {product.sold}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={edit(
                                                        product.product_id,
                                                    )}
                                                    aria-label={`แก้ไข ${product.name}`}
                                                >
                                                    <Pencil />
                                                </Link>
                                            </Button>
                                            <ConfirmDialog
                                                title={`ลบ ${product.name}?`}
                                                description={
                                                    product.sold > 0
                                                        ? 'สินค้านี้เคยถูกสั่งซื้อแล้วจึงลบไม่ได้ ให้ตั้ง stock เป็น 0 แทน'
                                                        : 'ลบแล้วกู้คืนไม่ได้'
                                                }
                                                onConfirm={() =>
                                                    router.delete(
                                                        destroy.url(
                                                            product.product_id,
                                                        ),
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`ลบ ${product.name}`}
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination paginator={products} />
            </div>
        </>
    );
}

AdminProductsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'สินค้า', href: index() },
    ],
};
