import { Link, useForm } from '@inertiajs/react';
import NativeSelect from '@/components/admin/native-select';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { index, store, update } from '@/routes/admin/promotions';
import type { AdminPromotionForm, ProductOption, TierOption } from '@/types';

type Props = {
    tiers: TierOption[];
    products: ProductOption[];
    promotion?: AdminPromotionForm; // ไม่มี = เพิ่มโปรใหม่
};

const today = () => new Date().toISOString().slice(0, 10);
const toInput = (value: number | null) => (value === null ? '' : String(value));

/** ฟอร์มเพิ่ม / แก้โปรโมชัน: ส่วนลด % หรือ ซื้อ X แถม Y */
export default function PromotionForm({ tiers, products, promotion }: Props) {
    const form = useForm({
        name: promotion?.name ?? '',
        code: promotion?.code ?? '',
        type: promotion?.type ?? ('discount' as AdminPromotionForm['type']),
        tier_id: toInput(promotion?.tier_id ?? null),
        start_date: promotion?.start_date ?? today(),
        end_date: promotion?.end_date ?? '',
        percent: toInput(promotion?.percent ?? null),
        max_discount: toInput(promotion?.max_discount ?? null),
        buy_qty: toInput(promotion?.buy_qty ?? null),
        get_qty: toInput(promotion?.get_qty ?? null),
        product_ids: promotion?.product_ids ?? ([] as number[]),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // ส่งเฉพาะช่องของประเภทที่เลือก อีกประเภทเป็น null
        form.transform((data) => ({
            ...data,
            ...(data.type === 'discount'
                ? { buy_qty: null, get_qty: null }
                : { percent: null, max_discount: null }),
        }));

        if (promotion) {
            form.put(update.url(promotion.promotion_id));
        } else {
            form.post(store.url());
        }
    };

    const toggleProduct = (productId: number, checked: boolean) =>
        form.setData(
            'product_ids',
            checked
                ? [...form.data.product_ids, productId]
                : form.data.product_ids.filter((id) => id !== productId),
        );

    return (
        <form
            onSubmit={submit}
            className="grid gap-6 rounded-xl border bg-card p-5 md:p-6"
        >
            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="ชื่อโปรโมชัน" id="name" error={form.errors.name}>
                    <Input
                        id="name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        required
                    />
                </Field>
                <Field
                    label="โค้ด"
                    id="code"
                    error={form.errors.code}
                    hint="ตัวอักษร ตัวเลข - และ _ เท่านั้น ระบบจะแปลงเป็นตัวพิมพ์ใหญ่"
                >
                    <Input
                        id="code"
                        value={form.data.code}
                        onChange={(e) =>
                            form.setData('code', e.target.value.toUpperCase())
                        }
                        className="font-mono uppercase"
                        required
                    />
                </Field>
            </div>

            <fieldset className="grid gap-2">
                <legend className="mb-2 text-sm font-medium">ประเภท</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                    {(
                        [
                            [
                                'discount',
                                'ส่วนลด %',
                                'ลดเป็นเปอร์เซ็นต์ กำหนดเพดานได้',
                            ],
                            ['buy_get', 'ซื้อ X แถม Y', 'เช่น ซื้อ 2 แถม 1'],
                        ] as const
                    ).map(([value, label, description]) => (
                        <label
                            key={value}
                            className={cn(
                                'flex cursor-pointer gap-3 rounded-lg border p-4 text-sm',
                                form.data.type === value &&
                                    'border-foreground ring-1 ring-foreground',
                            )}
                        >
                            <input
                                type="radio"
                                name="type"
                                value={value}
                                checked={form.data.type === value}
                                onChange={() => form.setData('type', value)}
                                className="mt-0.5 accent-foreground"
                            />
                            <span>
                                <span className="block font-medium">
                                    {label}
                                </span>
                                <span className="text-muted-foreground">
                                    {description}
                                </span>
                            </span>
                        </label>
                    ))}
                </div>
                <InputError message={form.errors.type} />
            </fieldset>

            {form.data.type === 'discount' ? (
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                        label="ลด (%)"
                        id="percent"
                        error={form.errors.percent}
                    >
                        <Input
                            id="percent"
                            type="number"
                            min={0.01}
                            max={100}
                            step="0.01"
                            value={form.data.percent}
                            onChange={(e) =>
                                form.setData('percent', e.target.value)
                            }
                            required
                        />
                    </Field>
                    <Field
                        label="ลดสูงสุด (บาท)"
                        id="max_discount"
                        error={form.errors.max_discount}
                        hint="เว้นว่าง = ไม่จำกัด"
                    >
                        <Input
                            id="max_discount"
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.data.max_discount}
                            onChange={(e) =>
                                form.setData('max_discount', e.target.value)
                            }
                        />
                    </Field>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                        label="ซื้อ (ชิ้น)"
                        id="buy_qty"
                        error={form.errors.buy_qty}
                    >
                        <Input
                            id="buy_qty"
                            type="number"
                            min={1}
                            step={1}
                            value={form.data.buy_qty}
                            onChange={(e) =>
                                form.setData('buy_qty', e.target.value)
                            }
                            required
                        />
                    </Field>
                    <Field
                        label="แถม (ชิ้น)"
                        id="get_qty"
                        error={form.errors.get_qty}
                    >
                        <Input
                            id="get_qty"
                            type="number"
                            min={1}
                            step={1}
                            value={form.data.get_qty}
                            onChange={(e) =>
                                form.setData('get_qty', e.target.value)
                            }
                            required
                        />
                    </Field>
                </div>
            )}

            <div className="grid gap-5 sm:grid-cols-3">
                <Field
                    label="เริ่ม"
                    id="start_date"
                    error={form.errors.start_date}
                >
                    <Input
                        id="start_date"
                        type="date"
                        value={form.data.start_date}
                        onChange={(e) =>
                            form.setData('start_date', e.target.value)
                        }
                        required
                    />
                </Field>
                <Field label="สิ้นสุด" id="end_date" error={form.errors.end_date}>
                    <Input
                        id="end_date"
                        type="date"
                        min={form.data.start_date}
                        value={form.data.end_date}
                        onChange={(e) =>
                            form.setData('end_date', e.target.value)
                        }
                        required
                    />
                </Field>
                <Field
                    label="ใช้ได้เฉพาะ tier"
                    id="tier_id"
                    error={form.errors.tier_id}
                >
                    <NativeSelect
                        id="tier_id"
                        value={form.data.tier_id}
                        onChange={(e) =>
                            form.setData('tier_id', e.target.value)
                        }
                    >
                        <option value="">ทุกคน</option>
                        {tiers.map((tier) => (
                            <option key={tier.tier_id} value={tier.tier_id}>
                                {tier.name} ขึ้นไป
                            </option>
                        ))}
                    </NativeSelect>
                </Field>
            </div>

            <fieldset className="grid gap-2">
                <legend className="text-sm font-medium">สินค้าที่ร่วมโปร</legend>
                <p className="mb-1 text-xs text-muted-foreground">
                    ไม่เลือกเลย = ใช้ได้กับทุกสินค้า
                    {form.data.product_ids.length > 0 &&
                        ` (เลือกแล้ว ${form.data.product_ids.length} รายการ)`}
                </p>
                <div className="grid max-h-64 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <label
                            key={product.product_id}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                            <Checkbox
                                checked={form.data.product_ids.includes(
                                    product.product_id,
                                )}
                                onCheckedChange={(checked) =>
                                    toggleProduct(
                                        product.product_id,
                                        checked === true,
                                    )
                                }
                            />
                            {product.name}
                        </label>
                    ))}
                </div>
                <InputError message={form.errors.product_ids} />
            </fieldset>

            <div className="flex gap-2">
                <Button type="submit" disabled={form.processing}>
                    {promotion ? 'บันทึก' : 'เพิ่มโปรโมชัน'}
                </Button>
                <Button variant="ghost" asChild>
                    <Link href={index()}>ยกเลิก</Link>
                </Button>
            </div>
        </form>
    );
}

function Field({
    label,
    id,
    error,
    hint,
    children,
}: {
    label: string;
    id: string;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid content-start gap-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            <InputError message={error} />
        </div>
    );
}
