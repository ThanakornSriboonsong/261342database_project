import { Head, Link, router } from '@inertiajs/react';
import { ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/admin/page-header';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatBaht, formatDateTime } from '@/lib/format';
import { dashboard } from '@/routes/admin';
import { index, show } from '@/routes/admin/orders';
import type { AdminOrderRow, Paginated } from '@/types';

type Filters = { search: string; from: string; to: string };

type Props = {
    orders: Paginated<AdminOrderRow>;
    filters: Filters;
};

export default function AdminOrdersIndex({ orders, filters }: Props) {
    const [form, setForm] = useState<Filters>(filters);

    const apply = (next: Filters) =>
        router.get(
            index.url(),
            // ไม่ส่งช่องที่ว่าง URL จะได้สั้น
            Object.fromEntries(Object.entries(next).filter(([, v]) => v)),
            { preserveState: true, replace: true },
        );

    const hasFilters = Boolean(filters.search || filters.from || filters.to);

    return (
        <>
            <Head title="Orders" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="คำสั่งซื้อ"
                    description={`ทั้งหมด ${orders.total} ออเดอร์`}
                />

                <form
                    className="flex flex-wrap items-end gap-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        apply(form);
                    }}
                >
                    <div className="grid w-full max-w-xs gap-1.5">
                        <Label htmlFor="search">ค้นหา</Label>
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="search"
                                type="search"
                                value={form.search}
                                placeholder="#เลขออเดอร์ ชื่อ หรืออีเมล"
                                className="pl-9"
                                onChange={(e) =>
                                    setForm({ ...form, search: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="from">ตั้งแต่</Label>
                        <Input
                            id="from"
                            type="date"
                            value={form.from}
                            max={form.to || undefined}
                            onChange={(e) =>
                                setForm({ ...form, from: e.target.value })
                            }
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="to">ถึง</Label>
                        <Input
                            id="to"
                            type="date"
                            value={form.to}
                            min={form.from || undefined}
                            onChange={(e) =>
                                setForm({ ...form, to: e.target.value })
                            }
                        />
                    </div>
                    <Button type="submit">ค้นหา</Button>
                    {hasFilters && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                const empty = { search: '', from: '', to: '' };
                                setForm(empty);
                                apply(empty);
                            }}
                        >
                            ล้างตัวกรอง
                        </Button>
                    )}
                </form>

                <div className="overflow-x-auto rounded-xl border bg-card">
                    <table className="w-full min-w-[720px] text-sm">
                        <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">
                                    ออเดอร์
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    ลูกค้า
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    รายการ
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    โค้ด
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    ยอดชำระ
                                </th>
                                <th className="w-8" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-12 text-center text-muted-foreground"
                                    >
                                        ไม่พบออเดอร์
                                    </td>
                                </tr>
                            )}
                            {orders.data.map((order) => (
                                <tr
                                    key={order.summary_id}
                                    className="hover:bg-muted/40"
                                >
                                    <td className="px-4 py-3">
                                        <Link
                                            href={show(order.summary_id)}
                                            className="font-medium hover:underline"
                                        >
                                            #{order.summary_id}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(order.order_date)}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p>{order.customer.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {order.customer.email}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                                        {order.items_count}
                                    </td>
                                    <td className="px-4 py-3">
                                        {order.promotion_code ? (
                                            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
                                                {order.promotion_code}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                –
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <p className="font-semibold tabular-nums">
                                            {formatBaht(order.final_price)}
                                        </p>
                                        {order.discount_amount > 0 && (
                                            <p className="text-xs text-muted-foreground tabular-nums">
                                                ลด{' '}
                                                {formatBaht(
                                                    order.discount_amount,
                                                )}
                                            </p>
                                        )}
                                    </td>
                                    <td className="pr-4">
                                        <Link
                                            href={show(order.summary_id)}
                                            aria-label={`ดูออเดอร์ #${order.summary_id}`}
                                        >
                                            <ChevronRight className="size-4 text-muted-foreground" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination paginator={orders} />
            </div>
        </>
    );
}

AdminOrdersIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'คำสั่งซื้อ', href: index() },
    ],
};
