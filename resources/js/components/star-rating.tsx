import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    value: number;
    className?: string;
};

/** ดาว 5 ดวง เติมสีตามคะแนน (ปัดเป็นดวงเต็ม) */
export default function StarRating({ value, className }: Props) {
    const filled = Math.round(value);

    return (
        <span
            className={cn('inline-flex items-center gap-0.5', className)}
            aria-label={`${value} / 5`}
        >
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    className={cn(
                        'size-4',
                        n <= filled
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/40',
                    )}
                />
            ))}
        </span>
    );
}

type InputProps = {
    value: number;
    onChange: (value: number) => void;
};

/** เลือกดาว 1-5 สำหรับฟอร์มรีวิว */
export function StarInput({ value, onChange }: InputProps) {
    return (
        <span className="inline-flex items-center gap-1" role="radiogroup">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={value === n}
                    aria-label={`${n} ดาว`}
                    onClick={() => onChange(n)}
                    className="rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                    <Star
                        className={cn(
                            'size-6 transition-colors',
                            n <= value
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/40 hover:text-amber-300',
                        )}
                    />
                </button>
            ))}
        </span>
    );
}
