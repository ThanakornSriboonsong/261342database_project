import type { OrderDetail } from './shop';

/** ตัวเลือกใน dropdown (tier / สินค้า) */
export type TierOption = { tier_id: number; name: string };
export type ProductOption = { product_id: number; name: string };

export type DashboardStats = {
    today_revenue: number;
    today_orders: number;
    month_revenue: number;
    month_orders: number;
    members: number;
    new_members_this_month: number;
    low_stock_count: number; // stock <= 5
};

export type AdminProduct = {
    product_id: number;
    name: string;
    detail: string | null;
    price: number;
    stock: number;
    image_url: string | null;
};

export type AdminPromotion = {
    promotion_id: number;
    name: string;
    code: string;
    type: 'discount' | 'buy_get';
    tier: string | null;
    start_date: string; // "2026-11-01"
    end_date: string;
    status: 'active' | 'scheduled' | 'expired';
    percent: number | null;
    max_discount: number | null;
    buy_qty: number | null;
    get_qty: number | null;
};

export type AdminPromotionForm = AdminPromotion & {
    tier_id: number | null;
    product_ids: number[];
};

export type AdminCustomer = { user_id: number; name: string; email: string };

export type AdminOrderRow = {
    summary_id: number;
    order_date: string;
    customer: AdminCustomer;
    items_count: number;
    total_price: number;
    discount_amount: number;
    final_price: number;
    promotion_code: string | null;
};

/** รายการในออเดอร์ฝั่ง admin ไม่มี image_url */
export type AdminOrderDetail = Omit<OrderDetail, 'items'> & {
    customer: AdminCustomer & { phone: string | null };
    items: Omit<OrderDetail['items'][number], 'image_url'>[];
};

export type AdminUser = {
    user_id: number;
    name: string;
    email: string;
    phone: string | null;
    total_spent: number;
    tier: string | null;
    tier_id: number | null;
    orders_count: number;
    is_admin: boolean;
    created_at: string | null;
};

export type ProductSales = {
    product_id: number;
    name: string;
    quantity: number;
    revenue: number;
};
