import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';

export default function Appearance() {
    return (
        <>
            <Head title="Appearance settings" />

            <section className="rounded-xl border bg-card p-6">
                <h2 className="text-lg font-semibold">การแสดงผล</h2>
                <p className="mt-1 mb-6 text-sm text-muted-foreground">
                    เลือกโหมดสว่าง โหมดมืด หรือให้เปลี่ยนตามการตั้งค่าของอุปกรณ์
                </p>
                <AppearanceTabs />
            </section>
        </>
    );
}
