"use client";

import { Loader2 } from "lucide-react";
import { useLocalCarriers } from "@/lib/hooks";
import { getCarrierMeta, carrierInfra } from "./carrier-meta";
import { localCarrierHref, localCarrierTitle } from "./local-carrier-search";
import type { Locale } from "@/lib/i18n-config";
import type { LocalCarrier } from "@/lib/api";

interface LocalCarrierGridProps {
  lang: Locale;
  /** Localized "Từ" / "From" label. */
  fromLabel: string;
  /** Localized empty-state text. */
  emptyLabel: string;
  /**
   * Pre-filtered carriers to render (e.g. search matches). When omitted the
   * grid fetches and shows the full carrier list itself.
   */
  carriers?: LocalCarrier[];
}

/**
 * Grid of domestic-eSIM carrier cards, grouped dynamically from the
 * `isLocalInventory` plans' `provider` values (not hardcoded). Each card links
 * to `/esim-noi-dia/{provider}`. Shared by the homepage and all-destinations
 * "eSIM nội địa" tabs.
 */
export function LocalCarrierGrid({
  lang,
  fromLabel,
  emptyLabel,
  carriers: carriersProp,
}: LocalCarrierGridProps) {
  const { data: fetchedCarriers = [], isLoading: isFetching } = useLocalCarriers();
  const carriers = carriersProp ?? fetchedCarriers;
  const isLoading = carriersProp ? false : isFetching;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-text-tertiary animate-spin" />
      </div>
    );
  }

  if (carriers.length === 0) {
    return (
      <div className="py-12 text-center text-base text-text-tertiary">
        {emptyLabel}
      </div>
    );
  }

  // Card row of the final design "trang-chu-tab-esim-noi-dia.html" (#066):
  // white card with a light border, the carrier's wordmark in the round logo.
  return (
    <div className="grid grid-cols-1 min-[901px]:grid-cols-3 gap-[0.875rem] w-full">
      {carriers.map((carrier) => {
        const meta = getCarrierMeta(carrier.provider);
        const href = localCarrierHref(lang, carrier.provider);
        const priceLabel = `${fromLabel} ${carrier.fromVndPrice.toLocaleString("vi-VN")}đ`;
        const infra = carrierInfra(meta, lang);
        const sub = infra ? `${priceLabel} · ${infra}` : priceLabel;

        return (
          <a
            key={carrier.provider}
            href={href}
            data-testid={`local-carrier-card-${carrier.provider}`}
            className="group flex items-center gap-4 bg-white border-[0.09375rem] border-[#E5E7EB] rounded-[0.75rem] py-5 px-[1.375rem] no-underline text-[#111] transition-[border-color,box-shadow,transform] duration-150 hover:border-[#9ca3af] hover:shadow-[0_0.5rem_1.5rem_rgba(0,0,0,.06)] hover:-translate-y-[0.1875rem] focus-visible:outline-hidden focus-visible:shadow-focus"
          >
            <span
              className={`w-[3.25rem] h-[3.25rem] rounded-full text-white flex items-center justify-center font-bold shrink-0 ${meta.italic ? "italic" : ""}`}
              style={{
                backgroundColor: meta.logoBg,
                fontSize: `${meta.wordmarkSize ?? 0.6875}rem`,
                letterSpacing: meta.wordmark === "VNSKY" ? "0.02rem" : undefined,
              }}
              aria-hidden="true"
            >
              {meta.wordmark ?? meta.label}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[1.125rem] font-medium text-[#111]">
                {localCarrierTitle(lang, carrier.provider)}
              </span>
              <span className="block text-[0.875rem] text-[#6B7280] mt-[0.1875rem]">{sub}</span>
            </span>
            <svg
              className="w-[1.125rem] h-[1.125rem] stroke-[#6B7280] [stroke-width:2] fill-none shrink-0 transition-[transform,stroke] duration-150 group-hover:translate-x-[0.1875rem] group-hover:stroke-[#111]"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </a>
        );
      })}
    </div>
  );
}
