import { useState } from 'react';
import { cn } from '@/lib/utils';

export type BarDatum = {
    key: string;
    label: string; // ป้ายใต้แท่ง (แบบสั้น)
    title: string; // หัวข้อใน tooltip (แบบเต็ม)
    value: number;
    detail?: string; // บรรทัดเสริมใน tooltip เช่น "12 ออเดอร์"
};

type Props = {
    data: BarDatum[];
    formatValue: (value: number) => string;
    caption: string; // อธิบายกราฟ (ใช้ทำตารางสำหรับ screen reader)
    className?: string;
};

// ผ่าน scripts/validate_palette.js ทั้งพื้นขาวและพื้นมืด (contrast >= 3:1)
const BAR_COLOR = 'bg-[#c08a00]';

/** กราฟแท่งชุดเดียว hover ที่แท่งเพื่อดูตัวเลข */
export default function BarChart({
    data,
    formatValue,
    caption,
    className,
}: Props) {
    const [active, setActive] = useState<number | null>(null);
    const max = Math.max(...data.map((d) => d.value), 0);
    // ถ้ามีหลายแท่ง แสดงป้ายแกน x แค่บางแท่งไม่ให้ชนกัน
    const labelEvery = Math.max(1, Math.ceil(data.length / 12));

    return (
        <figure className={cn('w-full', className)}>
            <div className="relative h-56">
                {/* เส้น grid: 0, ครึ่ง, สูงสุด */}
                {[1, 0.5, 0].map((ratio) => (
                    <div
                        key={ratio}
                        className="pointer-events-none absolute inset-x-0 flex items-center gap-2"
                        style={{ bottom: `${ratio * 100}%` }}
                    >
                        <span className="w-16 shrink-0 translate-y-1/2 pr-1 text-right text-[11px] text-muted-foreground tabular-nums">
                            {max > 0 || ratio === 0
                                ? formatValue(max * ratio)
                                : ''}
                        </span>
                        <div
                            className={cn(
                                'h-px flex-1',
                                ratio === 0 ? 'bg-border' : 'bg-border/50',
                            )}
                        />
                    </div>
                ))}

                <div
                    className="absolute inset-y-0 right-0 left-18 flex items-end gap-[2px]"
                    onMouseLeave={() => setActive(null)}
                    aria-hidden
                >
                    {data.map((d, i) => (
                        <div
                            key={d.key}
                            className="relative flex h-full flex-1 items-end justify-center"
                            onMouseEnter={() => setActive(i)}
                        >
                            <div
                                className={cn(
                                    'w-full max-w-10 rounded-t-[4px] transition-opacity',
                                    BAR_COLOR,
                                    active !== null &&
                                        active !== i &&
                                        'opacity-50',
                                )}
                                style={{
                                    height:
                                        max > 0
                                            ? `${(d.value / max) * 100}%`
                                            : 0,
                                    minHeight: d.value > 0 ? 2 : 0,
                                }}
                            />
                            {active === i && (
                                <div
                                    className={cn(
                                        'pointer-events-none absolute bottom-full z-10 mb-2 rounded-md border bg-popover px-3 py-2 text-xs whitespace-nowrap text-popover-foreground shadow-md',
                                        i < data.length / 3
                                            ? 'left-0'
                                            : i > (data.length * 2) / 3
                                              ? 'right-0'
                                              : 'left-1/2 -translate-x-1/2',
                                    )}
                                >
                                    <p className="text-muted-foreground">
                                        {d.title}
                                    </p>
                                    <p className="font-semibold tabular-nums">
                                        {formatValue(d.value)}
                                    </p>
                                    {d.detail && (
                                        <p className="text-muted-foreground">
                                            {d.detail}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-2 ml-18 flex gap-[2px]" aria-hidden>
                {data.map((d, i) => (
                    <span
                        key={d.key}
                        className="flex-1 truncate text-center text-[11px] text-muted-foreground"
                    >
                        {i % labelEvery === 0 ? d.label : ''}
                    </span>
                ))}
            </div>

            <table className="sr-only">
                <caption>{caption}</caption>
                <tbody>
                    {data.map((d) => (
                        <tr key={d.key}>
                            <th scope="row">{d.title}</th>
                            <td>{formatValue(d.value)}</td>
                            {d.detail && <td>{d.detail}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </figure>
    );
}
