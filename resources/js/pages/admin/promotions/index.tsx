import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '@/components/admin/confirm-dialog';
import PageHeader from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { formatBaht, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes/admin';
import { create, destroy, edit, index } from '@/routes/admin/promotions';
import type { AdminPromotion } from '@/types';

type Props = {
    promotions: (AdminPromotion & {
        products_count: number;
        used_count: number;
    })[];
};

const statusLabel: Record<AdminPromotion['status'], [string, string]> = {
    active: [
        'ใช้งานอยู่',
        'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
    ],
    scheduled: [
        'ยังไม่เริ่ม',
        'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    ],
    expired: ['หมดอายุ', 'bg-muted text-muted-foreground'],
};

/** "ลด 10% (สูงสุด ฿100.00)" / "ซื้อ 2 แถม 1" */
const describe = (promotion: AdminPromotion) =>
    promotion.type === 'discount'
        ? `ลด ${promotion.percent}%${promotion.max_discount !== null ? ` (สูงสุด ${formatBaht(promotion.max_discount)})` : ''}`
        : `ซื้อ ${promotion.buy_qty} แถม ${promotion.get_qty}`;

export default function AdminPromotionsIndex({ promotions }: Props) {
    return (
        <>
            <Head title="Promotions" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="โปรโมชัน"
                    description={`ทั้งหมด ${promotions.length} โค้ด`}
                    actions={
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                เพิ่มโปรโมชัน
                            </Link>
                        </Button>
                    }
                />

                <div className="overflow-x-auto rounded-xl border bg-card">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">
                                    โค้ด
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    เงื่อนไข
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    ช่วงเวลา
                                </th>
                                <th className="px-4 py-3 text-left font-medium">
                                    สถานะ
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    ใช้ไปแล้ว
                                </th>
                                <th className="w-24 px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {promotions.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-12 text-center text-muted-foreground"
                                    >
                                        ยังไม่มีโปรโมชัน
                                    </td>
                                </tr>
                            )}
                            {promotions.map((promotion) => {
                                const [label, color] =
                                    statusLabel[promotion.status];

                                return (
                                    <tr key={promotion.promotion_id}>
                                        <td className="px-4 py-3">
                                            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium">
                                                {promotion.code}
                                            </span>
                                            <p className="mt-1 text-muted-foreground">
                                                {promotion.name}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p>{describe(promotion)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {promotion.products_count > 0
                                                    ? `${promotion.products_count} สินค้า`
                                                    : 'ทุกสินค้า'}
                                                {' · '}
                                                {promotion.tier
                                                    ? `${promotion.tier} ขึ้นไป`
                                                    : 'ทุกคน'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                            {formatDate(promotion.start_date)} –{' '}
                                            {formatDate(promotion.end_date)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    'rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap',
                                                    color,
                                                )}
                                            >
                                                {label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                                            {promotion.used_count} ครั้ง
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
                                                            promotion.promotion_id,
                                                        )}
                                                        aria-label={`แก้ไข ${promotion.code}`}
                                                    >
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <ConfirmDialog
                                                    title={`ลบโค้ด ${promotion.code}?`}
                                                    description="ออเดอร์เก่าที่เคยใช้โค้ดนี้จะยังอยู่ แต่ลูกค้าจะใช้โค้ดนี้ไม่ได้อีก"
                                                    onConfirm={() =>
                                                        router.delete(
                                                            destroy.url(
                                                                promotion.promotion_id,
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
                                                            aria-label={`ลบ ${promotion.code}`}
                                                        >
                                                            <Trash2 />
                                                        </Button>
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

AdminPromotionsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'โปรโมชัน', href: index() },
    ],
};
