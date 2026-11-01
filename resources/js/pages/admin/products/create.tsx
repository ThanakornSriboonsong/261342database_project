import { Head } from '@inertiajs/react';
import PageHeader from '@/components/admin/page-header';
import ProductForm from '@/components/admin/product-form';
import { dashboard } from '@/routes/admin';
import { create, index } from '@/routes/admin/products';

export default function ProductCreate() {
    return (
        <>
            <Head title="New product" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader title="เพิ่มสินค้า" />
                <ProductForm />
            </div>
        </>
    );
}

ProductCreate.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'สินค้า', href: index() },
        { title: 'เพิ่มสินค้า', href: create() },
    ],
};
