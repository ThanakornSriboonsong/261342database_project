import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { formatBaht, formatDateTime } from '@/lib/format';
import { dashboard } from '@/routes/admin';
import { index } from '@/routes/admin/orders';
import { index as usersIndex } from '@/routes/admin/users';
import type { AdminOrderDetail } from '@/types';

type Props = {
    order: AdminOrderDetail;
};

export default function AdminOrderShow({ order }: Props) {
    return (
        <>
            <Head title={`Order #${order.summary_id}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title={`ออเดอร์ #${order.summary_id}`}
                    description={`สั่งเมื่อ ${formatDateTime(order.order_date)}`}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={index()}>
                                <ArrowLeft />
                                กลับไปรายการ
                            </Link>
                        </Button>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <section className="overflow-hidden rounded-xl border bg-card">
                        <h2 className="border-b px-5 py-4 font-semibold">
                            รายการสินค้า
                        </h2>
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-2 text-left font-medium">
                                        สินค้า
                                    </th>
                                    <th className="px-5 py-2 text-right font-medium">
                                        ราคาต่อชิ้น
                                    </th>
                                    <th className="px-5 py-2 text-right font-medium">
                                        จำนวน
                                    </th>
                                    <th className="px-5 py-2 text-right font-medium">
                                        รวม
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {order.items.map((item) => (
                                    <tr key={item.product_id}>
                                        <td className="px-5 py-3 font-medium">
                                            {item.name}
                                        </td>
                                        <td className="px-5 py-3 text-right tabular-nums">
                                            {formatBaht(item.unit_price)}
                                        </td>
                                        <td className="px-5 py-3 text-right tabular-nums">
                                            {item.quantity}
                                        </td>
                                        <td className="px-5 py-3 text-right font-medium tabular-nums">
                                            {formatBaht(item.line_total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <dl className="grid gap-2 border-t px-5 py-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">
                                    ยอดก่อนลด
                                </dt>
                                <dd className="tabular-nums">
                                    {formatBaht(order.total_price)}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">
                                    ส่วนลด
                                    {order.promotion && (
                                        <span className="ml-2 rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
                                            {order.promotion.code}
                                        </span>
                                    )}
                                </dt>
                                <dd className="tabular-nums">
                                    −{formatBaht(order.discount_amount)}
                                </dd>
                            </div>
                            <div className="flex justify-between border-t pt-2 text-base font-semibold">
                                <dt>ยอดชำระ</dt>
                                <dd className="tabular-nums">
                                    {formatBaht(order.final_price)}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <div className="flex flex-col gap-6">
                        <section className="rounded-xl border bg-card p-5 text-sm">
                            <h2 className="mb-3 font-semibold">ลูกค้า</h2>
                            <p className="font-medium">{order.customer.name}</p>
                            <p className="text-muted-foreground">
                                {order.customer.email}
                            </p>
                            <p className="text-muted-foreground">
                                {order.customer.phone ?? 'ไม่มีเบอร์โทร'}
                            </p>
                            <Link
                                href={usersIndex({
                                    query: { search: order.customer.email },
                                })}
                                className="mt-3 inline-block text-sm underline underline-offset-4"
                            >
                                ดูข้อมูลสมาชิก
                            </Link>
                        </section>

                        <section className="rounded-xl border bg-card p-5 text-sm">
                            <h2 className="mb-3 font-semibold">ที่อยู่จัดส่ง</h2>
                            <p className="whitespace-pre-line">
                                {order.shipping_address}
                            </p>
                        </section>

                        {order.promotion && (
                            <section className="rounded-xl border bg-card p-5 text-sm">
                                <h2 className="mb-3 font-semibold">
                                    โปรโมชันที่ใช้
                                </h2>
                                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
                                    {order.promotion.code}
                                </span>
                                <p className="mt-2 text-muted-foreground">
                                    {order.promotion.name}
                                </p>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

AdminOrderShow.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'คำสั่งซื้อ', href: index() },
        { title: 'รายละเอียด', href: '#' },
    ],
};
