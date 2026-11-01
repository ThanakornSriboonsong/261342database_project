import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    FolderGit2,
    LayoutDashboard,
    Package,
    Receipt,
    Store,
    Tag,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { home } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as adminOrders } from '@/routes/admin/orders';
import { index as adminProducts } from '@/routes/admin/products';
import { index as adminPromotions } from '@/routes/admin/promotions';
import { index as adminSalesReport } from '@/routes/admin/sales-report';
import { index as adminUsers } from '@/routes/admin/users';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Shop',
        href: home(),
        icon: Store,
    },
];

// แสดงเฉพาะ user ที่ is_admin = true
const adminNavItems: NavItem[] = [
    { title: 'Dashboard', href: adminDashboard(), icon: LayoutDashboard },
    { title: 'สินค้า', href: adminProducts(), icon: Package },
    { title: 'โปรโมชัน', href: adminPromotions(), icon: Tag },
    { title: 'คำสั่งซื้อ', href: adminOrders(), icon: Receipt },
    { title: 'สมาชิก', href: adminUsers(), icon: Users },
    { title: 'รายงานยอดขาย', href: adminSalesReport(), icon: BarChart3 },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={home()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {auth.user?.is_admin && (
                    <NavMain items={adminNavItems} label="Admin" />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
