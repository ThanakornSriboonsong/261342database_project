import type { ReactNode } from 'react';
import { formatBaht } from '@/lib/format';
import type { MoneySummary as MoneySummaryData } from '@/types';

type Props = {
    summary: MoneySummaryData;
    /** ข้อความใต้บรรทัดส่วนลด เช่นชื่อโค้ดที่ใช้ */
    discountNote?: ReactNode;
};

/** แสดงยอดเงินจาก backend (ห้ามคำนวณเองฝั่ง React) */
export default function MoneySummary({ summary, discountNote }: Props) {
    return (
        <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
                <dt className="text-muted-foreground">ยอดรวมสินค้า</dt>
                <dd className="tabular-nums">{formatBaht(summary.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                    ส่วนลด
                    {discountNote && (
                        <span className="block text-xs">{discountNote}</span>
                    )}
                </dt>
                <dd className="text-forest tabular-nums">
                    {summary.discount > 0
                        ? `−${formatBaht(summary.discount)}`
                        : formatBaht(0)}
                </dd>
            </div>
            <div className="flex items-baseline justify-between border-t pt-3">
                <dt className="font-medium">ยอดชำระ</dt>
                <dd className="text-xl font-semibold tabular-nums">
                    {formatBaht(summary.total)}
                </dd>
            </div>
        </dl>
    );
}
