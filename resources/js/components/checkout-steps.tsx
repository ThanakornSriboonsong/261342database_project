import { Check } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';

const steps = ['ตะกร้าสินค้า', 'ที่อยู่จัดส่ง', 'สั่งซื้อสำเร็จ'];

/** แถบขั้นตอนการสั่งซื้อ current = 0, 1, 2 */
export default function CheckoutSteps({ current }: { current: number }) {
    return (
        <ol className="flex items-center gap-3 text-sm">
            {steps.map((label, i) => {
                const done = i < current || current === steps.length - 1;
                const active = i === current;

                return (
                    <Fragment key={label}>
                        {i > 0 && (
                            <li
                                aria-hidden
                                className={cn(
                                    'h-px flex-1',
                                    i <= current
                                        ? 'bg-foreground'
                                        : 'bg-border',
                                )}
                            />
                        )}
                        <li className="flex items-center gap-2">
                            <span
                                className={cn(
                                    'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                                    done
                                        ? 'bg-foreground text-background'
                                        : active
                                          ? 'bg-banana'
                                          : 'border bg-card text-muted-foreground',
                                )}
                            >
                                {done ? <Check className="size-4" /> : i + 1}
                            </span>
                            <span
                                className={cn(
                                    'hidden sm:inline',
                                    active || done
                                        ? 'font-medium'
                                        : 'text-muted-foreground',
                                )}
                            >
                                {label}
                            </span>
                        </li>
                    </Fragment>
                );
            })}
        </ol>
    );
}
