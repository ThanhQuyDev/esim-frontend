"use client";

import { useState } from "react";
import { Tag } from "lucide-react";

interface CouponHeroProps {
  dict: Record<string, any>;
  lang: string;
}

export function CouponHero({ dict, lang }: CouponHeroProps) {
  const [copied, setCopied] = useState(false);
  const couponCode = dict.couponCode || "Saily5";

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                          <p className="heading-sm text-primary scroll-mt-20 xl:scroll-mt-24">
                            {dict.activeDate || "Active from April 2026"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="h-full w-full flex flex-col justify-start gap-y-6">
                          <div>
                            <h1 className="heading-xl text-primary scroll-mt-20 xl:scroll-mt-24">
                              {dict.title || "Esim.vn coupon codes"}
                            </h1>
                          </div>
                          <div>
                            <p className="body-lg text-primary text-start scroll-mt-20 xl:scroll-mt-24">
                              {dict.description || "Use our coupon code at checkout to get a discount on your Esim.vn eSIM plan."}
                            </p>
                          </div>
                          <div>
                            <div className="h-full w-full flex flex-col justify-start gap-y-6">
                              <div>
                                <div className="body-md text-secondary">
                                  <button
                                    onClick={handleCopy}
                                    className="max-md:w-full text-primary bg-accent pointer-fine:hover:bg-accent-hover border-md border-accent pointer-fine:hover:border-accent-hover active:bg-accent-active! active:border-accent-active! box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus inline-flex gap-2 text-start justify-center py-[11px] body-md-medium px-7 relative whitespace-nowrap"
                                  >
                                    <span className="flex items-center shrink-0">
                                      <Tag className="w-6 h-6 mr-1" />
                                    </span>
                                    {copied ? (dict.copied || "Copied!") : (dict.cta || "Get the code")}
                                  </button>
                                </div>
                              </div>
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
                        alt={dict.imageAlt || "Smiling woman applies a Esim.vn coupon in the app to get a discount on her eSIM plan."}
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
