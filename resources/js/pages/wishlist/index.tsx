import { Head, Link } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { index as productsIndex } from '@/routes/products';
import type { ProductCard as ProductCardData } from '@/types';

type Props = {
    products: (ProductCardData & { added_at: string })[];
};

export default function WishlistIndex({ products }: Props) {
    return (
        <>
            <Head title="Wishlist" />

            <div className="mb-6 flex items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight">
                    Wishlist
                </h1>
                {products.length > 0 && (
                    <span className="rounded-full bg-banana-soft px-3 py-0.5 text-sm font-medium">
                        {products.length} รายการ
                    </span>
                )}
            </div>

            {products.length === 0 ? (
                <div className="mx-auto max-w-md rounded-2xl border bg-card px-6 py-16 text-center">
                    <Heart className="mx-auto mb-4 size-10 text-muted-foreground" />
                    <p className="font-medium">ยังไม่มีสินค้าที่บันทึกไว้</p>
                    <p className="mt-1 mb-6 text-sm text-muted-foreground">
                        กดรูปหัวใจที่สินค้าเพื่อเก็บไว้ดูทีหลัง
                    </p>
                    <Button className="rounded-full" asChild>
                        <Link href={productsIndex()}>เลือกซื้อสินค้า</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard
                            key={product.product_id}
                            product={product}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
