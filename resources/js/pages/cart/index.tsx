import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import MoneySummary from '@/components/money-summary';
import ProductImage from '@/components/product-image';
import QuantityStepper from '@/components/quantity-stepper';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatBaht } from '@/lib/format';
import { cn } from '@/lib/utils';
import { destroy as cartDestroy, update as cartUpdate } from '@/routes/cart';
import {
    apply as applyPromotion,
    remove as removePromotion,
} from '@/routes/cart/promotion';
import { create as checkoutCreate } from '@/routes/checkout';
import { index as productsIndex, show as productShow } from '@/routes/products';
import type { CartItem, MoneySummary as MoneySummaryData } from '@/types';

type Props = {
    items: CartItem[];
    summary: MoneySummaryData;
    promotion: {
        code: string;
        name: string;
        type: 'discount' | 'buy_get';
    } | null;
};

export default function CartIndex({ items, summary, promotion }: Props) {
    const selectedCount = items.filter((item) => !item.is_out).length;

    if (items.length === 0) {
        return (
            <>
                <Head title="Cart" />
                <div className="mx-auto max-w-md rounded-2xl border bg-card px-6 py-16 text-center">
                    <ShoppingBag className="mx-auto mb-4 size-10 text-muted-foreground" />
                    <h1 className="text-xl font-semibold">ตะกร้าของคุณยังว่างอยู่</h1>
                    <p className="mt-1 mb-6 text-muted-foreground">
                        เลือกสินค้าที่ชอบแล้วกดใส่ตะกร้าได้เลย
                    </p>
                    <Button className="rounded-full" asChild>
                        <Link href={productsIndex()}>เลือกซื้อสินค้า</Link>
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Cart" />

            <h1 className="text-3xl font-semibold tracking-tight">
                ตะกร้าสินค้า{' '}
                <span className="text-muted-foreground">({items.length})</span>
            </h1>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
                ติ๊กเฉพาะสินค้าที่ต้องการสั่งรอบนี้ ({selectedCount} จาก {items.length}{' '}
                รายการ)
            </p>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div>
                    <div className="overflow-hidden rounded-xl border bg-card">
                        <div className="hidden grid-cols-[1fr_110px_130px_110px_40px] gap-4 border-b bg-muted/50 px-5 py-3 text-xs font-medium text-muted-foreground md:grid">
                            <span className="pl-8">สินค้า</span>
                            <span className="text-right">ราคาต่อชิ้น</span>
                            <span className="text-center">จำนวน</span>
                            <span className="text-right">รวม</span>
                            <span />
                        </div>
                        <ul className="divide-y">
                            {items.map((item) => (
                                <CartRow key={item.product_id} item={item} />
                            ))}
                        </ul>
                    </div>

                    <Link
                        href={productsIndex()}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        เลือกซื้อสินค้าต่อ
                    </Link>
                </div>

                <aside className="h-fit space-y-5 rounded-xl border bg-card p-6 lg:sticky lg:top-24">
                    <h2 className="text-lg font-semibold">สรุปคำสั่งซื้อ</h2>
                    <PromotionBox promotion={promotion} />
                    <MoneySummary
                        summary={summary}
                        discountNote={promotion?.code}
                    />
                    {selectedCount > 0 ? (
                        <Button
                            size="lg"
                            className="w-full rounded-full"
                            asChild
                        >
                            <Link href={checkoutCreate()}>ดำเนินการสั่งซื้อ</Link>
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            className="w-full rounded-full"
                            disabled
                        >
                            เลือกสินค้าอย่างน้อย 1 รายการ
                        </Button>
                    )}
                </aside>
            </div>
        </>
    );
}

function CartRow({ item }: { item: CartItem }) {
    const [error, setError] = useState<string>();
    const outOfStock = item.stock === 0;
    const href = productShow.url(item.product_id);

    const update = (data: { quantity?: number; is_out?: boolean }) =>
        router.patch(cartUpdate.url(item.product_id), data, {
            preserveScroll: true,
            onSuccess: () => setError(undefined),
            onError: (errors) => setError(errors.quantity),
        });

    const remove = () =>
        router.delete(cartDestroy.url(item.product_id), {
            preserveScroll: true,
        });

    return (
        <li
            className={cn(
                'grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 px-5 py-4 md:grid-cols-[1fr_110px_130px_110px_40px] md:items-center md:gap-4',
                item.is_out && 'bg-muted/30',
            )}
        >
            <div className="col-span-2 flex items-center gap-3 md:col-span-1">
                <Checkbox
                    checked={!item.is_out}
                    onCheckedChange={(checked) =>
                        update({ is_out: checked !== true })
                    }
                    aria-label={`เลือก ${item.name}`}
                />
                <Link href={href} className="shrink-0">
                    <ProductImage
                        src={item.image_url}
                        alt={item.name}
                        className={cn(
                            'size-16 rounded-lg border',
                            item.is_out && 'opacity-50',
                        )}
                    />
                </Link>
                <div className="min-w-0">
                    <Link
                        href={href}
                        className={cn(
                            'line-clamp-2 font-medium hover:underline',
                            item.is_out && 'text-muted-foreground',
                        )}
                    >
                        {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground md:hidden">
                        {formatBaht(item.price)} / ชิ้น
                    </p>
                    {outOfStock ? (
                        <p className="text-sm text-destructive">สินค้าหมด</p>
                    ) : (
                        item.quantity > item.stock && (
                            <p className="text-sm text-destructive">
                                เหลือเพียง {item.stock} ชิ้น
                            </p>
                        )
                    )}
                    <InputError message={error} />
                </div>
            </div>

            <span className="hidden text-right text-sm tabular-nums md:block">
                {formatBaht(item.price)}
            </span>

            <div className="col-start-2 flex items-center justify-between gap-3 md:contents">
                <div className="md:flex md:justify-center">
                    <QuantityStepper
                        value={item.quantity}
                        max={Math.min(item.stock, 99)}
                        disabled={outOfStock}
                        onChange={(quantity) => update({ quantity })}
                    />
                </div>
                <span className="text-right font-semibold tabular-nums">
                    {formatBaht(item.line_total)}
                </span>
                <button
                    type="button"
                    onClick={remove}
                    aria-label={`ลบ ${item.name}`}
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                >
                    <Trash2 className="size-4" />
                </button>
            </div>
        </li>
    );
}

function PromotionBox({ promotion }: { promotion: Props['promotion'] }) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const form = useForm({ code: '' });

    if (promotion) {
        return (
            <div className="flex items-center gap-3 rounded-lg bg-forest-soft px-3 py-2.5 text-sm">
                <Tag className="size-4 shrink-0 text-forest" />
                <div className="min-w-0 flex-1">
                    <p className="font-mono font-semibold">{promotion.code}</p>
                    <p className="truncate text-muted-foreground">
                        {promotion.name}
                    </p>
                </div>
                <button
                    type="button"
                    aria-label="ถอดโค้ด"
                    className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-white hover:text-foreground"
                    onClick={() =>
                        router.delete(removePromotion.url(), {
                            preserveScroll: true,
                        })
                    }
                >
                    <X className="size-4" />
                </button>
            </div>
        );
    }

    return (
        <form
            className="space-y-2"
            onSubmit={(e) => {
                e.preventDefault();
                form.post(applyPromotion.url(), {
                    preserveScroll: true,
                    onSuccess: () => form.reset(),
                });
            }}
        >
            <label htmlFor="promo-code" className="text-sm font-medium">
                โค้ดส่วนลด
            </label>
            <div className="flex gap-2">
                <input
                    id="promo-code"
                    value={form.data.code}
                    onChange={(e) => form.setData('code', e.target.value)}
                    placeholder="กรอกโค้ด"
                    className="h-10 min-w-0 flex-1 rounded-lg border bg-background px-3 font-mono text-sm uppercase outline-none placeholder:font-sans placeholder:text-muted-foreground placeholder:normal-case focus:border-ring"
                />
                <button
                    disabled={form.processing || form.data.code === ''}
                    className="h-10 rounded-lg bg-forest px-4 text-sm font-medium text-white transition-colors hover:bg-forest/90 disabled:opacity-50"
                >
                    ใช้โค้ด
                </button>
            </div>
            {/* errors.code อาจมาจาก checkout ที่ส่งกลับมา (โค้ดหมดอายุระหว่างทาง) */}
            <InputError message={form.errors.code ?? errors.code} />
        </form>
    );
}
