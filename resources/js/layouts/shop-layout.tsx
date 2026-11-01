import { Link, router, usePage } from '@inertiajs/react';
import {
    Heart,
    LogOut,
    Package,
    Search,
    Settings,
    ShoppingBag,
} from 'lucide-react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { home, login, logout, register } from '@/routes';
import { index as cartIndex } from '@/routes/cart';
import { index as ordersIndex } from '@/routes/orders';
import { edit as profileEdit } from '@/routes/profile';
import { index as productsIndex } from '@/routes/products';
import { index as wishlistIndex } from '@/routes/wishlist';

export default function ShopLayout({ children }: { children: ReactNode }) {
    const page = usePage();
    const { auth, name } = page.props;
    const getInitials = useInitials();

    // popup / dropdown ถูก render นอก layout ใส่ class ที่ body ให้ใช้สีร้านด้วย
    useEffect(() => {
        document.body.classList.add('shop');

        return () => document.body.classList.remove('shop');
    }, []);

    const path = page.url.split('?')[0];
    const isActive = (href: string) =>
        href === '/'
            ? path === '/'
            : path === href || path.startsWith(`${href}/`);

    const navLinks = [
        { label: 'หน้าแรก', href: home.url() },
        { label: 'สินค้าทั้งหมด', href: productsIndex.url() },
        ...(auth.user
            ? [{ label: 'Wishlist', href: wishlistIndex.url() }]
            : []),
    ];

    const search = (value: string) =>
        router.get(productsIndex.url(), value ? { search: value } : {});

    return (
        <div className="shop flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b bg-card">
                <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
                    <Link
                        href={home()}
                        className="shrink-0 text-lg font-semibold tracking-tight"
                    >
                        {name}
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                                    isActive(link.href)
                                        ? 'bg-banana text-on-banana'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <form
                        className="relative ml-auto hidden w-full max-w-xs lg:block"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const value = new FormData(e.currentTarget).get(
                                'search',
                            );
                            search(
                                typeof value === 'string' ? value.trim() : '',
                            );
                        }}
                    >
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            name="search"
                            type="search"
                            placeholder="ค้นหาสินค้า"
                            className="h-9 w-full rounded-full border bg-background pr-4 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
                        />
                    </form>

                    <div className="ml-auto flex items-center gap-1 lg:ml-0">
                        <Link
                            href={productsIndex()}
                            className="rounded-full p-2 text-muted-foreground hover:text-foreground md:hidden"
                            aria-label="สินค้าทั้งหมด"
                        >
                            <Search className="size-5" />
                        </Link>

                        {auth.user ? (
                            <>
                                <Link
                                    href={cartIndex()}
                                    aria-label="ตะกร้าสินค้า"
                                    className={cn(
                                        'rounded-full p-2 transition-colors hover:bg-muted',
                                        isActive(cartIndex.url())
                                            ? 'text-foreground'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    <ShoppingBag className="size-5" />
                                </Link>

                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        aria-label="เมนูบัญชี"
                                        className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <Avatar className="size-9">
                                            <AvatarFallback className="bg-muted text-sm font-medium">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-56"
                                    >
                                        <DropdownMenuLabel className="font-normal">
                                            <p className="truncate font-medium">
                                                {auth.user.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {auth.user.email}
                                            </p>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <MenuLink
                                            href={ordersIndex.url()}
                                            icon={Package}
                                        >
                                            คำสั่งซื้อของฉัน
                                        </MenuLink>
                                        <MenuLink
                                            href={wishlistIndex.url()}
                                            icon={Heart}
                                        >
                                            Wishlist
                                        </MenuLink>
                                        <MenuLink
                                            href={profileEdit.url()}
                                            icon={Settings}
                                        >
                                            ตั้งค่าบัญชี
                                        </MenuLink>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={logout()}
                                                as="button"
                                                className="w-full cursor-pointer"
                                                onClick={() =>
                                                    router.flushAll()
                                                }
                                            >
                                                <LogOut />
                                                ออกจากระบบ
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                                >
                                    เข้าสู่ระบบ
                                </Link>
                                <Link
                                    href={register()}
                                    className="hidden rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background hover:bg-foreground/90 sm:inline-block"
                                >
                                    สมัครสมาชิก
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
                {children}
            </main>

            <footer className="mt-12 border-t bg-card">
                <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2 lg:col-span-2">
                        <p className="text-lg font-semibold">{name}</p>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            ร้านกล้วยออนไลน์ คัดผลสดทุกวัน มีทั้งกล้วยหอม กล้วยไข่ กล้วยน้ำว้า
                            และกล้วยแปรรูป
                        </p>
                    </div>
                    <FooterColumn
                        title="ช้อปปิ้ง"
                        links={[
                            { label: 'สินค้าทั้งหมด', href: productsIndex.url() },
                            {
                                label: 'สินค้ามีพร้อมส่ง',
                                href: productsIndex.url({
                                    query: { in_stock: 1 },
                                }),
                            },
                            {
                                label: 'คะแนนรีวิวสูงสุด',
                                href: productsIndex.url({
                                    query: { sort: 'rating' },
                                }),
                            },
                        ]}
                    />
                    <FooterColumn
                        title="บัญชีของฉัน"
                        links={[
                            { label: 'ตะกร้าสินค้า', href: cartIndex.url() },
                            { label: 'คำสั่งซื้อ', href: ordersIndex.url() },
                            { label: 'Wishlist', href: wishlistIndex.url() },
                        ]}
                    />
                </div>
                <div className="border-t">
                    <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
                        © {new Date().getFullYear()} {name}
                    </p>
                </div>
            </footer>
        </div>
    );
}

function MenuLink({
    href,
    icon: Icon,
    children,
}: {
    href: string;
    icon: typeof Package;
    children: ReactNode;
}) {
    return (
        <DropdownMenuItem asChild>
            <Link href={href} className="w-full cursor-pointer">
                <Icon />
                {children}
            </Link>
        </DropdownMenuItem>
    );
}

function FooterColumn({
    title,
    links,
}: {
    title: string;
    links: { label: string; href: string }[];
}) {
    return (
        <div className="space-y-3">
            <p className="text-sm font-semibold">{title}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="hover:text-foreground"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
