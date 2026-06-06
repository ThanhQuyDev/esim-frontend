"use client";

import { useState } from "react";
import { Tag, Copy, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchApiCoupons, type Coupon } from "@/lib/cart";

interface CouponHeroProps {
  dict: Record<string, any>;
  lang: string;
}

export function CouponHero({ dict, lang }: CouponHeroProps) {
  const [copied, setCopied] = useState(false);

  const { data: coupons } = useQuery<Coupon[]>({
    queryKey: ["coupons-latest"],
    queryFn: fetchApiCoupons,
  });

  const latestCoupon = coupons?.[0];
  const couponCode = latestCoupon?.code || dict.couponCode || "Saily5";

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div data-section="Hero" data-testid="section-Hero" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="mx-auto">
              <div className="mx-auto container">
                <div className="grid sm:gap-x-16 gap-y-8 grid-cols-1 md:grid-cols-2">
                  <div className="h-full flex flex-col justify-center gap-y-4">
                    <div className="h-full w-full flex flex-col justify-center gap-y-4">
                      <div>
                        <div className="body-md-medium text-disabled">
                          <p className="!text-[1.4rem] heading-sm text-primary scroll-mt-20 xl:scroll-mt-24">
                            {dict.activeDate || "Active from April 2026"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="h-full w-full flex flex-col justify-start gap-y-6">
                          <div>
                            <h1 className="heading-xl text-primary scroll-mt-20 xl:scroll-mt-24">
                              {dict.title || "esim.vn coupon codes"}
                            </h1>
                          </div>
                          <div>
                            <p className="body-lg text-primary text-start scroll-mt-20 xl:scroll-mt-24">
                              {dict.description || "Use our coupon code at checkout to get a discount on your esim.vn plan."}
                            </p>
                          </div>
                          <div>
                            <div className="h-full w-full flex flex-col justify-start gap-y-4">
                              <div>
                                <button
                                  onClick={handleCopy}
                                  className="max-md:w-full text-primary bg-accent hover:bg-bg-accent-hover pointer-fine:hover:bg-accent-hover border-md border-bg-accent-hover pointer-fine:hover:border-accent-hover active:bg-accent-active! active:border-accent-active! box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus inline-flex gap-2 text-start justify-center items-center py-[11px] body-md-medium px-7 relative whitespace-nowrap"
                                >
                                  {copied ? (
                                    <>
                                      <Check className="w-5 h-5" />
                                      <span>{couponCode}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Tag className="w-5 h-5" />
                                      <span>{dict.cta || "Get the code"}</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              {copied && (
                                <p className="body-sm text-text-secondary flex items-center gap-1.5">
                                  <Copy className="w-4 h-4" />
                                  {lang === "vi"
                                    ? `Đã sao chép mã: ${couponCode}`
                                    : `Copied: ${couponCode}`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={dict.imageAlt || "Smiling woman applies a esim.vn coupon in the app to get a discount on her eSIM plan."}
                        loading="lazy"
                        width={555}
                        height={555}
                        decoding="async"
                        style={{ color: "transparent" }}
                        src="https://sb.nordcdn.com/m/1696b6ea0969687d/original/hero-percentage-sign-woman-phone-discount.png"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
