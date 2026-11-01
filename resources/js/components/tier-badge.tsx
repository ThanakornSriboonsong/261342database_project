import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

// สีตามชื่อ tier ที่ seed ไว้ tier อื่นใช้สีกลาง
const tierColors: Record<string, string> = {
    Silver: 'bg-zinc-100 text-zinc-700 ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600',
    Gold: 'bg-amber-100 text-amber-800 ring-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800',
    Platinum:
        'bg-indigo-100 text-indigo-800 ring-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800',
};

/** ป้าย tier สมาชิก เช่น "👑 Gold" */
export default function TierBadge({
    name,
    className,
}: {
    name: string;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                tierColors[name] ?? 'bg-muted text-foreground ring-border',
                className,
            )}
        >
            <Crown className="size-3" />
            {name}
        </span>
    );
}
