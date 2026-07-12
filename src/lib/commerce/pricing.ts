import type { CartItem, CommerceSettings, Coupon, Product } from "@/types";
import { isOnSale } from "@/lib/utils";

export function effectiveUnitPrice(product: Pick<
  Product,
  "price" | "compare_at_price" | "sale_starts_at" | "sale_ends_at"
>): number {
  // Price is always the selling price. compare_at_price is the struck-through MRP.
  return Number(product.price);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateShipping(
  subtotalAfterDiscount: number,
  settings: CommerceSettings
): number {
  if (subtotalAfterDiscount <= 0) return 0;
  if (subtotalAfterDiscount >= settings.free_shipping_threshold) return 0;
  return settings.shipping_fee;
}

export type CouponResult =
  | { ok: true; discount: number; coupon: Coupon; message: string }
  | { ok: false; discount: number; message: string };

/**
 * Default sale logic:
 * - Selling price = products.price
 * - If compare_at_price > price (and within sale window), UI shows "Sale" + % off
 * Coupons stack on the cart subtotal of selling prices (not on MRP).
 */
export function applyCoupon(
  items: CartItem[],
  coupon: Coupon | null,
  now = new Date()
): CouponResult {
  if (!coupon) {
    return { ok: false, discount: 0, message: "No coupon applied" };
  }

  if (!coupon.is_active) {
    return { ok: false, discount: 0, message: "This coupon is inactive" };
  }

  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { ok: false, discount: 0, message: "This coupon is not active yet" };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { ok: false, discount: 0, message: "This coupon has expired" };
  }

  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { ok: false, discount: 0, message: "This coupon has reached its usage limit" };
  }

  const eligible = items.filter((item) => {
    if (coupon.scope === "all") return true;
    if (coupon.scope === "product") return item.productId === coupon.product_id;
    if (coupon.scope === "category") return item.categoryId === coupon.category_id;
    return false;
  });

  if (eligible.length === 0) {
    return {
      ok: false,
      discount: 0,
      message: "This coupon does not apply to items in your cart",
    };
  }

  const eligibleSubtotal = eligible.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const fullSubtotal = cartSubtotal(items);

  if (fullSubtotal < Number(coupon.min_order_value)) {
    return {
      ok: false,
      discount: 0,
      message: `Minimum order value for this coupon is ₹${coupon.min_order_value}`,
    };
  }

  let discount = 0;
  if (coupon.discount_type === "percent") {
    discount = (eligibleSubtotal * Number(coupon.discount_value)) / 100;
  } else {
    discount = Math.min(Number(coupon.discount_value), eligibleSubtotal);
  }

  discount = Math.round(discount * 100) / 100;
  if (discount <= 0) {
    return { ok: false, discount: 0, message: "Coupon does not reduce this order" };
  }

  return {
    ok: true,
    discount,
    coupon,
    message: `Coupon ${coupon.code.toUpperCase()} applied`,
  };
}

export function summarizeTotals(
  items: CartItem[],
  settings: CommerceSettings,
  coupon: Coupon | null
) {
  const subtotal = cartSubtotal(items);
  const couponResult = applyCoupon(items, coupon);
  const discount = couponResult.ok ? couponResult.discount : 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = calculateShipping(afterDiscount, settings);
  const total = Math.round((afterDiscount + shipping) * 100) / 100;

  return {
    subtotal,
    discount,
    shipping,
    total,
    couponResult,
    afterDiscount,
  };
}

export function mapProductToCartItem(
  product: Product,
  quantity: number
): CartItem {
  return {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    price: effectiveUnitPrice(product),
    compareAtPrice: isOnSale(product) ? product.compare_at_price : null,
    image: product.images?.[0] ?? null,
    quantity,
    stock: product.stock,
    categoryId: product.category_id,
  };
}
