import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'สว่าง' },
        { value: 'dark', icon: Moon, label: 'มืด' },
        { value: 'system', icon: Monitor, label: 'ตามอุปกรณ์' },
    ];

    return (
        <div
            className={cn('grid gap-3 sm:grid-cols-3', className)}
            role="radiogroup"
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={appearance === value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                        appearance === value
                            ? 'border-banana bg-banana-soft font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                >
                    <Icon className="size-4" />
                    {label}
                </button>
            ))}
        </div>
    );
}
