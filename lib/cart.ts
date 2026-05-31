"use client";

import { roundVndToThousands } from "./utils";

// ===== Cart Types =====

export interface CartItem {
  id: string;
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

export function getDiscount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon) return 0;
  // Skip USD minAmount check for API coupons (minOrderAmountVnd is validated separately in VND)
  if (!coupon.minOrderAmountVnd && coupon.minAmount && subtotal < coupon.minAmount) return 0;
  return (subtotal * coupon.discount) / 100;
}

export function getVndDiscount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon) return 0;
  return roundVndToThousands((subtotal * coupon.discount) / 100);
}

export function getTotal(items: CartItem[], coupon: Coupon | null): number {
  const subtotal = getSubtotal(items);
  const discount = getDiscount(subtotal, coupon);
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
      .filter((c: any) => c.isActive && !c.deletedAt && (!c.expiresAt || new Date(c.expiresAt) > new Date()))
      .map((c: any) => ({
        code: c.code,
        discount: c.discountPercent,
        description: `${c.discountPercent}% off`,
        expiresAt: c.expiresAt,
        minAmount: c.minOrderAmount || 0,
        minOrderAmountVnd: c.minOrderAmount || 0,
      }));
  } catch (err) {
    console.warn("Failed to fetch API coupons, falling back to saved:", err);
    return getSavedCoupons();
  }
}

export function getCartItemCount(): number {
  const cart = getStoredCart();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
