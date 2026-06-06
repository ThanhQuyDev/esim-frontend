"use client";

import { useState, useEffect } from "react";
import { Tag, Copy, Check, Clock, Percent } from "lucide-react";
import type { Coupon } from "@/lib/api";

interface CouponListProps {
  dict: Record<string, any>;
  lang: string;
}

export function CouponList({ dict, lang }: CouponListProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "https://api.saily.example.com";
        const res = await fetch(`${API_BASE_URL}/api/v1/coupons?limit=20`);
        if (!res.ok) throw new Error("Failed to fetch coupons");
        const data = await res.json();
        setCoupons(
          data.data.filter((c: Coupon) => c.isActive && !c.deletedAt && (!c.expiresAt || new Date(c.expiresAt) > new Date()))
        );
      } catch (err) {
        console.warn("Failed to fetch coupons:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCoupons();
  }, []);

  const handleCopy = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      lang === "vi" ? "vi-VN" : "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US").format(
      amount
    );
  };

  if (loading) {
    return (
      <div
        data-section="CouponList"
        className="relative scroll-mt-20 xl:scroll-mt-24"
      >
        <div className="py-16">
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl bg-muted h-48"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (coupons.length === 0) return null;

  return (
    <div
      data-section="CouponList"
      data-testid="section-CouponList"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="mb-10">
              <h2 className="heading-xl text-primary scroll-mt-20 xl:scroll-mt-24">
                {dict.title || "Available coupon codes"}
              </h2>
              <p className="body-md text-secondary mt-3">
                {dict.subtitle ||
                  "Copy a code and apply it at checkout to save on your eSIM plan."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Discount badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1">
                      <Percent className="w-4 h-4 text-green-700 dark:text-green-400" />
                      <span className="body-md-medium text-green-700 dark:text-green-400">
                        {coupon.discountPercent}%{" "}
                        {lang === "vi" ? "giảm" : "off"}
                      </span>
                    </div>
                  </div>

                  {/* Code + copy */}
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-primary/30 bg-muted/50 px-4 py-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-primary/60" />
                      <span className="font-mono text-lg font-semibold text-primary tracking-wide">
                        {coupon.code}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(coupon.code, coupon.id)}
                      className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-base sm:text-sm font-medium text-primary transition-colors hover:bg-accent-hover active:bg-accent-active"
                      aria-label={`Copy code ${coupon.code}`}
                    >
                      {copiedId === coupon.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          {lang === "vi" ? "Đã sao chép" : "Copied"}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {lang === "vi" ? "Sao chép" : "Copy"}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col gap-2 text-base sm:text-sm text-secondary">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {lang === "vi" ? "Hết hạn:" : "Expires:"}{" "}
                        {formatDate(coupon.expiresAt)}
                      </span>
                    </div>
                    {coupon.minOrderAmount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 text-center">₫</span>
                        <span>
                          {lang === "vi" ? "Đơn tối thiểu:" : "Min order:"}{" "}
                          {formatCurrency(coupon.minOrderAmount)}
                          {lang === "vi" ? "đ" : " VND"}
                        </span>
                      </div>
                    )}
                    {coupon.maxUsagePerUser > 0 && (
                      <div className="body-xs text-secondary/70">
                        {lang === "vi"
                          ? `Tối đa ${coupon.maxUsagePerUser} lần/người`
                          : `Max ${coupon.maxUsagePerUser} use${coupon.maxUsagePerUser > 1 ? "s" : ""} per user`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
