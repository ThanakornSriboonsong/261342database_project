import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ChevronRight,
    Receipt,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import BarChart from '@/components/admin/bar-chart';
import PageHeader from '@/components/admin/page-header';
import StatCard from '@/components/admin/stat-card';
import StockLabel from '@/components/admin/stock-label';
import { Button } from '@/components/ui/button';
import { formatBaht, formatDateTime, formatMonth } from '@/lib/format';
import { dashboard } from '@/routes/admin';
import { show as orderShow } from '@/routes/admin/orders';
import {
    edit as productEdit,
    index as productsIndex,
} from '@/routes/admin/products';
import { index as salesReport } from '@/routes/admin/sales-report';
import type { DashboardStats, ProductSales } from '@/types';

type Props = {
    stats: DashboardStats;
    salesByMonth: { month: string; revenue: number; orders: number }[];
    topProducts: ProductSales[];
    lowStock: { product_id: number; name: string; stock: number }[];
    recentOrders: {
        summary_id: number;
        order_date: string;
        customer: string;
        final_price: number;
    }[];
};

export default function AdminDashboard({
    stats,
    salesByMonth,
    topProducts,
    lowStock,
    recentOrders,
}: Props) {
    return (
        <>
            <Head title="Admin" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="ภาพรวมร้าน"
                    description="ยอดขาย สมาชิก และสินค้าที่ต้องเติม"
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={salesReport()}>ดูรายงานยอดขาย</Link>
                        </Button>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="ยอดขายวันนี้"
                        value={formatBaht(stats.today_revenue)}
                        hint={`${stats.today_orders} ออเดอร์`}
                        icon={Wallet}
                    />
                    <StatCard
                        label="ยอดขายเดือนนี้"
                        value={formatBaht(stats.month_revenue)}
                        hint={`${stats.month_orders} ออเดอร์`}
                        icon={TrendingUp}
                    />
                    <StatCard
                        label="สมาชิกทั้งหมด"
                        value={stats.members.toLocaleString('th-TH')}
                        hint={`ใหม่เดือนนี้ ${stats.new_members_this_month} คน`}
                        icon={Users}
                    />
                    <StatCard
                        label="สินค้าใกล้หมด"
                        value={stats.low_stock_count}
                        hint="stock เหลือ 5 ชิ้นหรือน้อยกว่า"
                        icon={AlertTriangle}
                    />
                </div>

                <section className="rounded-xl border bg-card p-5">
                    <h2 className="font-semibold">ยอดขายรายเดือน</h2>
                    <p className="mb-6 text-sm text-muted-foreground">
                        12 เดือนล่าสุด (ยอดหลังหักส่วนลด)
                    </p>
                    <BarChart
                        caption="ยอดขายรายเดือน 12 เดือนล่าสุด"
                        formatValue={formatBaht}
                        data={salesByMonth.map((row) => ({
                            key: row.month,
                            label: formatMonth(row.month),
                            title: formatMonth(row.month),
                            value: row.revenue,
                            detail: `${row.orders} ออเดอร์`,
                        }))}
                    />
                </section>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-xl border bg-card">
                        <h2 className="border-b px-5 py-4 font-semibold">
                            สินค้าขายดี
                        </h2>
                        {topProducts.length === 0 ? (
                            <Empty>ยังไม่มียอดขาย</Empty>
                        ) : (
                            <ol className="divide-y">
                                {topProducts.map((product, i) => (
                                    <li
                                        key={product.product_id}
                                        className="flex items-center gap-4 px-5 py-3 text-sm"
                                    >
                                        <span className="w-4 text-muted-foreground tabular-nums">
                                            {i + 1}
                                        </span>
                                        <span className="flex-1 truncate font-medium">
                                            {product.name}
                                        </span>
                                        <span className="text-muted-foreground tabular-nums">
                                            {product.quantity} ชิ้น
                                        </span>
                                        <span className="w-28 text-right font-semibold tabular-nums">
                                            {formatBaht(product.revenue)}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>

                    <section className="rounded-xl border bg-card">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <h2 className="font-semibold">สินค้าใกล้หมด</h2>
                            <Link
                                href={productsIndex({
                                    query: { low_stock: 1 },
                                })}
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                ดูทั้งหมด
                            </Link>
                        </div>
                        {lowStock.length === 0 ? (
                            <Empty>สินค้าทุกชิ้นยังมีพอ</Empty>
                        ) : (
                            <ul className="divide-y">
                                {lowStock.map((product) => (
                                    <li key={product.product_id}>
                                        <Link
                                            href={productEdit(
                                                product.product_id,
                                            )}
                                            className="flex items-center gap-4 px-5 py-3 text-sm hover:bg-muted/40"
                                        >
                                            <span className="flex-1 truncate font-medium">
                                                {product.name}
                                            </span>
                                            <StockLabel stock={product.stock} />
                                            <ChevronRight className="size-4 text-muted-foreground" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                <section className="rounded-xl border bg-card">
                    <h2 className="border-b px-5 py-4 font-semibold">
                        ออเดอร์ล่าสุด
                    </h2>
                    {recentOrders.length === 0 ? (
                        <Empty>ยังไม่มีออเดอร์</Empty>
                    ) : (
                        <ul className="divide-y">
                            {recentOrders.map((order) => (
                                <li key={order.summary_id}>
                                    <Link
                                        href={orderShow(order.summary_id)}
                                        className="flex items-center gap-4 px-5 py-3 text-sm hover:bg-muted/40"
                                    >
                                        <Receipt className="size-4 text-muted-foreground" />
                                        <span className="font-medium">
                                            #{order.summary_id}
                                        </span>
                                        <span className="flex-1 truncate">
                                            {order.customer}
                                        </span>
                                        <span className="hidden text-muted-foreground sm:inline">
                                            {formatDateTime(order.order_date)}
                                        </span>
                                        <span className="w-28 text-right font-semibold tabular-nums">
                                            {formatBaht(order.final_price)}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Admin', href: dashboard() }],
};

function Empty({ children }: { children: string }) {
    return (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            {children}
        </p>
    );
}
