export type StaffRole = "super_admin" | "staff";

export type StaffPermissions = {
  products: boolean;
  categories: boolean;
  orders: boolean;
  coupons: boolean;
  inventory: boolean;
  dashboard: boolean;
  settings: boolean;
  staff: boolean;
};

export type StaffProfile = {
  id: string;
  email: string;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
  permissions: StaffPermissions;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  size_info: string | null;
  /** e.g. Gold-plated brass, sterling silver */
  material_info: string | null;
  /** Care / allergy notes */
  care_notes: string | null;
  price: number;
  compare_at_price: number | null;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
  stock: number;
  low_stock_threshold: number;
  category_id: string | null;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
};

export type Review = {
  id: string;
  product_id: string | null;
  customer_name: string;
  rating: number;
  body: string;
  is_approved: boolean;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  scope: "all" | "category" | "product";
  category_id: string | null;
  product_id: string | null;
  min_order_value: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
};

export type OrderStatus =
  | "pending_payment"
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "cod" | "razorpay";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total: number;
  coupon_id: string | null;
  coupon_code: string | null;
  customer_note: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_title: string;
  product_slug: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  image_url: string | null;
};

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  image?: string | null;
  quantity: number;
  stock: number;
  categoryId?: string | null;
};

export type CommerceSettings = {
  currency: string;
  currency_symbol: string;
  free_shipping_threshold: number;
  shipping_fee: number;
  cod_min_order: number;
  service_region: string;
  allow_cod: boolean;
  allow_razorpay: boolean;
};

export type ReturnsSettings = {
  return_window_days: number;
  policy_summary: string;
};

export type ContactSettings = {
  brand_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

export type BrandSettings = {
  tagline: string;
  parent_brand: string;
  parent_brand_note: string;
  about_short: string;
};

export type PolicySettings = {
  shipping_summary: string;
  privacy_summary: string;
  terms_summary: string;
};

export type AdminNotification = {
  id: string;
  type: "low_stock" | "out_of_stock" | "new_order" | "system";
  title: string;
  message: string;
  meta: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
};

export type CheckoutInput = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: PaymentMethod;
  coupon_code?: string;
  customer_note?: string;
  items: { productId: string; quantity: number }[];
};

export const DEFAULT_COMMERCE: CommerceSettings = {
  currency: "INR",
  currency_symbol: "₹",
  free_shipping_threshold: 600,
  shipping_fee: 120,
  cod_min_order: 299,
  service_region: "India",
  allow_cod: false,
  allow_razorpay: true,
};

export const DEFAULT_RETURNS: ReturnsSettings = {
  return_window_days: 7,
  policy_summary:
    "Unused items in original packaging may be returned or exchanged within the return window. Earrings and hygiene-sensitive pieces are exchange-only for safety. Custom or made-to-order pieces are final sale unless damaged on arrival.",
};

export const DEFAULT_CONTACT: ContactSettings = {
  brand_name: "The Jewel Nest",
  email: "support@thejewelnest.co.in",
  phone: "",
  whatsapp: "",
  instagram: "thejewel_nest",
  address_line: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

export const DEFAULT_BRAND: BrandSettings = {
  tagline: "Modern jewellery, quietly luxurious.",
  parent_brand: "The Glitter Story",
  parent_brand_note:
    "The Jewel Nest is the jewellery house of The Glitter Story - born from the same love of polish, detail, and everyday glam.",
  about_short:
    "Curated modern jewellery for women who dress for themselves. Designed to stack, gift, and live in - from scroll to doorstep.",
};

export const DEFAULT_POLICIES: PolicySettings = {
  shipping_summary:
    "We currently ship across India only. Orders above ₹600 enjoy free shipping. Orders below ₹600 include a flat shipping fee of ₹120. Delivery timelines typically range from 4-10 business days depending on your pincode.",
  privacy_summary:
    "We collect only the information needed to fulfil your order (name, phone, email, and delivery address). We do not sell your data. Payment card details are processed securely by Razorpay and never stored on our servers.",
  terms_summary:
    "By placing an order on thejewelnest.co.in you agree to our pricing, shipping, and return policies. Product colours may vary slightly due to lighting and screen settings. Prices are in INR and inclusive of all applicable charges (no separate GST line while the business is below the GST registration threshold).",
};

export const DEFAULT_STAFF_PERMISSIONS: StaffPermissions = {
  products: true,
  categories: true,
  orders: true,
  coupons: true,
  inventory: true,
  dashboard: true,
  settings: false,
  staff: false,
};
