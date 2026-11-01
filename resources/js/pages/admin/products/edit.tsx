import { Head } from '@inertiajs/react';
import PageHeader from '@/components/admin/page-header';
import ProductForm from '@/components/admin/product-form';
import { dashboard } from '@/routes/admin';
import { index } from '@/routes/admin/products';
import type { AdminProduct } from '@/types';

type Props = {
    product: AdminProduct;
};

export default function ProductEdit({ product }: Props) {
    return (
        <>
            <Head title={`Edit ${product.name}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title={`แก้ไข ${product.name}`}
                    description={`รหัสสินค้า #${product.product_id}`}
                />
                {/* key: เปิดสินค้าอื่นแล้วฟอร์มต้องเริ่มใหม่ */}
                <ProductForm key={product.product_id} product={product} />
            </div>
        </>
    );
}

ProductEdit.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'สินค้า', href: index() },
        { title: 'แก้ไขสินค้า', href: '#' },
    ],
};
