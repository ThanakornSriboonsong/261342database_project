import { Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import InputError from '@/components/input-error';
import ProductImage from '@/components/product-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index, store, update } from '@/routes/admin/products';
import type { AdminProduct } from '@/types';

type Props = {
    product?: AdminProduct; // ไม่มี = เพิ่มสินค้าใหม่
};

/** ฟอร์มเพิ่ม / แก้สินค้า อัปโหลดรูป หรือใส่ URL รูปก็ได้ */
export default function ProductForm({ product }: Props) {
    const form = useForm({
        name: product?.name ?? '',
        detail: product?.detail ?? '',
        price: product ? String(product.price) : '',
        stock: product ? String(product.stock) : '0',
        image_url: product?.image_url ?? '',
        image: null as File | null,
    });

    const preview = useMemo(
        () => (form.data.image ? URL.createObjectURL(form.data.image) : null),
        [form.data.image],
    );

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (product) {
            // อัปโหลดไฟล์ต้องส่งเป็น POST + _method: 'put' (ข้อจำกัดของ PHP)
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(update.url(product.product_id));
        } else {
            form.post(store.url());
        }
    };

    return (
        <form
            onSubmit={submit}
            className="grid gap-6 rounded-xl border bg-card p-5 md:grid-cols-[1fr_240px] md:p-6"
        >
            <div className="grid content-start gap-5">
                <div className="grid gap-2">
                    <Label htmlFor="name">ชื่อสินค้า</Label>
                    <Input
                        id="name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        required
                        autoFocus={!product}
                    />
                    <InputError message={form.errors.name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="detail">รายละเอียด</Label>
                    <textarea
                        id="detail"
                        rows={5}
                        value={form.data.detail}
                        onChange={(e) => form.setData('detail', e.target.value)}
                        className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                    />
                    <InputError message={form.errors.detail} />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="price">ราคา (บาท)</Label>
                        <Input
                            id="price"
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.data.price}
                            onChange={(e) =>
                                form.setData('price', e.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.price} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stock">จำนวนในคลัง</Label>
                        <Input
                            id="stock"
                            type="number"
                            min={0}
                            step={1}
                            value={form.data.stock}
                            onChange={(e) =>
                                form.setData('stock', e.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.stock} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="image_url">URL รูป</Label>
                    <Input
                        id="image_url"
                        value={form.data.image_url}
                        placeholder="https://… หรือเว้นว่างถ้าอัปโหลดไฟล์"
                        onChange={(e) =>
                            form.setData('image_url', e.target.value)
                        }
                        disabled={form.data.image !== null}
                    />
                    <InputError message={form.errors.image_url} />
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={form.processing}>
                        {product ? 'บันทึก' : 'เพิ่มสินค้า'}
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href={index()}>ยกเลิก</Link>
                    </Button>
                </div>
            </div>

            <div className="grid content-start gap-3">
                <Label>รูปสินค้า</Label>
                <ProductImage
                    src={preview ?? (form.data.image_url || null)}
                    alt={form.data.name || 'รูปสินค้า'}
                    className="w-full rounded-lg border"
                />
                <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        form.setData('image', e.target.files?.[0] ?? null)
                    }
                />
                <p className="text-xs text-muted-foreground">
                    ไฟล์รูปไม่เกิน 2MB
                    {product && ' ไม่เลือกไฟล์ = ใช้รูปเดิม'}
                </p>
                {form.progress && (
                    <progress
                        value={form.progress.percentage}
                        max={100}
                        className="w-full"
                    />
                )}
                <InputError message={form.errors.image} />
            </div>
        </form>
    );
}
