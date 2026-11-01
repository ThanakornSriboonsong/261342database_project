import { Link, router, usePage } from '@inertiajs/react';
import { Heart, Plus, Star } from 'lucide-react';
import ProductImage from '@/components/product-image';
import { formatBaht } from '@/lib/format';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { store as cartStore } from '@/routes/cart';
import { show as productShow } from '@/routes/products';
import {
    destroy as wishlistDestroy,
    store as wishlistStore,
} from '@/routes/wishlist';
import type { ProductCard as ProductCardData } from '@/types';

type Props = {
    product: ProductCardData;
};

export default function ProductCard({ product }: Props) {
    const { auth } = usePage().props;
    const soldOut = product.stock === 0;
    const href = productShow.url(product.product_id);

    const toggleWish = () =>
        product.is_wished
            ? router.delete(wishlistDestroy.url(product.product_id), {
                  preserveScroll: true,
              })
            : router.post(
                  wishlistStore.url(product.product_id),
                  {},
                  { preserveScroll: true },
              );

    const addToCart = () =>
        router.post(
            cartStore.url(),
            { product_id: product.product_id },
            { preserveScroll: true },
        );

    return (
        <div className="group flex flex-col overflow-hidden rounded-xl border bg-card">
            <div className="relative">
                <Link href={href} className="block overflow-hidden">
                    <ProductImage
                        src={product.image_url}
                        alt={product.name}
                        className="w-full transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                </Link>

                {soldOut && (
                    <span className="absolute top-3 left-3 rounded-md bg-foreground px-2 py-0.5 text-xs font-medium text-background">
                        สินค้าหมด
                    </span>
                )}

                {auth.user && (
                    <button
                        type="button"
                        onClick={toggleWish}
                        aria-label={
                            product.is_wished
                                ? 'เอาออกจาก wishlist'
                                : 'เพิ่มใน wishlist'
                        }
                        className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-card shadow-sm transition-colors hover:bg-muted"
                    >
                        <Heart
                            className={cn(
                                'size-4',
                                product.is_wished
                                    ? 'fill-rose-500 text-rose-500'
                                    : 'text-foreground',
                            )}
                        />
                    </button>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <Link
                    href={href}
                    className="line-clamp-2 leading-snug font-medium hover:underline"
                >
                    {product.name}
                </Link>

                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    {product.star === null ? (
                        'ยังไม่มีรีวิว'
                    ) : (
                        <>
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-foreground">
                                {product.star}
                            </span>
                            <span>({product.comments_count})</span>
                        </>
                    )}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="text-lg font-semibold">
                        {formatBaht(product.price)}
                    </span>

                    {auth.user ? (
                        <button
                            type="button"
                            onClick={addToCart}
                            disabled={soldOut}
                            className="inline-flex items-center gap-1 rounded-full bg-banana px-3 py-1.5 text-sm font-medium text-on-banana transition-colors hover:bg-banana/80 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                        >
                            <Plus className="size-4" />
                            ใส่ตะกร้า
                        </button>
                    ) : (
                        <Link
                            href={login()}
                            className="inline-flex items-center gap-1 rounded-full bg-banana px-3 py-1.5 text-sm font-medium text-on-banana transition-colors hover:bg-banana/80"
                        >
                            <Plus className="size-4" />
                            ใส่ตะกร้า
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
