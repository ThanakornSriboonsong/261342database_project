import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    label: string;
    value: ReactNode;
    hint?: ReactNode;
    icon?: LucideIcon;
    className?: string;
};

/** การ์ดตัวเลขสรุป เช่น ยอดขายวันนี้ */
export default function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    className,
}: Props) {
    return (
        <div className={cn('rounded-xl border bg-card p-5', className)}>
            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>{label}</span>
                {Icon && <Icon className="size-4" />}
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
            {hint && (
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            )}
        </div>
    );
}
