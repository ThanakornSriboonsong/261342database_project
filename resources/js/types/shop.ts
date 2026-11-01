/** การ์ดสินค้า: ใช้ในหน้าแรก, รายการสินค้า, wishlist */
export type ProductCard = {
    product_id: number;
    name: string;
    price: number;
    stock: number;
    image_url: string | null;
    star: number | null; // ค่าเฉลี่ย 1 ตำแหน่ง เช่น 4.3, null = ยังไม่มีรีวิว
    comments_count: number;
    is_wished: boolean; // false เสมอถ้ายังไม่ล็อกอิน
};

export type PromotionSummary = {
    promotion_id: number;
    name: string;
    code: string;
    type: 'discount' | 'buy_get';
    percent: number | null; // มีค่าเมื่อ type = discount
    max_discount: number | null; // เพดานส่วนลด (บาท), null = ไม่จำกัด
    buy_qty: number | null; // มีค่าเมื่อ type = buy_get
    get_qty: number | null;
    tier: string | null; // ชื่อ tier ที่ใช้ได้ เช่น "Gold", null = ทุกคนใช้ได้
    end_date: string; // "2026-12-31"
};

export type ProductComment = {
    comment_id: number;
    user_id: number;
    user_name: string;
    star: number; // 1-5
    comment: string;
    created_at: string; // ISO 8601
    can_edit: boolean; // true = รีวิวของคนที่ล็อกอินอยู่ (แสดงปุ่มแก้/ลบ)
};

export type CartItem = {
    product_id: number;
    name: string;
    image_url: string | null;
    price: number;
    stock: number;
    quantity: number;
    is_out: boolean; // true = ไม่ติ๊ก (ยังไม่ซื้อรอบนี้) ไม่นับในยอดรวม
    line_total: number; // price × quantity
};

export type CheckoutItem = Omit<CartItem, 'stock' | 'is_out'>;

export type MoneySummary = {
    subtotal: number; // ยอดก่อนลด (เฉพาะของที่ติ๊ก)
    discount: number;
    total: number; // ยอดที่ต้องจ่าย
};

export type OrderRow = {
    summary_id: number;
    order_date: string;
    items_count: number;
    total_price: number;
    discount_amount: number;
    final_price: number;
    promotion_code: string | null;
};

export type OrderItem = {
    product_id: number;
    name: string;
    image_url: string | null;
    quantity: number;
    unit_price: number; // ราคา ณ วันที่สั่ง (ไม่ใช่ราคาปัจจุบัน)
    line_total: number;
};

export type OrderDetail = Omit<OrderRow, 'items_count' | 'promotion_code'> & {
    shipping_address: string;
    promotion: { code: string; name: string } | null;
    items: OrderItem[];
};

/** รูปแบบข้อมูลแบ่งหน้าของ Laravel (paginate) */
export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
    prev_page_url: string | null;
    next_page_url: string | null;
};

/** สถานะสมาชิกของคนที่ล็อกอินอยู่ (shared prop `membership`, null ถ้ายังไม่ล็อกอิน) */
export type Membership = {
    tier: { name: string; min_spent: number } | null; // null = ยังไม่มี tier (เช่น บัญชี admin)
    total_spent: number;
    next_tier: { name: string; min_spent: number; remaining: number } | null; // null = อยู่ tier สูงสุดแล้ว
};
