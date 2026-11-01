import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Package } from 'lucide-react';
import Pagination from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { formatBaht, formatDate } from '@/lib/format';
import { show as orderShow } from '@/routes/orders';
import { index as productsIndex } from '@/routes/products';
import type { OrderRow, Paginated } from '@/types';

type Props = {
    orders: Paginated<OrderRow>;
};

const columns = 'md:grid-cols-[1fr_1fr_100px_120px_130px_24px]';

export default function OrdersIndex({ orders }: Props) {
    return (
        <>
            <Head title="Orders" />

            <h1 className="mb-6 text-3xl font-semibold tracking-tight">
                คำสั่งซื้อของฉัน
            </h1>

            {orders.data.length === 0 ? (
                <div className="mx-auto max-w-md rounded-2xl border bg-card px-6 py-16 text-center">
                    <Package className="mx-auto mb-4 size-10 text-muted-foreground" />
                    <p className="font-medium">ยังไม่มีคำสั่งซื้อ</p>
                    <p className="mt-1 mb-6 text-sm text-muted-foreground">
                        เมื่อสั่งซื้อแล้ว รายการจะแสดงที่นี่
                    </p>
                    <Button className="rounded-full" asChild>
                        <Link href={productsIndex()}>เลือกซื้อสินค้า</Link>
                    </Button>
                </div>
            ) : (
                <>
                    <div className="mb-6 overflow-hidden rounded-xl border bg-card">
                        <div
                            className={`hidden gap-4 border-b bg-muted/50 px-5 py-3 text-xs font-medium text-muted-foreground md:grid ${columns}`}
                        >
                            <span>เลขที่คำสั่งซื้อ</span>
                            <span>วันที่สั่ง</span>
                            <span>จำนวน</span>
                            <span>โค้ดส่วนลด</span>
                            <span className="text-right">ยอดชำระ</span>
                            <span />
                        </div>
                        <ul className="divide-y">
                            {orders.data.map((order) => (
                                <li key={order.summary_id}>
                                    <Link
                                        href={orderShow.url(order.summary_id)}
                                        className={`grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-4 text-sm transition-colors hover:bg-muted/40 ${columns}`}
                                    >
                                        <span className="font-medium">
                                            #{order.summary_id}
                                        </span>
                                        <span className="text-muted-foreground max-md:order-3">
                                            {formatDate(order.order_date)}
                                        </span>
                                        <span className="text-muted-foreground max-md:hidden">
                                            {order.items_count} รายการ
                                        </span>
                                        <span className="max-md:hidden">
                                            {order.promotion_code ? (
                                                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
                                                    {order.promotion_code}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    –
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-right font-semibold tabular-nums max-md:order-2">
                                            {formatBaht(order.final_price)}
                                        </span>
                                        <ChevronRight className="size-4 text-muted-foreground max-md:hidden" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Pagination paginator={orders} />
                </>
            )}
        </>
    );
}
