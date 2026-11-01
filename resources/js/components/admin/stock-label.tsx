import { LOW_STOCK } from '@/lib/admin';

/** ป้าย stock: หมด (แดง) / ใกล้หมด (เหลือง) / ปกติ (ตัวเลขธรรมดา) */
export default function StockLabel({ stock }: { stock: number }) {
    if (stock === 0) {
        return (
            <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                หมด
            </span>
        );
    }

    if (stock <= LOW_STOCK) {
        return (
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 tabular-nums dark:bg-amber-950 dark:text-amber-300">
                เหลือ {stock}
            </span>
        );
    }

    return <span className="tabular-nums">{stock}</span>;
}
