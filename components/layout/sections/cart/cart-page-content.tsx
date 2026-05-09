"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Minus, Plus, Trash2, Tag, ShoppingCart, ArrowRight, Ticket, Gift, AlertTriangle, CheckCircle2, Wallet, Coins } from "lucide-react";
import {
  applyCoupon,
  removeCoupon,
  getSavedCoupons,
  fetchApiCoupons,
  getSubtotal,
  getDiscount,
  getTotal,
  getVndDiscount,
  type CartItem,
  type Cart,
  type Coupon,
} from "@/lib/cart";
import { useExchangeRate, convertUsdToVnd, formatVnd, useCart, useReferralProfile, useWalletMe, formatExu } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import { walletTranslations } from "@/components/layout/sections/wallet/translations";
import Link from "next/link";

interface CartPageContentProps {
  dict: Record<string, any>;
  lang: string;
}

export function CartPageContent({ dict, lang }: CartPageContentProps) {
  const [cart, setCart] = useState<Cart>({ items: [], appliedCoupon: null });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCoupons, setShowCoupons] = useState(false);
  // Unified promo input: handles both coupon codes and referral codes
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ type: "coupon" | "referral"; code: string; discountVnd: number } | null>(null);
  const { data: usdToVndRate = 25_500 } = useExchangeRate();
  const { isApiCart, apiCartItems, getLocalCartData, updateItem, removeItem, isLoading: cartLoading } = useCart();
  const { user, openAuthModal } = useAuth();
  const { data: referralProfile } = useReferralProfile();
  const { data: wallet } = useWalletMe();
  const pendingCheckoutRef = useRef(false);
  const wt = walletTranslations[lang as "en" | "vi"];

  // Sync cart items from API or localStorage
  useEffect(() => {
    if (isApiCart) {
      setCart((prev) => ({ items: apiCartItems, appliedCoupon: prev.appliedCoupon }));
      setSelectedIds((prev) => prev.size === 0 ? new Set(apiCartItems.map((i) => i.id)) : prev);
    } else {
      const c = getLocalCartData();
      setCart(c);
      setSelectedIds((prev) => prev.size === 0 ? new Set(c.items.map((i) => i.id)) : prev);
    }
  }, [isApiCart, apiCartItems, getLocalCartData]);

  // Auto-fill referral code from URL capture
  useEffect(() => {
    const storedRef = localStorage.getItem("saily_referral_code");
    if (storedRef && !promoApplied) {
      setPromoInput(storedRef);
      // Auto-apply the referral
      validateAndApplyPromo(storedRef);
    }
  }, []);

  // Listen for localStorage cart-updated events (guest mode)
  useEffect(() => {
    if (isApiCart) return;
    const handler = () => {
      const c = getLocalCartData();
      setCart(c);
    };
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [isApiCart, getLocalCartData]);

  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);

  // Fetch coupons from API on mount
  useEffect(() => {
    setCouponsLoading(true);
    fetchApiCoupons()
      .then(setAvailableCoupons)
      .finally(() => setCouponsLoading(false));
  }, []);

  const selectedItems = cart.items.filter((i) => selectedIds.has(i.id));
  const subtotal = getSubtotal(selectedItems);
  const discount = getDiscount(subtotal, cart.appliedCoupon);
  const total = getTotal(selectedItems, cart.appliedCoupon);

  // VND-aware calculations
  const getVndSubtotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => {
      if (item.vndPrice) return sum + item.vndPrice * item.quantity;
      return sum + convertUsdToVnd(item.price * item.quantity, usdToVndRate);
    }, 0);
  };
  const hasVndPricing = selectedItems.some((i) => i.vndPrice);
  const vndSubtotalValue = getVndSubtotal(selectedItems);
  const vndDiscountValue = getVndDiscount(vndSubtotalValue, cart.appliedCoupon);
  const vndTotalBeforePromo = Math.max(0, vndSubtotalValue - vndDiscountValue);

  // Apply promo discount only when valid (referral requires subtotal >= 100k)
  const isReferralValid = promoApplied?.type === "referral" ? vndSubtotalValue >= 100000 : true;
  const promoDiscountVnd = promoApplied && isReferralValid ? promoApplied.discountVnd : 0;
  const vndTotalValue = Math.max(0, vndTotalBeforePromo - promoDiscountVnd);

  // Cashback: 2% of the final payable amount (before eXU deduction)
  const cashbackVnd = Math.round(vndTotalValue * 0.02);

  // Reactive referral validation: when selected items change, re-validate
  useEffect(() => {
    if (promoApplied?.type === "referral") {
      if (vndSubtotalValue < 100000) {
        setPromoError(wt.referralMinOrder);
        // Auto-remove invalid referral so discount is not applied
        setPromoApplied(null);
      } else {
        setPromoError("");
      }
    }
  }, [vndSubtotalValue, promoApplied, wt.referralMinOrder]);

  const validateAndApplyPromo = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    // Check if it's a known coupon code
    const foundCoupon = availableCoupons.find(
      (c) => c.code.toUpperCase() === trimmed
    );

    if (foundCoupon) {
      // Validate coupon min amount
      if (foundCoupon.minOrderAmountVnd && foundCoupon.minOrderAmountVnd > 0) {
        if (vndSubtotalValue < foundCoupon.minOrderAmountVnd) {
          setPromoError(
            dict.couponMinAmount?.replace("{amount}", `${foundCoupon.minOrderAmountVnd.toLocaleString("vi-VN")}₫`) ||
              `Minimum order ${foundCoupon.minOrderAmountVnd.toLocaleString("vi-VN")}₫`
          );
          return;
        }
      } else if (foundCoupon.minAmount && subtotal < foundCoupon.minAmount) {
        setPromoError(
          dict.couponMinAmount?.replace("{amount}", `$${foundCoupon.minAmount}`) ||
            `Minimum order $${foundCoupon.minAmount}`
        );
        return;
      }

      // Apply coupon
      setPromoError("");
      applyCoupon(foundCoupon);
      setCart((prev) => ({ ...prev, appliedCoupon: foundCoupon }));
      setPromoApplied({ type: "coupon", code: foundCoupon.code, discountVnd: vndDiscountValue });
      setPromoInput("");
      return;
    }

    // Not a coupon — treat as referral code
    // Validate: can't use own code
    if (referralProfile && trimmed === referralProfile.code.toUpperCase()) {
      setPromoError(wt.referralOwnCode);
      return;
    }

    // Validate: min order 100,000₫
    if (vndSubtotalValue < 100000) {
      setPromoError(wt.referralMinOrder);
      return;
    }

    // Validate: can't use with coupon
    if (cart.appliedCoupon) {
      setPromoError(wt.referralWithCoupon);
      return;
    }

    // Apply referral
    setPromoError("");
    setPromoApplied({ type: "referral", code: trimmed, discountVnd: 10000 });
    setPromoInput("");
  };

  const handleApplyPromo = () => {
    if (promoApplied) {
      // Remove current promo
      if (promoApplied.type === "coupon") {
        removeCoupon();
        setCart((prev) => ({ ...prev, appliedCoupon: null }));
      }
      setPromoApplied(null);
      setPromoError("");
      return;
    }
    validateAndApplyPromo(promoInput);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;

    // If not logged in, show auth modal and queue checkout after login
    if (!user) {
      pendingCheckoutRef.current = true;
      openAuthModal();
      return;
    }

    // Store selected items & coupon for the checkout page
    localStorage.setItem("saily_checkout_items", JSON.stringify(selectedItems));
    if (cart.appliedCoupon) {
      localStorage.setItem("saily_checkout_coupon", JSON.stringify(cart.appliedCoupon));
    } else {
      localStorage.removeItem("saily_checkout_coupon");
    }
    // Persist referral code
    if (promoApplied?.type === "referral") {
      localStorage.setItem("saily_checkout_referral", promoApplied.code);
    } else {
      localStorage.removeItem("saily_checkout_referral");
    }
    window.location.href = `/${lang}/checkout`;
  };

  // After login completes, if checkout was pending, proceed to checkout
  useEffect(() => {
    if (user && pendingCheckoutRef.current) {
      pendingCheckoutRef.current = false;
      const timer = setTimeout(() => {
        const currentItems = cart.items.filter((i) => selectedIds.has(i.id));
        if (currentItems.length > 0) {
          localStorage.setItem("saily_checkout_items", JSON.stringify(currentItems));
          if (cart.appliedCoupon) {
            localStorage.setItem("saily_checkout_coupon", JSON.stringify(cart.appliedCoupon));
          } else {
            localStorage.removeItem("saily_checkout_coupon");
          }
          if (promoApplied?.type === "referral") {
            localStorage.setItem("saily_checkout_referral", promoApplied.code);
          }
        }
        window.location.href = `/${lang}/checkout`;
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, cart.items, selectedIds, cart.appliedCoupon, promoApplied, lang]);

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

  const handleQuantity = async (id: string, qty: number) => {
    await updateItem(id, qty);
    if (!isApiCart) {
      setCart(getLocalCartData());
    }
  };

  const handleRemove = async (id: string) => {
    await removeItem(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (!isApiCart) {
      setCart(getLocalCartData());
    }
  };

  const formatPrice = (usd: number) => formatVnd(convertUsdToVnd(usd, usdToVndRate));

  const displaySubtotal = hasVndPricing
    ? `${vndSubtotalValue.toLocaleString("vi-VN")}₫`
    : formatPrice(subtotal);
  const displayDiscount = hasVndPricing
    ? `${vndDiscountValue.toLocaleString("vi-VN")}₫`
    : formatPrice(discount);
  const displayTotal = hasVndPricing
    ? `${vndTotalValue.toLocaleString("vi-VN")}₫`
    : formatPrice(total);

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
            <span className="font-medium text-text-primary">{displaySubtotal}</span>
          </div>

          {/* Unified Promo Section */}
          <div className="space-y-3 border-t border-border-primary pt-4">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-text-tertiary" />
              <span className="text-sm font-medium text-text-primary">
                {dict.coupon || "Promo Code"}
              </span>
            </div>

            {promoApplied ? (
              <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    {promoApplied.type === "referral" ? (
                      <Gift className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Ticket className="h-4 w-4 text-green-600" />
                    )}
                    <span className="text-sm font-semibold text-green-700">
                      {promoApplied.code}
                    </span>
                  </div>
                  <span className="text-xs text-green-600">
                    {promoApplied.type === "referral"
                      ? (lang === "vi" ? "Giảm 10.000₫" : "10,000₫ off")
                      : `-${cart.appliedCoupon?.discount}%`}
                  </span>
                </div>
                <button
                  onClick={handleApplyPromo}
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
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      setPromoError("");
                    }}
                    placeholder={dict.enterCoupon || "Enter promo or referral code"}
                    className="flex-1 rounded-xl border border-border-primary px-4 py-2.5 text-sm outline-none focus:border-[var(--border-focus)] transition-colors"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={!promoInput.trim()}
                    className="rounded-xl bg-bg-brand-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  >
                    {dict.apply || "Apply"}
                  </button>
                </div>

                {/* Available Coupons Toggle */}
                <button
                  onClick={() => setShowCoupons(!showCoupons)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <Ticket className="h-4 w-4" />
                  {couponsLoading
                    ? (dict.loadingCoupons || "Loading coupons...")
                    : `${dict.availableCoupons || "Available coupons"} (${availableCoupons.length})`}
                </button>

                {showCoupons && (
                  <div className="space-y-2">
                    {couponsLoading ? (
                      <div className="flex justify-center py-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      </div>
                    ) : availableCoupons.length === 0 ? (
                      <p className="text-xs text-text-tertiary text-center py-2">
                        {dict.noCoupons || "No coupons available"}
                      </p>
                    ) : availableCoupons.map((coupon) => (
                      <button
                        key={coupon.code}
                        onClick={() => {
                          setPromoInput(coupon.code);
                          validateAndApplyPromo(coupon.code);
                        }}
                        className="w-full flex items-center justify-between rounded-xl border border-dashed border-border-secondary p-3 text-left transition-colors hover:bg-bg-secondary cursor-pointer"
                      >
                        <div>
                          <span className="text-sm font-semibold text-text-primary">
                            {coupon.code}
                          </span>
                          <p className="text-xs text-text-tertiary mt-0.5">
                            {coupon.description}
                          </p>
                          {(coupon.minOrderAmountVnd || coupon.minAmount) ? (
                            <p className="text-xs text-text-tertiary">
                              {dict.minOrder || "Min order"}:{" "}
                              {coupon.minOrderAmountVnd
                                ? `${coupon.minOrderAmountVnd.toLocaleString("vi-VN")}₫`
                                : `$${coupon.minAmount}`}
                            </p>
                          ) : null}
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

            {promoError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />{promoError}
              </p>
            )}
          </div>

          {/* Coupon Discount */}
          {(hasVndPricing ? vndDiscountValue > 0 : discount > 0) && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">{dict.discount || "Discount"}</span>
              <span className="font-medium text-green-600">-{displayDiscount}</span>
            </div>
          )}

          {/* Referral Discount */}
          {promoApplied?.type === "referral" && promoDiscountVnd > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">{wt.referralDiscount}</span>
              <span className="font-medium text-blue-600">-{formatVnd(promoDiscountVnd)}</span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between border-t border-border-primary pt-4">
            <span className="text-base font-bold text-text-primary">
              {dict.total || "Total"}
            </span>
            <span className="text-xl font-bold text-text-primary">{displayTotal}</span>
          </div>

          {/* eXU Cashback Preview */}
          {cashbackVnd > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
              <Coins className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  {lang === "vi" ? "Nhận" : "Earn"} {formatExu(cashbackVnd)}
                </p>
                <p className="text-xs text-emerald-600">
                  {lang === "vi"
                    ? "2% hoàn tiền vào ví eXU sau khi thanh toán"
                    : "2% cashback to your eXU wallet after payment"}
                </p>
              </div>
            </div>
          )}

          {/* eXU Pay Button */}
          {wallet && wallet.status === "active" && wallet.availableBalanceVnd > 0 && (
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal();
                  return;
                }
                // Navigate to checkout with eXU pre-selected
                localStorage.setItem("saily_checkout_items", JSON.stringify(selectedItems));
                if (cart.appliedCoupon) {
                  localStorage.setItem("saily_checkout_coupon", JSON.stringify(cart.appliedCoupon));
                }
                if (promoApplied?.type === "referral") {
                  localStorage.setItem("saily_checkout_referral", promoApplied.code);
                }
                localStorage.setItem("saily_checkout_use_exu", "true");
                window.location.href = `/${lang}/checkout`;
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Wallet className="h-4 w-4" />
              {lang === "vi"
                ? `Thanh toán bằng ví eXU (${formatVnd(wallet.availableBalanceVnd)})`
                : `Pay with eXU Wallet (${formatVnd(wallet.availableBalanceVnd)})`}
            </button>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={selectedItems.length === 0}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-base font-semibold transition-colors ${
              selectedItems.length > 0
                ? "bg-bg-accent text-text-primary hover:bg-bg-accent-hover cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {dict.proceedToCheckout || "Thanh toán"}
            <ArrowRight className="h-5 w-5" />
          </button>
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
  const displayPrice = item.vndPrice
    ? `${(item.vndPrice * item.quantity).toLocaleString("vi-VN")}₫`
    : formatPrice(item.price * item.quantity);

  const hasItemDiscount = item.discount != null && item.discount > 0 && item.originalVndPrice;
  const displayOriginalPrice = hasItemDiscount
    ? `${(item.originalVndPrice! * item.quantity).toLocaleString("vi-VN")}₫`
    : null;

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

      {/* Flag */}
      {item.flagUrl && (
        <div className="flex-shrink-0 mt-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.flagUrl}
            alt={item.destination || ""}
            className="w-8 h-8 rounded-full object-cover border border-border-primary"
          />
        </div>
      )}

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-text-primary truncate">{item.name}</h4>
        <p className="text-xs text-text-tertiary mt-1 line-clamp-2">{item.description}</p>
        {item.destination && (
          <span className="inline-flex items-center gap-1 mt-2 text-xs bg-bg-secondary rounded-full px-3 py-1 text-text-secondary">
            {item.destination}
          </span>
        )}
        {item.dataMb && (
          <span className="inline-block mt-2 ml-2 text-xs bg-blue-50 rounded-full px-3 py-1 text-blue-600">
            {item.dataMb >= 9999999 ? dict.unlimited || "Unlimited" : item.dataMb >= 1024 ? `${parseFloat((item.dataMb / 1024).toFixed(1))} GB` : `${item.dataMb} MB`}
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
        <div className="flex flex-col items-end">
          {displayOriginalPrice && (
            <span className="text-xs text-[#6b7280] line-through">
              {displayOriginalPrice}
            </span>
          )}
          <span className="text-sm font-bold text-text-primary">
            {displayPrice}
          </span>
          {hasItemDiscount && (
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded mt-0.5">
              -{item.discount}%
            </span>
          )}
        </div>
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
