import type { Auth } from '@/types/auth';
import type { Membership } from '@/types/shop';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            cartCount: number; // จำนวนสินค้าในตะกร้า (0 ถ้ายังไม่ล็อกอิน)
            membership: Membership | null;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
