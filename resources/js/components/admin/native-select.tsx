import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** <select> ธรรมดาที่หน้าตาเหมือน <Input> (รองรับค่าว่าง "" ได้ ต่างจาก Radix Select) */
export default function NativeSelect({
    className,
    ...props
}: ComponentProps<'select'>) {
    return (
        <select
            className={cn(
                'h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30',
                className,
            )}
            {...props}
        />
    );
}
