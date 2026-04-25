"use client";

import { useRef } from "react";
import type { PressAreaDict } from "./translations";

interface ProductFamilyProps {
  dict: PressAreaDict["productFamily"];
}

const products = [
  { name: "Saily", logo: "https://sb.nordcdn.com/m/5f10dce7ea3196e9/original/saily-logo-product-family.svg", width: 93, height: 40, href: "https://saily.com/", external: false },
  { name: "NordVPN", logo: "https://sb.nordcdn.com/m/3c5f76de98430d53/original/Product-NordVPN.svg", width: 178, height: 40, href: "https://nordvpn.com/", external: true },
  { name: "NordLayer", logo: "https://sb.nordcdn.com/m/f62c317cd03a697a/original/Product-NordLayer.svg", width: 200, height: 40, href: "https://nordlayer.com/", external: true },
  { name: "NordPass", logo: "https://sb.nordcdn.com/m/299274ff17270601/original/Product-NordPass.svg", width: 188, height: 40, href: "https://nordpass.com/", external: true },
  { name: "NordLocker", logo: "https://sb.nordcdn.com/m/abfbdfa24a12a623/original/Product-NordLocker.svg", width: 208, height: 40, href: "https://nordlocker.com/", external: true },
  { name: "NordStellar", logo: "https://sb.nordcdn.com/m/d76fbeee14011591/original/Product-NordStellar.svg", width: 211, height: 40, href: "https://nordstellar.com/", external: true },
  { name: "NordProtect", logo: "https://sb.nordcdn.com/m/7bfaf3b829128f4d/original/Product-NordProtect.svg", width: 222, height: 40, href: "https://nordprotect.com/", external: true },
];

export function ProductFamily({ dict }: ProductFamilyProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === "right" ? 300 : -300, behavior: "smooth" });
  };

  return (
    <div data-section="ProductFamilyCarousel" data-testid="section-ProductFamilyCarousel" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="heading-xl scroll-mt-20 xl:scroll-mt-24">{dict.title}</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="overflow-x-auto overflow-y-visible scrollbar-none" ref={scrollRef}>
              <div className="flex gap-6 w-max">
                {products.map((product) => (
                  <div key={product.name} className="h-auto w-auto">
                    <div className="flex flex-col text-left relative h-full transform-gpu border-none p-10 gap-10 w-fit min-w-[220px] items-center bg-bg-primary rounded-[var(--radius-lg)] shadow-sm border border-border-primary">
                      <div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt={`${product.name} logo`} loading="lazy" width={product.width} height={product.height} decoding="async" style={{ color: "transparent" }} src={product.logo} />
                      </div>
                      <a
                        role="button"
                        className="max-md:w-full text-center w-full inline-block text-text-primary hover:text-white hover:bg-[var(--bg-dark)] border border-border-secondary active:bg-[var(--bg-dark)] active:text-white box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
                        {...(product.external ? { rel: "noopener noreferrer nofollow", target: "_blank" } : {})}
                        href={product.href}
                      >
                        {dict.visitProduct}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-4 items-center mt-10">
              <button onClick={() => scroll("left")} className="text-text-primary hover:text-white hover:bg-[var(--bg-dark)] border border-border-secondary active:bg-[var(--bg-dark)] active:text-white box-border touch-manipulation align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus inline-flex gap-2 text-start body-md-medium rounded-full p-0 h-12 w-12 justify-center items-center" aria-label="Previous">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => scroll("right")} className="text-text-primary hover:text-white hover:bg-[var(--bg-dark)] border border-border-secondary active:bg-[var(--bg-dark)] active:text-white box-border touch-manipulation align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus inline-flex gap-2 text-start body-md-medium rounded-full p-0 h-12 w-12 justify-center items-center" aria-label="Next">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
