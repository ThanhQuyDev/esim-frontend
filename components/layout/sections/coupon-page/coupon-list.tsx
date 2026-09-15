"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tag, Copy, Check, Clock, ShoppingCart, BadgePercent } from "lucide-react";
import { couponDiscountLabel, toCartCoupon } from "@/lib/cart";
import { copyCouponCode, listFeaturedCoupons, type ListedCoupon } from "@/lib/coupon-list";

interface CouponListProps {
  dict: Record<string, any>;
  lang: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

async function fetchCoupons(): Promise<ListedCoupon[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/coupons?limit=50`);
  if (!res.ok) throw new Error(`Failed to fetch coupons: ${res.status}`);
  const json = await res.json();
  return (json?.data ?? []) as ListedCoupon[];
}

/**
 * "Giảm 15% (tối đa 50.000₫)" / "15% off (up to 50,000 VND)" — percentage,
 * capped percentage and flat-amount codes all read correctly.
 */
function discountLabel(coupon: ListedCoupon, vi: boolean): string {
  if (vi) {
    // The cart's label ("-15% (tối đa …)") without its minus sign.
    return `Giảm ${couponDiscountLabel(toCartCoupon(coupon)).replace(/^-/, "")}`;
  }
  const format = (vnd: number) => `${new Intl.NumberFormat("en-US").format(vnd)} VND`;
  if (coupon.discountType === "fixed") {
    return `${format(Number(coupon.discountAmount ?? 0))} off`;
  }
  const cap = Number(coupon.maxDiscountAmount ?? 0);
  return `${Number(coupon.discountPercent)}% off${cap > 0 ? ` (up to ${format(cap)})` : ""}`;
}

/**
 * Every featured coupon on /ma-giam-gia, each with its own copy button (#040).
 * Which codes appear is decided in the CMS by the "Mã nổi bật" switch.
 */
export function CouponList({ dict, lang }: CouponListProps) {
  const vi = lang === "vi";
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["coupons-featured-list"],
    queryFn: fetchCoupons,
    staleTime: 60_000,
  });

  const coupons = listFeaturedCoupons(data);

  const handleCopy = async (code: string) => {
    const ok = await copyCouponCode(code);
    if (!ok) return;
    setCopiedCode(code);
    setTimeout(() => setCopiedCode((current) => (current === code ? null : current)), 2500);
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(vi ? "vi-VN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatVnd = (amount: number) =>
    `${new Intl.NumberFormat(vi ? "vi-VN" : "en-US").format(amount)}${vi ? "đ" : " VND"}`;

  if (!isLoading && coupons.length === 0) return null;

  return (
    <section
      id="coupon-list"
      data-section="CouponList"
      data-testid="section-CouponList"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-12">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="mb-8">
              <h2 className="heading-lg text-primary">
                {dict.title || (vi ? "Mã giảm giá đang có" : "Available coupon codes")}
              </h2>
              <p className="body-md text-secondary mt-2">
                {dict.subtitle ||
                  (vi
                    ? "Sao chép mã và nhập ở giỏ hàng để được giảm giá gói eSIM."
                    : "Copy a code and enter it in your cart to save on your eSIM plan.")}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 animate-pulse rounded-xl bg-bg-secondary" />
                ))}
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
                {coupons.map((coupon) => {
                  const copied = copiedCode === coupon.code;
                  const minOrder = Number(coupon.minOrderAmount ?? 0);
                  return (
                    <li
                      key={coupon.id}
                      data-testid={`coupon-card-${coupon.code}`}
                      className="flex flex-col gap-4 rounded-xl border border-border-secondary bg-bg-primary p-5 shadow-sm"
                    >
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 body-sm-medium text-green-700">
                        <BadgePercent className="h-4 w-4" aria-hidden="true" />
                        {discountLabel(coupon, vi)}
                      </span>

                      <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border-secondary bg-bg-secondary px-4 py-3">
                        <span className="flex min-w-0 items-center gap-2">
                          <Tag className="h-5 w-5 shrink-0 text-text-tertiary" aria-hidden="true" />
                          <span className="truncate font-mono text-lg font-semibold tracking-wide text-primary">
                            {coupon.code}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleCopy(coupon.code)}
                          data-testid={`coupon-copy-${coupon.code}`}
                          aria-label={vi ? `Sao chép mã ${coupon.code}` : `Copy code ${coupon.code}`}
                          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-bg-accent px-3 py-1.5 body-sm-medium text-primary transition-colors hover:bg-bg-accent-hover"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4" aria-hidden="true" />
                              {vi ? "Đã sao chép" : "Copied"}
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" aria-hidden="true" />
                              {vi ? "Sao chép" : "Copy"}
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5 body-sm text-text-secondary">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          {coupon.expiresAt
                            ? `${vi ? "Hết hạn:" : "Expires:"} ${formatDate(coupon.expiresAt)}`
                            : vi
                              ? "Không giới hạn thời gian"
                              : "No expiry date"}
                        </span>
                        {minOrder > 0 && (
                          <span className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                            {vi ? "Đơn tối thiểu:" : "Min order:"} {formatVnd(minOrder)}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
