import { Minus, Plus } from 'lucide-react';

type Props = {
    value: number;
    max: number;
    disabled?: boolean;
    onChange: (value: number) => void;
};

/** ปุ่ม − จำนวน + (จำกัด 1 ถึง max) */
export default function QuantityStepper({
    value,
    max,
    disabled = false,
    onChange,
}: Props) {
    const buttonClass =
        'flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40';

    return (
        <div className="inline-flex items-center rounded-full border bg-card p-0.5">
            <button
                type="button"
                className={buttonClass}
                disabled={disabled || value <= 1}
                onClick={() => onChange(value - 1)}
                aria-label="ลดจำนวน"
            >
                <Minus className="size-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">
                {value}
            </span>
            <button
                type="button"
                className={buttonClass}
                disabled={disabled || value >= max}
                onClick={() => onChange(value + 1)}
                aria-label="เพิ่มจำนวน"
            >
                <Plus className="size-4" />
            </button>
        </div>
    );
}
