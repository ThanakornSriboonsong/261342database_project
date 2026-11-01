import { Banana } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    src: string | null;
    alt: string;
    className?: string;
};

/** รูปสินค้า ถ้าไม่มี image_url จะแสดงไอคอนกล้วยบนพื้นสีอ่อน */
export default function ProductImage({ src, alt, className }: Props) {
    if (!src) {
        return (
            <div
                role="img"
                aria-label={alt}
                className={cn(
                    'flex aspect-square items-center justify-center bg-muted text-muted-foreground/50',
                    className,
                )}
            >
                <Banana className="size-1/4 stroke-[1.25]" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            className={cn('aspect-square bg-muted object-cover', className)}
        />
    );
}
