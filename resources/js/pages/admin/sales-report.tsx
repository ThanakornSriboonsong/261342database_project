import { Head, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useState } from 'react';
import BarChart from '@/components/admin/bar-chart';
import NativeSelect from '@/components/admin/native-select';
import PageHeader from '@/components/admin/page-header';
import StatCard from '@/components/admin/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatBaht, formatDay, formatMonth } from '@/lib/format';
import { dashboard } from '@/routes/admin';
import {
    exportMethod,
    index as salesReport,
} from '@/routes/admin/sales-report';
import type { ProductSales } from '@/types';

type Filters = { from: string; to: string; group_by: 'day' | 'month' };

type Props = {
    filters: Filters;
    totals: {
        orders: number;
        items_sold: number;
        gross: number;
        discount: number;
        revenue: number;
        average_order: number;
    };
    series: { period: string; revenue: number; orders: number }[];
    byProduct: ProductSales[];
    byPromotion: {
        promotion_id: number;
        code: string;
        name: string;
        orders: number;
        discount: number;
    }[];
};

export default function SalesReport({
    filters,
    totals,
    series,
    byProduct,
    byPromotion,
}: Props) {
    const [form, setForm] = useState<Filters>(filters);

    const apply = (next: Filters) => {
        setForm(next);
        router.get(salesReport.url(), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const formatPeriod = filters.group_by === 'month' ? formatMonth : formatDay;

    return (
        <>
            <Head title="Sales report" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="รายงานยอดขาย"
                    description="ยอดขายตามช่วงวันที่ สินค้าขายดี และการใช้โค้ดส่วนลด"
                    actions={
                        // ไฟล์ดาวน์โหลด ต้องใช้ <a> ธรรมดา ไม่ใช่ <Link>
                        <Button variant="outline" asChild>
                            <a
                                href={exportMethod.url({
                                    query: {
                                        from: filters.from,
                                        to: filters.to,
                                    },
                                })}
                            >
                                <Download />
                                ดาวน์โหลด CSV
                            </a>
                        </Button>
                    }
                />

                <form
                    className="flex flex-wrap items-end gap-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        apply(form);
                    }}
                >
                    <div className="grid gap-1.5">
                        <Label htmlFor="from">ตั้งแต่</Label>
                        <Input
                            id="from"
                            type="date"
                            value={form.from}
                            max={form.to}
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
                            min={form.from}
                            onChange={(e) =>
                                setForm({ ...form, to: e.target.value })
                            }
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="group_by">แสดงเป็น</Label>
                        <NativeSelect
                            id="group_by"
                            value={form.group_by}
                            onChange={(e) =>
                                apply({
                                    ...form,
                                    group_by: e.target
                                        .value as Filters['group_by'],
                                })
                            }
                        >
                            <option value="day">รายวัน</option>
                            <option value="month">รายเดือน</option>
                        </NativeSelect>
                    </div>
                    <Button type="submit">ดูรายงาน</Button>
                </form>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="ยอดขายสุทธิ"
                        value={formatBaht(totals.revenue)}
                        hint={`ก่อนลด ${formatBaht(totals.gross)}`}
                    />
                    <StatCard
                        label="ส่วนลดที่ให้ไป"
                        value={formatBaht(totals.discount)}
                    />
                    <StatCard
                        label="จำนวนออเดอร์"
                        value={totals.orders.toLocaleString('th-TH')}
                        hint={`ขายได้ ${totals.items_sold.toLocaleString('th-TH')} ชิ้น`}
                    />
                    <StatCard
                        label="ยอดเฉลี่ยต่อออเดอร์"
                        value={formatBaht(totals.average_order)}
                    />
                </div>

                <section className="rounded-xl border bg-card p-5">
                    <h2 className="mb-6 font-semibold">
                        ยอดขาย
                        {filters.group_by === 'month' ? 'รายเดือน' : 'รายวัน'}
                    </h2>
                    <BarChart
                        caption={`ยอดขาย${filters.group_by === 'month' ? 'รายเดือน' : 'รายวัน'}ตั้งแต่ ${filters.from} ถึง ${filters.to}`}
                        formatValue={formatBaht}
                        data={series.map((row) => ({
                            key: row.period,
                            label: formatPeriod(row.period),
                            title: formatPeriod(row.period),
                            value: row.revenue,
                            detail: `${row.orders} ออเดอร์`,
                        }))}
                    />
                </section>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="overflow-hidden rounded-xl border bg-card">
                        <h2 className="border-b px-5 py-4 font-semibold">
                            ยอดขายตามสินค้า
                        </h2>
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-2 text-left font-medium">
                                        สินค้า
                                    </th>
                                    <th className="px-5 py-2 text-right font-medium">
                                        จำนวน
                                    </th>
                                    <th className="px-5 py-2 text-right font-medium">
                                        ยอดขาย
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {byProduct.length === 0 && (
                                    <EmptyRow colSpan={3} />
                                )}
                                {byProduct.map((row) => (
                                    <tr key={row.product_id}>
                                        <td className="px-5 py-2.5">
                                            {row.name}
                                        </td>
                                        <td className="px-5 py-2.5 text-right tabular-nums">
                                            {row.quantity}
                                        </td>
                                        <td className="px-5 py-2.5 text-right font-medium tabular-nums">
                                            {formatBaht(row.revenue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section className="overflow-hidden rounded-xl border bg-card">
                        <h2 className="border-b px-5 py-4 font-semibold">
                            การใช้โค้ดส่วนลด
                        </h2>
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-2 text-left font-medium">
                                        โค้ด
                                    </th>
                                    <th className="px-5 py-2 text-right font-medium">
                                        ออเดอร์
                                    </th>
                                    <th className="px-5 py-2 text-right font-medium">
                                        ส่วนลดรวม
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {byPromotion.length === 0 && (
                                    <EmptyRow colSpan={3} />
                                )}
                                {byPromotion.map((row) => (
                                    <tr key={row.promotion_id}>
                                        <td className="px-5 py-2.5">
                                            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
                                                {row.code}
                                            </span>
                                            <span className="ml-2 text-muted-foreground">
                                                {row.name}
                                            </span>
                                        </td>
                                        <td className="px-5 py-2.5 text-right tabular-nums">
                                            {row.orders}
                                        </td>
                                        <td className="px-5 py-2.5 text-right font-medium tabular-nums">
                                            {formatBaht(row.discount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>
            </div>
        </>
    );
}

SalesReport.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'รายงานยอดขาย', href: salesReport() },
    ],
};

function EmptyRow({ colSpan }: { colSpan: number }) {
    return (
        <tr>
            <td
                colSpan={colSpan}
                className="px-5 py-10 text-center text-muted-foreground"
            >
                ไม่มีข้อมูลในช่วงนี้
            </td>
        </tr>
    );
}
