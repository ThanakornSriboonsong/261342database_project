import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, MapPin } from 'lucide-react';
import CheckoutSteps from '@/components/checkout-steps';
import MoneySummary from '@/components/money-summary';
import ProductImage from '@/components/product-image';
import { Button } from '@/components/ui/button';
import { formatBaht, formatDateTime } from '@/lib/format';
import { index as ordersIndex } from '@/routes/orders';
import { index as productsIndex, show as productShow } from '@/routes/products';
import type { OrderDetail } from '@/types';

type Props = {
    order: OrderDetail;
};

export default function OrderShow({ order }: Props) {
    return (
        <>
            <Head title={`Order #${order.summary_id}`} />

            <nav className="mb-4 text-sm text-muted-foreground">
                <Link href={ordersIndex()} className="hover:text-foreground">
                    คำสั่งซื้อของฉัน
                </Link>{' '}
                / <span className="text-foreground">#{order.summary_id}</span>
            </nav>

            <section className="rounded-xl border border-t-4 border-t-forest bg-card p-6 sm:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                        <CheckCircle2 className="mt-1 size-8 shrink-0 text-forest" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                คำสั่งซื้อ #{order.summary_id}
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                สั่งซื้อเมื่อ {formatDateTime(order.order_date)}
                            </p>
                        </div>
                    </div>
                    <div className="md:w-96">
                        <CheckoutSteps current={2} />
                    </div>
                </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
                <section className="rounded-xl border bg-card">
                    <h2 className="border-b px-6 py-4 font-semibold">
                        รายการสินค้า ({order.items.length})
                    </h2>
                    <ul className="divide-y">
                        {order.items.map((item) => (
                            <li
                                key={item.product_id}
                                className="flex items-center gap-4 px-6 py-4"
                            >
                                <ProductImage
                                    src={item.image_url}
                                    alt={item.name}
                                    className="size-16 shrink-0 rounded-lg border"
                                />
                                <div className="min-w-0 flex-1">
                                    <Link
                                        href={productShow.url(item.product_id)}
                                        className="line-clamp-1 font-medium hover:underline"
                                    >
                                        {item.name}
                                    </Link>
                                    <p className="text-sm text-muted-foreground">
                                        {formatBaht(item.unit_price)} ×{' '}
                                        {item.quantity}
                                    </p>
                                </div>
                                <span className="font-medium tabular-nums">
                                    {formatBaht(item.line_total)}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t px-6 py-5">
                        <MoneySummary
                            summary={{
                                subtotal: order.total_price,
                                discount: order.discount_amount,
                                total: order.final_price,
                            }}
                            discountNote={
                                order.promotion &&
                                `${order.promotion.code} · ${order.promotion.name}`
                            }
                        />
                    </div>
                </section>

                <aside className="space-y-4">
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="mb-3 flex items-center gap-2 font-semibold">
                            <MapPin className="size-4" />
                            ที่อยู่จัดส่ง
                        </h2>
                        <p className="text-sm whitespace-pre-line text-muted-foreground">
                            {order.shipping_address}
                        </p>
                    </div>
                    <Button size="lg" className="w-full rounded-full" asChild>
                        <Link href={productsIndex()}>เลือกซื้อสินค้าต่อ</Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full rounded-full"
                        asChild
                    >
                        <Link href={ordersIndex()}>ดูคำสั่งซื้อทั้งหมด</Link>
                    </Button>
                </aside>
            </div>
        </>
    );
}
