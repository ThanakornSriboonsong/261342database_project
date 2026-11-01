import { Head } from '@inertiajs/react';
import PageHeader from '@/components/admin/page-header';
import PromotionForm from '@/components/admin/promotion-form';
import { dashboard } from '@/routes/admin';
import { create, index } from '@/routes/admin/promotions';
import type { ProductOption, TierOption } from '@/types';

type Props = {
    tiers: TierOption[];
    products: ProductOption[];
};

export default function PromotionCreate({ tiers, products }: Props) {
    return (
        <>
            <Head title="New promotion" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader title="เพิ่มโปรโมชัน" />
                <PromotionForm tiers={tiers} products={products} />
            </div>
        </>
    );
}

PromotionCreate.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'โปรโมชัน', href: index() },
        { title: 'เพิ่มโปรโมชัน', href: create() },
    ],
};
