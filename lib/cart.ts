"use client";

import { roundVndToThousands } from "./utils";
import { couponDiscountVnd } from "./voucher-preview";

// ===== Cart Types =====

export interface CartItem {
  id: string;
  /** Numeric plan id sent to the API. `id` is the cart-line key and may include the selected duration. */
  planId?: number;
  name: string;
  description: string;
  price: number; // USD (after discount if applicable)
  quantity: number;
  image?: string;
  destination?: string;
  dataMb?: number;
  durationDays?: number;
  flagUrl?: string;
  vndPrice?: number; // VND price from API (after discount if applicable)
  originalVndPrice?: number; // Original VND price before plan discount
  discount?: number; // Plan discount percentage (e.g. 10 = 10%)
  _apiId?: number; // API cart item id (for update/delete)
}

export interface Coupon {
  code: string;
  discount: number; // percentage (e.g. 10 = 10%)
  description: string;
  expiresAt?: string;
  minAmount?: number;
  minOrderAmountVnd?: number; // VND min order from API
  isPopular?: boolean;
  /** `fixed` = a flat VND amount off instead of a percentage (#082). */
  discountType?: "percent" | "fixed";
  /** Flat VND off, when `discountType` is `fixed`. */
  discountAmountVnd?: number;
  /** Ceiling for a percentage code — "15% off, up to 50k". */
  maxDiscountVnd?: number | null;
}

export interface Cart {
  items: CartItem[];
  appliedCoupon: Coupon | null;
}

// ===== Storage Keys =====

const CART_KEY = "esim_cart";
const COUPONS_KEY = "esim_saved_coupons";

// ===== Cart Operations =====

function getStoredCart(): Cart {
  if (typeof window === "undefined") return { items: [], appliedCoupon: null };
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return { items: [], appliedCoupon: null };
    return JSON.parse(raw);
  } catch {
    return { items: [], appliedCoupon: null };
  }
}

function saveCart(cart: Cart): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

export function getCart(): Cart {
  return getStoredCart();
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1): Cart {
  const cart = getStoredCart();
  const existing = cart.items.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ ...item, quantity });
  }
  saveCart(cart);
  return cart;
}

