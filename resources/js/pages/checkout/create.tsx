import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Lock } from 'lucide-react';
import CheckoutSteps from '@/components/checkout-steps';
import InputError from '@/components/input-error';
import MoneySummary from '@/components/money-summary';
import ProductImage from '@/components/product-image';
import { Button } from '@/components/ui/button';
import { formatBaht } from '@/lib/format';
import { index as cartIndex } from '@/routes/cart';
import { store as checkoutStore } from '@/routes/checkout';
import type { CheckoutItem, MoneySummary as MoneySummaryData } from '@/types';

type Props = {
    items: CheckoutItem[];
    summary: MoneySummaryData;
    promotion: { code: string; name: string } | null;
    shippingAddress: string | null;
};

export default function CheckoutCreate({
    items,
    summary,
    promotion,
    shippingAddress,
}: Props) {
    const form = useForm({ shipping_address: shippingAddress ?? '' });
    // cart / code ไม่ใช่ช่องในฟอร์ม แต่ backend อาจส่ง error key นี้มา
    const errors = form.errors as Record<string, string | undefined>;

    return (
        <>
            <Head title="Checkout" />

            <div className="mb-8 flex flex-col gap-6 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
                <Link
                    href={cartIndex()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    กลับไปตะกร้า
                </Link>
                <div className="sm:w-[480px]">
                    <CheckoutSteps current={1} />
                </div>
            </div>

            <form
                className="grid gap-6 lg:grid-cols-[1fr_380px]"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post(checkoutStore.url());
                }}
            >
                <section className="h-fit rounded-xl border bg-card p-6">
                    <h1 className="text-xl font-semibold">ที่อยู่จัดส่ง</h1>
                    <p className="mt-1 mb-4 text-sm text-muted-foreground">
                        กรอกชื่อผู้รับ เบอร์โทร และที่อยู่ให้ครบถ้วน
                    </p>
                    <textarea
                        id="shipping_address"
                        aria-label="ที่อยู่จัดส่ง"
                        value={form.data.shipping_address}
                        onChange={(e) =>
                            form.setData('shipping_address', e.target.value)
                        }
                        rows={6}
                        maxLength={1000}
                        required
                        placeholder={
                            'ชื่อผู้รับ / เบอร์โทร\nบ้านเลขที่ ถนน แขวง/ตำบล\nเขต/อำเภอ จังหวัด รหัสไปรษณีย์'
                        }
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
                    />
                    <InputError message={errors.shipping_address} />
                </section>

                <aside className="h-fit space-y-5 rounded-xl border bg-card p-6 lg:sticky lg:top-24">
                    <h2 className="text-lg font-semibold">
                        รายการสินค้า{' '}
                        <span className="font-normal text-muted-foreground">
                            ({items.length})
                        </span>
                    </h2>
                    <ul className="space-y-4">
                        {items.map((item) => (
                            <li
                                key={item.product_id}
                                className="flex items-center gap-3"
                            >
                                <ProductImage
                                    src={item.image_url}
                                    alt={item.name}
                                    className="size-14 shrink-0 rounded-lg border"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-1 text-sm font-medium">
                                        {item.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatBaht(item.price)} ×{' '}
                                        {item.quantity}
                                    </p>
                                </div>
                                <span className="text-sm font-medium tabular-nums">
                                    {formatBaht(item.line_total)}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t pt-5">
                        <MoneySummary
                            summary={summary}
                            discountNote={
                                promotion &&
                                `${promotion.code} · ${promotion.name}`
                            }
                        />
                    </div>

                    {(errors.cart || errors.code) && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-sm">
                            <InputError message={errors.cart} />
                            <InputError message={errors.code} />
                            <Link
                                href={cartIndex()}
                                className="mt-1 inline-block underline"
                            >
                                แก้ไขตะกร้า
                            </Link>
                        </div>
                    )}

                    <Button
                        size="lg"
                        className="w-full rounded-full"
                        disabled={form.processing}
                    >
                        <Lock />
                        ยืนยันสั่งซื้อ · {formatBaht(summary.total)}
                    </Button>
                </aside>
            </form>
        </>
    );
}
