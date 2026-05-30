"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  CreditCard,
  Building2,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ShoppingBag,
  ArrowLeft,
  Wallet,
} from "lucide-react";
import {
  getSubtotal,
  getDiscount,
  getTotal,
  getVndDiscount,
  type CartItem,
  type Coupon,
} from "@/lib/cart";
import { useExchangeRate, useCheckout, useCart, convertUsdToVnd, formatVnd, useWalletMe, useMyProfile } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import { walletTranslations } from "@/components/layout/sections/wallet/translations";
import Link from "next/link";
import { localizedHref } from "@/lib/route-mapping";

interface CheckoutPageContentProps {
  dict: Record<string, any>;
  lang: string;
}

type PaymentMethod = "onepay" | "bank_transfer";

interface InvoiceInfo {
  companyName: string;
  taxCode: string;
  address: string;
  email: string;
}

export function CheckoutPageContent({ dict, lang }: CheckoutPageContentProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("onepay");
  const [wantInvoice, setWantInvoice] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo>({
    companyName: "",
    taxCode: "",
    address: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderComplete, setOrderComplete] = useState(false);

  // eXU wallet state
  const [useExu, setUseExu] = useState(false);
  const [exuAmount, setExuAmount] = useState("");

  // Referral code state (read from cart, not editable here)
  const [referralCode, setReferralCode] = useState("");
  const [referralApplied, setReferralApplied] = useState(false);

  const { data: usdToVndRate = 25_500 } = useExchangeRate();
  const checkout = useCheckout();
  const cart = useCart();
  const { data: wallet } = useWalletMe();

  const { user, token, openAuthModal } = useAuth();

  const wt = walletTranslations[lang as "en" | "vi"];

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem("saily_checkout_items");
      const storedCoupon = localStorage.getItem("saily_checkout_coupon");
      const storedReferral = localStorage.getItem("saily_checkout_referral") || localStorage.getItem("saily_referral_code");
      const storedUseExu = localStorage.getItem("saily_checkout_use_exu");
      if (storedItems) setItems(JSON.parse(storedItems));
      if (storedCoupon) setCoupon(JSON.parse(storedCoupon));
      if (storedReferral) {
        setReferralCode(storedReferral);
        setReferralApplied(true);
      }
      if (storedUseExu === "true") {
        setUseExu(true);
        localStorage.removeItem("saily_checkout_use_exu");
      }
    } catch {
      // ignore
    }
  }, []);

  // Auto-fill email + phone from logged-in user profile
  const { data: myProfile } = useMyProfile();
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (myProfile?.phoneNumber && !phone) {
      setPhone(myProfile.phoneNumber);
    }
  }, [myProfile]);

  const subtotal = getSubtotal(items);
  const discount = getDiscount(subtotal, coupon);
  const total = getTotal(items, coupon);
  const formatPrice = (usd: number) => formatVnd(convertUsdToVnd(usd, usdToVndRate));

  // VND-aware subtotal/total for checkout display
  const hasVndPricing = items.some((i) => i.vndPrice);
  const vndSubtotal = items.reduce((sum, i) => {
    if (i.vndPrice) return sum + i.vndPrice * i.quantity;
    return sum + convertUsdToVnd(i.price * i.quantity, usdToVndRate);
  }, 0);

  const vndDiscount = getVndDiscount(vndSubtotal, coupon);
  const vndTotal = Math.max(0, vndSubtotal - vndDiscount);

  // eXU calculations
  const exuAmountNum = useExu ? Math.max(0, parseInt(exuAmount.replace(/\D/g, ""), 10) || 0) : 0;
  const maxExuUsable = wallet && wallet.status === "active"
    ? Math.min(wallet.availableBalanceVnd, Math.max(0, vndTotal - (referralApplied ? 10000 : 0)))
    : 0;
  const actualExuUsed = Math.min(exuAmountNum, maxExuUsable);
  const referralDiscountAmount = referralApplied ? 10000 : 0;
  const finalVndTotal = Math.max(0, vndTotal - actualExuUsed - referralDiscountAmount);

  const checkoutDisplaySubtotal = hasVndPricing
    ? `${vndSubtotal.toLocaleString("vi-VN")}₫`
    : formatPrice(subtotal);
  const checkoutDisplayDiscount = hasVndPricing
    ? `${vndDiscount.toLocaleString("vi-VN")}₫`
    : formatPrice(discount);
  const checkoutDisplayTotal = hasVndPricing
    ? `${finalVndTotal.toLocaleString("vi-VN")}₫`
    : formatPrice(total);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = dict.emailRequired || "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = dict.emailInvalid || "Invalid email address";
    }

    // Phone is optional — only validate format if provided
    if (phone.trim() && !/^[0-9+\-\s()]{8,15}$/.test(phone)) {
      newErrors.phone = dict.phoneInvalid || "Invalid phone number";
    }

    if (wantInvoice) {
      if (!invoiceInfo.companyName.trim()) {
        newErrors.companyName = dict.companyRequired || "Company name is required";
      }
      if (!invoiceInfo.taxCode.trim()) {
        newErrors.taxCode = dict.taxCodeRequired || "Tax code is required";
      }
      if (!invoiceInfo.address.trim()) {
        newErrors.invoiceAddress = dict.addressRequired || "Address is required";
      }
      if (!invoiceInfo.email.trim()) {
        newErrors.invoiceEmail = dict.invoiceEmailRequired || "Invoice email is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    // If user is not logged in, show auth modal
    if (!user) {
      openAuthModal();
      return;
    }

    if (!validate()) return;

    const checkoutItems = items.map((item) => ({
      planId: Number(item.id),
      quantity: item.quantity,
      ...(item.durationDays ? { periodNum: item.durationDays } : {}),
    }));

    checkout.mutate(
      {
        token: token || undefined,
        paymentMethod: "stripe",
        paymentId: "",
        currency: "USD",
        items: checkoutItems,
        couponCode: coupon?.code || "",
        referralCode: referralApplied ? referralCode : undefined,
        useWalletAmountVnd: actualExuUsed > 0 ? actualExuUsed : undefined,
        ...(phone.trim() ? { phoneNumber: phone.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
        // Only attach `invoice` when the user opted in. Backend rejects
        // partial/empty invoice objects with 422, so we omit entirely otherwise.
        ...(wantInvoice
          ? {
            invoice: {
              companyName: invoiceInfo.companyName.trim(),
              taxCode: invoiceInfo.taxCode.trim(),
              address: invoiceInfo.address.trim(),
              invoiceEmail: invoiceInfo.email.trim(),
            },
          }
          : {}),
      },
      {
        onSuccess: (data) => {
          // Persist order info for the result page
          localStorage.setItem(
            "saily_last_order",
            JSON.stringify({
              orderNumber: data.orderNumber,
              items,
              coupon,
              email,
              phone,
              wantInvoice: wantInvoice ? invoiceInfo : null,
              paymentMethod: "onepay",
              exuUsed: actualExuUsed,
              referralDiscount: referralDiscountAmount,
              referralCode: referralApplied ? referralCode : null,
            })
          );
          // Don't clear cart here — BE will clear it when order is completed

          // Redirect to OnePay payment gateway
          window.location.href = data.paymentUrl;
        },
        onError: (error) => {
          alert(
            error.message ||
            (lang === "vi"
              ? "Lỗi kết nối. Vui lòng thử lại."
              : "Network error. Please try again.")
          );
        },
      }
    );
  };

  // Order Complete Screen
  if (orderComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">
          {dict.orderSuccess || "Order placed successfully!"}
        </h2>
        <p className="text-text-secondary text-center max-w-md">
          {dict.orderSuccessDescription ||
            "Thank you for your order. You will receive a confirmation email shortly."}
        </p>
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-2 rounded-full bg-bg-accent px-7 py-3 font-medium text-text-primary transition-colors hover:bg-bg-accent-hover"
        >
          {dict.backToHome || "Back to Home"}
        </Link>
      </div>
    );
  }

  // Empty checkout
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg-secondary">
          <ShoppingBag className="h-10 w-10 text-text-tertiary" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">
          {dict.noItems || "No items to checkout"}
        </h2>
        <Link
          href={localizedHref(lang, "cart")}
          className="inline-flex items-center gap-2 rounded-full bg-bg-accent px-7 py-3 font-medium text-text-primary transition-colors hover:bg-bg-accent-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          {dict.backToCart || "Back to Cart"}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Back to cart */}
        <Link
          href={localizedHref(lang, "cart")}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {dict.backToCart || "Back to Cart"}
        </Link>

        {/* Contact Info */}
        <div className="rounded-2xl border border-border-primary bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Mail className="h-5 w-5 text-text-tertiary" />
            {dict.contactInfo || "Contact Information"}
          </h3>
          <p className="text-sm text-text-tertiary">
            {dict.contactInfoDescription || "We'll send your order confirmation here."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-text-primary">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder={dict.emailPlaceholder || "your@email.com"}
                  className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none transition-colors ${errors.email ? "border-red-400" : "border-border-primary focus:border-[var(--border-focus)]"
                    }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-text-primary">
                {dict.phone || "Phone"}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  placeholder={dict.phonePlaceholder || "+84 xxx xxx xxx"}
                  className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none transition-colors ${errors.phone ? "border-red-400" : "border-border-primary focus:border-[var(--border-focus)]"
                    }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>
          </div>
        </div>
        {/* eXU Wallet */}
        {wallet && wallet.status === "active" && wallet.availableBalanceVnd > 0 && (
          <div className="rounded-2xl border border-border-primary bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-text-primary">{wt.useExuBalance}</h3>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={useExu}
                  onClick={() => {
                    setUseExu(!useExu);
                    if (useExu) setExuAmount("");
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${useExu ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${useExu ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
              </label>
            </div>
            <p className="text-sm text-text-tertiary">
              {wt.useExuBalanceDesc} — <span className="font-medium text-emerald-600">{formatVnd(wallet.availableBalanceVnd)}</span>
            </p>
            {useExu && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">{wt.enterExuAmount}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={exuAmount}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      const num = parseInt(raw, 10) || 0;
                      if (num <= maxExuUsable) {
                        setExuAmount(raw ? num.toLocaleString("vi-VN") : "");
                      }
                    }}
                    placeholder={formatVnd(maxExuUsable)}
                    className="w-full rounded-xl border border-border-primary px-4 py-2.5 text-sm outline-none focus:border-[var(--border-focus)] transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-tertiary">VND</span>
                </div>
                <p className="text-xs text-text-tertiary">
                  {wt.exuBalance}: {formatVnd(wallet.availableBalanceVnd)} · {lang === "vi" ? "Tối đa" : "Max"}: {formatVnd(maxExuUsable)}
                </p>
              </div>
            )}
          </div>
        )}
        {/* Payment Method */}
        <div className="rounded-2xl border border-border-primary bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-text-tertiary" />
            {dict.paymentMethod || "Payment Method"}
          </h3>

          <div className="space-y-3">
            {/* OnePay */}
            <label
              className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-colors ${paymentMethod === "onepay"
                  ? "border-[var(--bg-accent)] bg-yellow-50/30"
                  : "border-border-primary hover:bg-bg-secondary"
                }`}
            >
              <input
                type="radio"
                name="payment"
                value="onepay"
                checked={paymentMethod === "onepay"}
                onChange={() => setPaymentMethod("onepay")}
                className="h-4 w-4 accent-[var(--bg-accent)]"
              />
              <div className="flex items-center gap-3 flex-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">OnePay</p>
                  <p className="text-xs text-text-tertiary">
                    {dict.onepayDescription || "Pay with credit/debit card via OnePay"}
                  </p>
                </div>
              </div>
            </label>

            {/* Bank Transfer */}
            <label
              className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-colors ${paymentMethod === "bank_transfer"
                  ? "border-[var(--bg-accent)] bg-yellow-50/30"
                  : "border-border-primary hover:bg-bg-secondary"
                }`}
            >
              <input
                type="radio"
                name="payment"
                value="bank_transfer"
                checked={paymentMethod === "bank_transfer"}
                onChange={() => setPaymentMethod("bank_transfer")}
                className="h-4 w-4 accent-[var(--bg-accent)]"
              />
              <div className="flex items-center gap-3 flex-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {dict.bankTransfer || "Bank Transfer"}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {dict.bankTransferDescription || "Transfer directly to our bank account"}
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>



        {/* Invoice Option */}
        <div className="rounded-2xl border border-border-primary bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <FileText className="h-5 w-5 text-text-tertiary" />
              {dict.invoice || "Invoice"}
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm text-text-secondary">
                {dict.wantInvoice || "I want an invoice"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={wantInvoice}
                onClick={() => {
                  setWantInvoice(!wantInvoice);
                  setShowInvoiceForm(!wantInvoice);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${wantInvoice ? "bg-bg-accent" : "bg-gray-200"
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${wantInvoice ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </label>
          </div>

          {wantInvoice && (
            <>
              <button
                onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {showInvoiceForm ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {dict.fillInvoiceInfo || "Fill invoice information"}
              </button>

              {showInvoiceForm && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="companyName" className="text-sm font-medium text-text-primary">
                      {dict.companyName || "Company Name"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      value={invoiceInfo.companyName}
                      onChange={(e) => {
                        setInvoiceInfo((prev) => ({ ...prev, companyName: e.target.value }));
                        setErrors((prev) => ({ ...prev, companyName: "" }));
                      }}
                      placeholder={dict.companyNamePlaceholder || "Company name"}
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${errors.companyName ? "border-red-400" : "border-border-primary focus:border-[var(--border-focus)]"
                        }`}
                    />
                    {errors.companyName && <p className="text-xs text-red-500">{errors.companyName}</p>}
                  </div>

                  {/* Tax Code */}
                  <div className="space-y-1.5">
                    <label htmlFor="taxCode" className="text-sm font-medium text-text-primary">
                      {dict.taxCode || "Tax Code"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="taxCode"
                      type="text"
                      value={invoiceInfo.taxCode}
                      onChange={(e) => {
                        setInvoiceInfo((prev) => ({ ...prev, taxCode: e.target.value }));
                        setErrors((prev) => ({ ...prev, taxCode: "" }));
                      }}
                      placeholder={dict.taxCodePlaceholder || "Tax identification number"}
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${errors.taxCode ? "border-red-400" : "border-border-primary focus:border-[var(--border-focus)]"
                        }`}
                    />
                    {errors.taxCode && <p className="text-xs text-red-500">{errors.taxCode}</p>}
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="invoiceAddress" className="text-sm font-medium text-text-primary">
                      {dict.address || "Address"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="invoiceAddress"
                      type="text"
                      value={invoiceInfo.address}
                      onChange={(e) => {
                        setInvoiceInfo((prev) => ({ ...prev, address: e.target.value }));
                        setErrors((prev) => ({ ...prev, invoiceAddress: "" }));
                      }}
                      placeholder={dict.addressPlaceholder || "Company address"}
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${errors.invoiceAddress ? "border-red-400" : "border-border-primary focus:border-[var(--border-focus)]"
                        }`}
                    />
                    {errors.invoiceAddress && <p className="text-xs text-red-500">{errors.invoiceAddress}</p>}
                  </div>

                  {/* Invoice Email */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="invoiceEmail" className="text-sm font-medium text-text-primary">
                      {dict.invoiceEmail || "Invoice Email"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="invoiceEmail"
                      type="email"
                      value={invoiceInfo.email}
                      onChange={(e) => {
                        setInvoiceInfo((prev) => ({ ...prev, email: e.target.value }));
                        setErrors((prev) => ({ ...prev, invoiceEmail: "" }));
                      }}
                      placeholder={dict.invoiceEmailPlaceholder || "Email to receive invoice"}
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors ${errors.invoiceEmail ? "border-red-400" : "border-border-primary focus:border-[var(--border-focus)]"
                        }`}
                    />
                    {errors.invoiceEmail && <p className="text-xs text-red-500">{errors.invoiceEmail}</p>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right: Order Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-border-primary bg-white p-6 space-y-5">
          <h3 className="text-lg font-bold text-text-primary">
            {dict.orderSummary || "Order Summary"}
          </h3>

          {/* Items */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {items.map((item) => {
              const itemPrice = item.vndPrice
                ? `${(item.vndPrice * item.quantity).toLocaleString("vi-VN")}₫`
                : formatPrice(item.price * item.quantity);
              return (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      {item.destination ? `${item.destination} — ` : ""}{item.name}
                    </p>
                    <p className="text-xs text-text-tertiary">x{item.quantity}</p>
                  </div>
                  <span className="font-medium text-text-primary ml-4 flex-shrink-0">
                    {itemPrice}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-border-primary pt-4 space-y-3">
            {/* Subtotal */}
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{dict.subtotal || "Subtotal"}</span>
              <span className="font-medium text-text-primary">{checkoutDisplaySubtotal}</span>
            </div>

            {/* Discount */}
            {(hasVndPricing ? vndDiscount > 0 : discount > 0) && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">
                  {dict.discount || "Discount"} ({coupon?.code})
                </span>
                <span className="font-medium text-green-600">-{checkoutDisplayDiscount}</span>
              </div>
            )}

            {/* Referral Discount */}
            {referralApplied && (
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">{wt.referralDiscount}</span>
                <span className="font-medium text-blue-600">-{formatVnd(referralDiscountAmount)}</span>
              </div>
            )}

            {/* eXU Spent */}
            {actualExuUsed > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600">{wt.exuSpent}</span>
                <span className="font-medium text-emerald-600">-{formatVnd(actualExuUsed)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between border-t border-border-primary pt-3">
              <span className="text-base font-bold text-text-primary">
                {dict.total || "Total"}
              </span>
              <span className="text-xl font-bold text-text-primary">{checkoutDisplayTotal}</span>
            </div>
          </div>

          {/* Complete Order Button */}
          <button
            onClick={handleSubmit}
            disabled={checkout.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-bg-accent py-3.5 text-base font-semibold text-text-primary transition-colors hover:bg-bg-accent-hover disabled:opacity-60 cursor-pointer"
          >
            {checkout.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {dict.processing || "Processing..."}
              </span>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                {dict.completeOrder || "Complete Order"}
              </>
            )}
          </button>

          {/* Payment note */}
          <p className="text-xs text-text-tertiary text-center">
            {dict.paymentNote ||
              "By completing your order, you agree to our Terms of Service and Privacy Policy."}
          </p>
        </div>
      </div>
    </div>
  );
}