export function updateQuantity(itemId: string, quantity: number): Cart {
  const cart = getStoredCart();
  const item = cart.items.find((i) => i.id === itemId);
  if (item) {
    item.quantity = Math.max(1, quantity);
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(itemId: string): Cart {
  const cart = getStoredCart();
  cart.items = cart.items.filter((i) => i.id !== itemId);
  saveCart(cart);
  return cart;
}

export function clearCart(): Cart {
  const cart: Cart = { items: [], appliedCoupon: null };
  saveCart(cart);
  return cart;
}

export function applyCoupon(coupon: Coupon): Cart {
  const cart = getStoredCart();
  cart.appliedCoupon = coupon;
  saveCart(cart);
  return cart;
}

export function removeCoupon(): Cart {
  const cart = getStoredCart();
  cart.appliedCoupon = null;
  saveCart(cart);
  return cart;
}

// ===== Cart Calculations =====

export function getSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** The coupon as the shared VND rule wants it (#082). */
function toDiscountRule(coupon: Coupon) {
  return {
    discountPercent: coupon.discount,
    discountType: coupon.discountType ?? ("percent" as const),
    discountAmount: coupon.discountAmountVnd ?? 0,
    maxDiscountAmount: coupon.maxDiscountVnd ?? null,
  };
}

/**
 * USD discount — the fallback display for lines with no VND price.
 *
 * A flat-amount or capped code is a VND figure, so it cannot be applied to a
 * dollar subtotal directly: pass `vndSubtotal` and the same share comes off
 * both currencies, which is what the server does for order totals (#082).
 */
export function getDiscount(
  subtotal: number,
  coupon: Coupon | null,
  vndSubtotal?: number
): number {
  if (!coupon) return 0;
  // Skip USD minAmount check for API coupons (minOrderAmountVnd is validated separately in VND)
  if (!coupon.minOrderAmountVnd && coupon.minAmount && subtotal < coupon.minAmount) return 0;

  const isPlainPercent =
    (coupon.discountType ?? "percent") === "percent" && !(coupon.maxDiscountVnd ?? 0);
  if (isPlainPercent) return (subtotal * coupon.discount) / 100;

  if (!(vndSubtotal && vndSubtotal > 0)) return 0;
  const share = couponDiscountVnd(toDiscountRule(coupon), vndSubtotal) / vndSubtotal;
  return Math.round(subtotal * share * 100) / 100;
}

export function getVndDiscount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon) return 0;
  return couponDiscountVnd(toDiscountRule(coupon), subtotal);
}


/**
 * How a coupon reads on screen (#082).
 *
 * A flat-amount code shown as "-0%" tells the customer nothing, and a capped
 * one shown as "-15%" promises more than it gives on a large order.
 */
export function couponDiscountLabel(coupon: Coupon): string {
  if ((coupon.discountType ?? "percent") === "fixed") {
    return `-${(coupon.discountAmountVnd ?? 0).toLocaleString("vi-VN")}₫`;
  }
  const cap = coupon.maxDiscountVnd ?? 0;
  if (cap > 0) {
    return `-${coupon.discount}% (tối đa ${cap.toLocaleString("vi-VN")}₫)`;
  }
  return `-${coupon.discount}%`;
}

export function getTotal(
  items: CartItem[],
  coupon: Coupon | null,
  vndSubtotal?: number
): number {
  const subtotal = getSubtotal(items);
  const discount = getDiscount(subtotal, coupon, vndSubtotal);
  return Math.max(0, subtotal - discount);
}

// ===== Saved Coupons =====

export function getSavedCoupons(): Coupon[] {
  if (typeof window === "undefined") return getDefaultCoupons();
  try {
    const raw = localStorage.getItem(COUPONS_KEY);
    if (!raw) {
      // Initialize with default coupons
      const defaults = getDefaultCoupons();
      localStorage.setItem(COUPONS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return getDefaultCoupons();
  }
}

function getDefaultCoupons(): Coupon[] {
  return [
    {
      code: "Saily5",
      discount: 5,
      description: "5% off all plans",
      expiresAt: "2026-12-31",
    },
    {
      code: "WELCOME10",
      discount: 10,
      description: "10% off for new customers",
      expiresAt: "2026-06-30",
      minAmount: 10,
    },
    {
      code: "TRAVEL15",
      discount: 15,
      description: "15% off orders over $20",
      expiresAt: "2026-09-30",
      minAmount: 20,
    },
  ];
}

// ===== API Coupons =====

/** An API coupon in the shape the cart works with. */
export function toCartCoupon(c: any): Coupon {
  return {
    code: c.code,
    discount: c.discountPercent,
    description: `${c.discountPercent}% off`,
    expiresAt: c.expiresAt,
    minAmount: c.minOrderAmount || 0,
    minOrderAmountVnd: c.minOrderAmount || 0,
    isPopular: !!c.isPopular,
    discountType: c.discountType === "fixed" ? "fixed" : "percent",
    discountAmountVnd: Number(c.discountAmount ?? 0),
    maxDiscountVnd:
      c.maxDiscountAmount == null ? null : Number(c.maxDiscountAmount),
  };
}

/**
 * Look a typed-in code up on the server (#037).
 *
 * A private coupon is left out of the public list on purpose, so the cart could
 * never recognise one: it fell through to the referral check and the customer
 * was told "mã giới thiệu không hợp lệ" for a perfectly good coupon. Returns
 * `null` when no coupon has that code, so the caller can try it as a referral.
 */
export async function fetchCouponByCode(
  code: string,
  token: string,
): Promise<Coupon | null> {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";
  const res = await fetch(
    `${API_BASE_URL}/api/v1/coupons/code/${encodeURIComponent(code)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status}`);
  const coupon = await res.json();
  return coupon?.code ? toCartCoupon(coupon) : null;
}

/** Fetch active coupons from /api/v1/coupons and map to cart Coupon type */
export async function fetchApiCoupons(): Promise<Coupon[]> {
  const API_BASE_URL =
    (typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_API_BASE_URL
      : process.env.NEXT_PUBLIC_API_BASE_URL) || "https://api.saily.example.com";
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/coupons?limit=50`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return (json.data || [])
      // `isPublic === false` is a code the admin marked private: it still
      // works when typed in, but it must never appear in this list (#081).
      .filter(
        (c: any) =>
          c.isActive &&
          !c.deletedAt &&
          c.isPublic !== false &&
          (!c.expiresAt || new Date(c.expiresAt) > new Date()),
      )
      .map(toCartCoupon);
  } catch (err) {
    console.warn("Failed to fetch API coupons, falling back to saved:", err);
    return getSavedCoupons();
  }
}

export function getCartItemCount(): number {
  const cart = getStoredCart();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
