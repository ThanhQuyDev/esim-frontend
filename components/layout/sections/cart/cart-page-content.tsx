"use client";

import { useState, useEffect, useCallback } from "react";
import { Minus, Plus, Trash2, Tag, ShoppingCart, ArrowRight, Ticket } from "lucide-react";
import {
  getCart,
  updateQuantity,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  getSavedCoupons,
  getSubtotal,
  getDiscount,
  getTotal,
  type CartItem,
  type Cart,
  type Coupon,
} from "@/lib/cart";
import { seedDemoCart } from "@/lib/demo-cart";
import { useExchangeRate, convertUsdToVnd, formatVnd } from "@/lib/hooks";
import Link from "next/link";

interface CartPageContentProps {
  dict: Record<string, any>;
  lang: string;
}

export function CartPageContent({ dict, lang }: CartPageContentProps) {
  const [cart, setCart] = useState<Cart>({ items: [], appliedCoupon: null });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const { data: usdToVndRate = 25_500 } = useExchangeRate();

  const refreshCart = useCallback(() => {
    const c = getCart();
    setCart(c);
    // Auto-select all items
    setSelectedIds(new Set(c.items.map((i) => i.id)));
  }, []);

  useEffect(() => {
    // Seed demo data for UI preview (only if cart is empty)
    seedDemoCart();
    refreshCart();
    const handler = () => refreshCart();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [refreshCart]);

  const selectedItems = cart.items.filter((i) => selectedIds.has(i.id));
  const subtotal = getSubtotal(selectedItems);
  const discount = getDiscount(subtotal, cart.appliedCoupon);
  const total = getTotal(selectedItems, cart.appliedCoupon);
  const savedCoupons = getSavedCoupons();

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === cart.items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cart.items.map((i) => i.id)));
    }
  };

  const handleQuantity = (id: string, qty: number) => {
    setCart(updateQuantity(id, qty));
  };

  const handleRemove = (id: string) => {
    setCart(removeFromCart(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleApplyCoupon = (coupon: Coupon) => {
    if (coupon.minAmount && subtotal < coupon.minAmount) {
      setCouponError(
        dict.couponMinAmount?.replace("{amount}", `$${coupon.minAmount}`) ||
          `Minimum order $${coupon.minAmount}`
      );
      return;
    }
    setCouponError("");
    setCart(applyCoupon(coupon));
    setShowCoupons(false);
  };

  const handleApplyCouponCode = () => {
    const found = savedCoupons.find(
      (c) => c.code.toLowerCase() === couponInput.trim().toLowerCase()
    );
    if (!found) {
      setCouponError(dict.couponInvalid || "Invalid coupon code");
      return;
    }
    handleApplyCoupon(found);
    setCouponInput("");
  };

  const handleRemoveCoupon = () => {
    setCart(removeCoupon());
    setCouponError("");
  };

  const formatPrice = (usd: number) => formatVnd(convertUsdToVnd(usd, usdToVndRate));

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg-secondary">
          <ShoppingCart className="h-10 w-10 text-text-tertiary" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">
          {dict.emptyCart || "Your cart is empty"}
        </h2>
        <p className="text-text-secondary text-center max-w-md">
          {dict.emptyCartDescription || "Browse our eSIM plans and add them to your cart."}
        </p>
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-2 rounded-full bg-bg-accent px-7 py-3 font-medium text-text-primary transition-colors hover:bg-bg-accent-hover"
        >
          {dict.browsePlans || "Browse Plans"}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {/* Select All */}
        <div className="flex items-center gap-3 pb-4 border-b border-border-primary">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.size === cart.items.length}
              onChange={toggleSelectAll}
              className="h-5 w-5 rounded border-border-secondary accent-[var(--bg-accent)] cursor-pointer"
            />
            <span className="text-sm font-medium text-text-primary">
              {dict.selectAll || "Select all"} ({cart.items.length})
            </span>
          </label>
        </div>

        {/* Items List */}
        {cart.items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            selected={selectedIds.has(item.id)}
            onToggle={() => toggleSelect(item.id)}
            onQuantityChange={(qty) => handleQuantity(item.id, qty)}
            onRemove={() => handleRemove(item.id)}
            formatPrice={formatPrice}
            dict={dict}
          />
        ))}
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-border-primary bg-white p-6 space-y-5">
          <h3 className="text-lg font-bold text-text-primary">
            {dict.orderSummary || "Order Summary"}
          </h3>

          {/* Selected count */}
          <div className="text-sm text-text-secondary">
            {dict.selectedItems || "Selected items"}: {selectedItems.length}
          </div>

          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">{dict.subtotal || "Subtotal"}</span>
            <span className="font-medium text-text-primary">{formatPrice(subtotal)}</span>
          </div>

          {/* Coupon Section */}
          <div className="space-y-3 border-t border-border-primary pt-4">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-text-tertiary" />
              <span className="text-sm font-medium text-text-primary">
                {dict.coupon || "Coupon"}
              </span>
            </div>

            {cart.appliedCoupon ? (
              <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
                <div>
                  <span className="text-sm font-semibold text-green-700">
                    {cart.appliedCoupon.code}
                  </span>
                  <span className="ml-2 text-xs text-green-600">
                    -{cart.appliedCoupon.discount}%
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                >
                  {dict.remove || "Remove"}
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError("");
                    }}
                    placeholder={dict.enterCoupon || "Enter coupon code"}
                    className="flex-1 rounded-xl border border-border-primary px-4 py-2.5 text-sm outline-none focus:border-[var(--border-focus)] transition-colors"
                  />
                  <button
                    onClick={handleApplyCouponCode}
                    disabled={!couponInput.trim()}
                    className="rounded-xl bg-bg-brand-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  >
                    {dict.apply || "Apply"}
                  </button>
                </div>

                {/* Saved Coupons Toggle */}
                <button
                  onClick={() => setShowCoupons(!showCoupons)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <Ticket className="h-4 w-4" />
                  {dict.savedCoupons || "Saved coupons"} ({savedCoupons.length})
                </button>

                {showCoupons && (
                  <div className="space-y-2">
                    {savedCoupons.map((coupon) => (
                      <button
                        key={coupon.code}
                        onClick={() => handleApplyCoupon(coupon)}
                        className="w-full flex items-center justify-between rounded-xl border border-dashed border-border-secondary p-3 text-left transition-colors hover:bg-bg-secondary cursor-pointer"
                      >
                        <div>
                          <span className="text-sm font-semibold text-text-primary">
                            {coupon.code}
                          </span>
                          <p className="text-xs text-text-tertiary mt-0.5">
                            {coupon.description}
                          </p>
                          {coupon.minAmount && (
                            <p className="text-xs text-text-tertiary">
                              {dict.minOrder || "Min order"}: ${coupon.minAmount}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-bold text-green-600">
                          -{coupon.discount}%
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {couponError && (
              <p className="text-xs text-red-500">{couponError}</p>
            )}
          </div>

          {/* Discount */}
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">{dict.discount || "Discount"}</span>
              <span className="font-medium text-green-600">-{formatPrice(discount)}</span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between border-t border-border-primary pt-4">
            <span className="text-base font-bold text-text-primary">
              {dict.total || "Total"}
            </span>
            <span className="text-xl font-bold text-text-primary">{formatPrice(total)}</span>
          </div>

          {/* Checkout Button */}
          <Link
            href={selectedItems.length > 0 ? `/${lang}/checkout` : "#"}
            onClick={(e) => {
              if (selectedItems.length === 0) {
                e.preventDefault();
              } else {
                // Store selected items for checkout
                if (typeof window !== "undefined") {
                  localStorage.setItem(
                    "saily_checkout_items",
                    JSON.stringify(selectedItems)
                  );
                  localStorage.setItem(
                    "saily_checkout_coupon",
                    JSON.stringify(cart.appliedCoupon)
                  );
                }
              }
            }}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-semibold transition-colors ${
              selectedItems.length > 0
                ? "bg-bg-accent text-text-primary hover:bg-bg-accent-hover cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {dict.proceedToCheckout || "Proceed to Checkout"}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ===== Cart Item Row =====

function CartItemRow({
  item,
  selected,
  onToggle,
  onQuantityChange,
  onRemove,
  formatPrice,
  dict,
}: {
  item: CartItem;
  selected: boolean;
  onToggle: () => void;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
  formatPrice: (usd: number) => string;
  dict: Record<string, any>;
}) {
  return (
    <div
      className={`flex items-start gap-4 rounded-2xl border p-4 transition-colors ${
        selected
          ? "border-[var(--bg-accent)] bg-yellow-50/30"
          : "border-border-primary bg-white"
      }`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="mt-1 h-5 w-5 rounded border-border-secondary accent-[var(--bg-accent)] cursor-pointer flex-shrink-0"
      />

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-text-primary truncate">{item.name}</h4>
        <p className="text-xs text-text-tertiary mt-1 line-clamp-2">{item.description}</p>
        {item.destination && (
          <span className="inline-block mt-2 text-xs bg-bg-secondary rounded-full px-3 py-1 text-text-secondary">
            {item.destination}
          </span>
        )}
        {item.dataGb && (
          <span className="inline-block mt-2 ml-2 text-xs bg-blue-50 rounded-full px-3 py-1 text-blue-600">
            {item.dataGb >= 9999 ? dict.unlimited || "Unlimited" : `${item.dataGb} GB`}
          </span>
        )}
        {item.durationDays && (
          <span className="inline-block mt-2 ml-2 text-xs bg-green-50 rounded-full px-3 py-1 text-green-600">
            {item.durationDays} {item.durationDays === 1 ? dict.day || "day" : dict.days || "days"}
          </span>
        )}
      </div>

      {/* Price & Quantity */}
      <div className="flex flex-col items-end gap-3 flex-shrink-0">
        <span className="text-sm font-bold text-text-primary">
          {formatPrice(item.price * item.quantity)}
        </span>
        <div className="flex items-center gap-1 rounded-xl border border-border-primary">
          <button
            onClick={() => onQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-1.5 text-text-tertiary hover:text-text-primary disabled:opacity-30 cursor-pointer transition-colors"
            aria-label={dict.decrease || "Decrease quantity"}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium text-text-primary">
            {item.quantity}
          </span>
          <button
            onClick={() => onQuantityChange(item.quantity + 1)}
            className="p-1.5 text-text-tertiary hover:text-text-primary cursor-pointer transition-colors"
            aria-label={dict.increase || "Increase quantity"}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={onRemove}
          className="text-xs text-red-400 hover:text-red-600 cursor-pointer transition-colors flex items-center gap-1"
          aria-label={dict.removeItem || "Remove item"}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {dict.remove || "Remove"}
        </button>
      </div>
    </div>
  );
}
