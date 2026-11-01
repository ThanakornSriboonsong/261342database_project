import { Head, Link } from '@inertiajs/react';
import { ArrowRight, PackageCheck, Star, Tag, Truck } from 'lucide-react';
import type { ReactNode } from 'react';
import ProductCard from '@/components/product-card';
import ProductImage from '@/components/product-image';
import PromotionCard, {
    CopyCode,
    describePromotion,
} from '@/components/promotion-card';
import { formatBaht, formatDate } from '@/lib/format';
import { index as productsIndex, show as productShow } from '@/routes/products';
import type { ProductCard as ProductCardData, PromotionSummary } from '@/types';

type Props = {
    newProducts: ProductCardData[];
    topRated: ProductCardData[];
    promotions: PromotionSummary[];
};

const perks = [
    {
        icon: PackageCheck,
        title: 'คัดผลทุกวัน',
        text: 'เลือกเฉพาะลูกที่สุกพอดี ไม่ช้ำ',
    },
    {
        icon: Truck,
        title: 'แพ็กอย่างดี',
        text: 'ห่อแยกหวี กันกระแทกระหว่างส่ง',
    },
    {
        icon: Tag,
        title: 'โค้ดส่วนลดสมาชิก',
        text: 'ยิ่งซื้อมาก ยิ่งได้สิทธิ์มากขึ้น',
    },
];

export default function Welcome({ newProducts, topRated, promotions }: Props) {
    const featured = topRated[0] ?? newProducts[0];
    const [mainPromotion, ...otherPromotions] = promotions;

    return (
        <>
            <Head title="Welcome" />

            <section className="grid items-center gap-8 rounded-2xl border bg-card p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
                <div className="space-y-5">
                    <p className="text-sm font-medium text-muted-foreground">
                        กล้วยสดและกล้วยแปรรูป
                    </p>
                    <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
                        กล้วยคัดเกรด
                        <br />
                        ส่งตรงถึงบ้านคุณ
                    </h1>
                    <p className="max-w-md text-muted-foreground">
                        หลากหลายสายพันธุ์ ตั้งแต่กล้วยหอม กล้วยไข่ ไปจนถึงกล้วยอบกรอบ สั่งง่าย
                        จ่ายสะดวก ติดตามคำสั่งซื้อได้ทุกขั้นตอน
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={productsIndex()}
                            className="inline-flex items-center gap-2 rounded-full bg-banana px-6 py-3 font-medium text-on-banana transition-colors hover:bg-banana/80"
                        >
                            เลือกซื้อสินค้า
                            <ArrowRight className="size-4" />
                        </Link>
                        <Link
                            href={productsIndex.url({
                                query: { sort: 'rating' },
                            })}
                            className="inline-flex items-center rounded-full border px-6 py-3 font-medium transition-colors hover:bg-muted"
                        >
                            สินค้าขายดี
                        </Link>
                    </div>
                </div>

                {featured && <FeaturedProduct product={featured} />}
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-3">
                {perks.map(({ icon: Icon, title, text }) => (
                    <div
                        key={title}
                        className="flex items-center gap-4 rounded-xl border bg-card p-4"
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-banana-soft">
                            <Icon className="size-5" />
                        </span>
                        <div>
                            <p className="font-medium">{title}</p>
                            <p className="text-sm text-muted-foreground">
                                {text}
                            </p>
                        </div>
                    </div>
                ))}
            </section>

            <Section title="สินค้าใหม่" href={productsIndex.url()}>
                {newProducts.length > 0 ? (
                    <ProductGrid products={newProducts} />
                ) : (
                    <p className="text-muted-foreground">ยังไม่มีสินค้า</p>
                )}
            </Section>

            {mainPromotion && (
                <section className="mt-14 flex flex-col gap-6 rounded-2xl bg-forest p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
                    <div className="space-y-2">
                        <p className="text-sm text-white/70">
                            โปรโมชัน · ถึง {formatDate(mainPromotion.end_date)}
                        </p>
                        <h2 className="text-2xl font-semibold sm:text-3xl">
                            {describePromotion(mainPromotion)}
                        </h2>
                        <p className="text-white/80">{mainPromotion.name}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <CopyCode
                            code={mainPromotion.code}
                            className="border-white/40 bg-white/10 text-white"
                        />
                        <Link
                            href={productsIndex()}
                            className="inline-flex items-center gap-2 rounded-full bg-banana px-5 py-2 font-medium text-on-banana transition-colors hover:bg-banana/80"
                        >
                            ช้อปเลย
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </section>
            )}

            {otherPromotions.length > 0 && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {otherPromotions.map((promotion) => (
                        <PromotionCard
                            key={promotion.promotion_id}
                            promotion={promotion}
                        />
                    ))}
                </div>
            )}

            {topRated.length > 0 && (
                <Section
                    title="คะแนนรีวิวสูงสุด"
                    href={productsIndex.url({ query: { sort: 'rating' } })}
                >
                    <ProductGrid products={topRated} />
                </Section>
            )}
        </>
    );
}

function FeaturedProduct({ product }: { product: ProductCardData }) {
    return (
        <Link
            href={productShow.url(product.product_id)}
            className="group relative block overflow-hidden rounded-xl border"
        >
            <ProductImage
                src={product.image_url}
                alt={product.name}
                className="w-full transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-lg bg-card/95 px-4 py-3 shadow-sm">
                <div className="min-w-0">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        {product.star === null ? (
                            'สินค้าแนะนำ'
                        ) : (
                            <>
                                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                {product.star} ({product.comments_count} รีวิว)
                            </>
                        )}
                    </p>
                </div>
                <span className="shrink-0 font-semibold">
                    {formatBaht(product.price)}
                </span>
            </div>
        </Link>
    );
}

function Section({
    title,
    href,
    children,
}: {
    title: string;
    href: string;
    children: ReactNode;
}) {
    return (
        <section className="mt-14">
            <div className="mb-5 flex items-end justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h2>
                <Link
                    href={href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    ดูทั้งหมด
                    <ArrowRight className="size-4" />
                </Link>
            </div>
            {children}
        </section>
    );
}

function ProductGrid({ products }: { products: ProductCardData[] }) {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
                <ProductCard key={product.product_id} product={product} />
            ))}
        </div>
    );
}
