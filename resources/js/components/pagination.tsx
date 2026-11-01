import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types';

type Props = {
    paginator: Pick<Paginated<unknown>, 'links' | 'last_page'>;
};

/** ปุ่มเปลี่ยนหน้าจาก links ของ Laravel paginate */
export default function Pagination({ paginator }: Props) {
    if (paginator.last_page <= 1) {
        return null;
    }

    return (
        <nav
            aria-label="Pagination"
            className="flex flex-wrap items-center justify-center gap-1"
        >
            {paginator.links.map((link, i) => {
                const className = cn(
                    'min-w-9 rounded-full px-3 py-1.5 text-center text-sm',
                    link.active
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    !link.url && 'pointer-events-none opacity-40',
                );

                // label มาจาก Laravel เช่น "&laquo; Previous"
                const label = (
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                );

                return link.url ? (
                    <Link
                        key={i}
                        href={link.url}
                        preserveState
                        className={className}
                    >
                        {label}
                    </Link>
                ) : (
                    <span key={i} className={className}>
                        {label}
                    </span>
                );
            })}
        </nav>
    );
}
