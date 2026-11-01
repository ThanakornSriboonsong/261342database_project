import { Head } from '@inertiajs/react';
import PageHeader from '@/components/admin/page-header';
import PromotionForm from '@/components/admin/promotion-form';
import { dashboard } from '@/routes/admin';
import { index } from '@/routes/admin/promotions';
import type { AdminPromotionForm, ProductOption, TierOption } from '@/types';

type Props = {
    tiers: TierOption[];
    products: ProductOption[];
    promotion: AdminPromotionForm;
};

export default function PromotionEdit({ tiers, products, promotion }: Props) {
    return (
        <>
            <Head title={`Edit ${promotion.code}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title={`แก้ไข ${promotion.code}`}
                    description={promotion.name}
                />
                <PromotionForm
                    key={promotion.promotion_id}
                    tiers={tiers}
                    products={products}
                    promotion={promotion}
                />
            </div>
        </>
    );
}

PromotionEdit.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'โปรโมชัน', href: index() },
        { title: 'แก้ไขโปรโมชัน', href: '#' },
    ],
};
