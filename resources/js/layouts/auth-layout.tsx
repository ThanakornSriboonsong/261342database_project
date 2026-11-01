import ShopLayout from '@/layouts/shop-layout';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <ShopLayout>
            <div className="mx-auto w-full max-w-md py-4 sm:py-10">
                <div className="rounded-2xl border bg-card p-6 sm:p-8">
                    <div className="mb-6 space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </ShopLayout>
    );
}
