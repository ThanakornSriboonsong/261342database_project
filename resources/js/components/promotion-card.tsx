import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { formatBaht, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PromotionSummary } from '@/types';

/** ข้อความสั้นๆ บอกว่าโปรนี้ลดอะไร */
export function describePromotion(promotion: PromotionSummary): string {
    if (promotion.type === 'buy_get') {
        return `ซื้อ ${promotion.buy_qty} แถม ${promotion.get_qty}`;
    }

    const cap =
        promotion.max_discount === null
            ? ''
            : ` สูงสุด ${formatBaht(promotion.max_discount)}`;

    return `ลด ${promotion.percent}%${cap}`;
}

/** ปุ่มแสดงโค้ด กดแล้วคัดลอก */
export function CopyCode({
    code,
    className,
}: {
    code: string;
    className?: string;
}) {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        void navigator.clipboard?.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <button
            type="button"
            onClick={copy}
            className={cn(
                'inline-flex items-center gap-2 rounded-md border border-dashed px-3 py-1.5 font-mono text-sm font-semibold tracking-wide',
                className,
            )}
            aria-label={`คัดลอกโค้ด ${code}`}
        >
            {code}
            {copied ? (
                <Check className="size-4" />
            ) : (
                <Copy className="size-4 opacity-60" />
            )}
        </button>
    );
}

type Props = {
    promotion: PromotionSummary;
};

export default function PromotionCard({ promotion }: Props) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <div className="min-w-0">
                <p className="font-medium">{describePromotion(promotion)}</p>
                <p className="text-sm text-muted-foreground">
                    {promotion.name}
                    {promotion.tier && ` · เฉพาะสมาชิก ${promotion.tier}`} · ถึง{' '}
                    {formatDate(promotion.end_date)}
                </p>
            </div>
            <CopyCode code={promotion.code} />
        </div>
    );
}
