import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Heart, Pencil, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import ProductImage from '@/components/product-image';
import PromotionCard from '@/components/promotion-card';
import QuantityStepper from '@/components/quantity-stepper';
import StarRating, { StarInput } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { formatBaht, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { home, login } from '@/routes';
import { store as cartStore } from '@/routes/cart';
import {
    destroy as commentDestroy,
    store as commentStore,
    update as commentUpdate,
} from '@/routes/comments';
import { index as productsIndex } from '@/routes/products';
import {
    destroy as wishlistDestroy,
    store as wishlistStore,
} from '@/routes/wishlist';
import type { ProductCard, ProductComment, PromotionSummary } from '@/types';

type Props = {
    product: ProductCard & { detail: string | null };
    comments: ProductComment[];
    promotions: PromotionSummary[];
    starCounts: Record<string, number> | [];
};

const textareaClass =
    'w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring';

export default function ProductShow({
    product,
    comments,
    promotions,
    starCounts,
}: Props) {
    const { auth } = usePage().props;
    const soldOut = product.stock === 0;
    const maxQuantity = Math.min(product.stock, 99);

    const cartForm = useForm({
        product_id: product.product_id,
        quantity: 1,
    });

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

    return (
        <>
            <Head title={product.name} />

            <nav className="mb-4 text-sm text-muted-foreground">
                <Link href={home()} className="hover:text-foreground">
                    หน้าแรก
                </Link>{' '}
                /{' '}
                <Link href={productsIndex()} className="hover:text-foreground">
                    สินค้าทั้งหมด
                </Link>{' '}
                / <span className="text-foreground">{product.name}</span>
            </nav>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="overflow-hidden rounded-2xl border bg-card">
                    <ProductImage
                        src={product.image_url}
                        alt={product.name}
                        className="w-full"
                    />
                </div>

                <div className="flex flex-col rounded-2xl border bg-card p-6 sm:p-8">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {product.name}
                    </h1>

                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        {product.star === null ? (
                            'ยังไม่มีรีวิว'
                        ) : (
                            <>
                                <StarRating value={product.star} />
                                <span className="text-foreground">
                                    {product.star}
                                </span>
                                <a href="#reviews" className="hover:underline">
                                    ({product.comments_count} รีวิว)
                                </a>
                            </>
                        )}
                    </div>

                    <p className="mt-6 text-4xl font-semibold">
                        {formatBaht(product.price)}
                    </p>

                    <p
                        className={cn(
                            'mt-2 text-sm',
                            soldOut ? 'text-destructive' : 'text-forest',
                        )}
                    >
                        {soldOut
                            ? 'สินค้าหมดชั่วคราว'
                            : `มีสินค้า · เหลือ ${product.stock} ชิ้น`}
                    </p>

                    {product.detail && (
                        <p className="mt-6 whitespace-pre-line text-muted-foreground">
                            {product.detail}
                        </p>
                    )}

                    <div className="mt-8 border-t pt-6">
                        {auth.user ? (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    cartForm.post(cartStore.url(), {
                                        preserveScroll: true,
                                        onSuccess: () =>
                                            cartForm.reset('quantity'),
                                    });
                                }}
                            >
                                <div className="flex flex-wrap items-center gap-3">
                                    <QuantityStepper
                                        value={cartForm.data.quantity}
                                        max={maxQuantity}
                                        disabled={soldOut}
                                        onChange={(quantity) =>
                                            cartForm.setData(
                                                'quantity',
                                                Math.min(
                                                    Math.max(quantity, 1),
                                                    maxQuantity,
                                                ),
                                            )
                                        }
                                    />
                                    <Button
                                        size="lg"
                                        className="flex-1 rounded-full"
                                        disabled={
                                            soldOut || cartForm.processing
                                        }
                                    >
                                        <ShoppingBag />
                                        ใส่ตะกร้า
                                    </Button>
                                    <Button
                                        type="button"
                                        size="lg"
                                        variant="outline"
                                        className="rounded-full"
                                        onClick={toggleWish}
                                        aria-label={
                                            product.is_wished
                                                ? 'เอาออกจาก wishlist'
                                                : 'เพิ่มใน wishlist'
                                        }
                                    >
                                        <Heart
                                            className={cn(
                                                product.is_wished &&
                                                    'fill-rose-500 text-rose-500',
                                            )}
                                        />
                                    </Button>
                                </div>
                                <InputError
                                    className="mt-2"
                                    message={
                                        cartForm.errors.quantity ??
                                        cartForm.errors.product_id
                                    }
                                />
                            </form>
                        ) : (
                            <Button
                                size="lg"
                                className="w-full rounded-full"
                                asChild
                            >
                                <Link href={login()}>เข้าสู่ระบบเพื่อสั่งซื้อ</Link>
                            </Button>
                        )}
                    </div>

                    {promotions.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <p className="text-sm font-medium">
                                โค้ดที่ใช้กับสินค้านี้ได้
                            </p>
                            {promotions.map((promotion) => (
                                <PromotionCard
                                    key={promotion.promotion_id}
                                    promotion={promotion}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <section id="reviews" className="mt-14 scroll-mt-24">
                <h2 className="mb-5 text-2xl font-semibold tracking-tight">
                    รีวิวจากผู้ซื้อ
                </h2>

                <StarBreakdown
                    starCounts={starCounts}
                    total={product.comments_count}
                    average={product.star}
                />

                {comments.length > 0 && (
                    <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {comments.map((comment) => (
                            <CommentCard
                                key={comment.comment_id}
                                comment={comment}
                            />
                        ))}
                    </ul>
                )}

                <div className="mt-6">
                    {auth.user ? (
                        <ReviewForm productId={product.product_id} />
                    ) : (
                        <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
                            <Link
                                href={login()}
                                className="font-medium text-foreground underline"
                            >
                                เข้าสู่ระบบ
                            </Link>{' '}
                            เพื่อเขียนรีวิวสินค้านี้
                        </p>
                    )}
                </div>
            </section>
        </>
    );
}

function StarBreakdown({
    starCounts,
    total,
    average,
}: {
    starCounts: Props['starCounts'];
    total: number;
    average: number | null;
}) {
    // ถ้ายังไม่มีรีวิว backend ส่ง [] มา
    const counts = Array.isArray(starCounts) ? {} : starCounts;

    return (
        <div className="grid gap-6 rounded-xl border bg-card p-6 sm:grid-cols-[180px_1fr] sm:items-center">
            <div className="text-center sm:border-r sm:pr-6">
                <p className="text-5xl font-semibold">{average ?? '–'}</p>
                <StarRating
                    value={average ?? 0}
                    className="mt-2 justify-center"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                    {total > 0 ? `จาก ${total} รีวิว` : 'ยังไม่มีรีวิว'}
                </p>
            </div>
            <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = counts[star] ?? 0;
                    const percent = total > 0 ? (count / total) * 100 : 0;

                    return (
                        <div
                            key={star}
                            className="flex items-center gap-3 text-sm"
                        >
                            <span className="w-12 text-muted-foreground">
                                {star} ดาว
                            </span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-banana"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            <span className="w-8 text-right text-muted-foreground tabular-nums">
                                {count}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ReviewForm({ productId }: { productId: number }) {
    const form = useForm({ comment: '', star: 5 });

    return (
        <form
            className="space-y-4 rounded-xl border border-t-4 border-t-banana bg-card p-6"
            onSubmit={(e) => {
                e.preventDefault();
                form.post(commentStore.url(productId), {
                    preserveScroll: true,
                    onSuccess: () => form.reset(),
                });
            }}
        >
            <div>
                <p className="text-lg font-semibold">เขียนรีวิว</p>
                <p className="text-sm text-muted-foreground">
                    แบ่งปันความเห็นของคุณกับผู้ซื้อคนอื่น
                </p>
            </div>
            <div>
                <StarInput
                    value={form.data.star}
                    onChange={(star) => form.setData('star', star)}
                />
                <InputError message={form.errors.star} />
            </div>
            <div>
                <textarea
                    value={form.data.comment}
                    onChange={(e) => form.setData('comment', e.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder="รสชาติ ความสด การแพ็กเป็นอย่างไรบ้าง"
                    className={textareaClass}
                />
                <InputError message={form.errors.comment} />
            </div>
            <Button className="rounded-full" disabled={form.processing}>
                ส่งรีวิว
            </Button>
        </form>
    );
}

function CommentCard({ comment }: { comment: ProductComment }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({ comment: comment.comment, star: comment.star });

    const remove = () => {
        if (confirm('ลบรีวิวนี้?')) {
            router.delete(commentDestroy.url(comment.comment_id), {
                preserveScroll: true,
            });
        }
    };

    if (editing) {
        return (
            <li className="rounded-xl border bg-card p-5">
                <form
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.patch(commentUpdate.url(comment.comment_id), {
                            preserveScroll: true,
                            onSuccess: () => setEditing(false),
                        });
                    }}
                >
                    <StarInput
                        value={form.data.star}
                        onChange={(star) => form.setData('star', star)}
                    />
                    <InputError message={form.errors.star} />
                    <textarea
                        value={form.data.comment}
                        onChange={(e) =>
                            form.setData('comment', e.target.value)
                        }
                        rows={3}
                        maxLength={2000}
                        className={textareaClass}
                    />
                    <InputError message={form.errors.comment} />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="rounded-full"
                            disabled={form.processing}
                        >
                            บันทึก
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="rounded-full"
                            onClick={() => {
                                form.reset();
                                form.clearErrors();
                                setEditing(false);
                            }}
                        >
                            ยกเลิก
                        </Button>
                    </div>
                </form>
            </li>
        );
    }

    return (
        <li className="flex flex-col rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between gap-2">
                <StarRating value={comment.star} />
                <span className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                </span>
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed whitespace-pre-line">
                {comment.comment}
            </p>
            <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {comment.user_name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="text-sm font-medium">
                        {comment.user_name}
                    </span>
                </div>
                {comment.can_edit && (
                    <div className="flex">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={() => setEditing(true)}
                            aria-label="แก้รีวิว"
                        >
                            <Pencil />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={remove}
                            aria-label="ลบรีวิว"
                        >
                            <Trash2 />
                        </Button>
                    </div>
                )}
            </div>
        </li>
    );
}
