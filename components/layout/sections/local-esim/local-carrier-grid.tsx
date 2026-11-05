"use client";
import { useMoney } from "@/lib/money";

import { Loader2 } from "lucide-react";
import { useLocalCarriers } from "@/lib/hooks";
import { getCarrierMeta, carrierInfra } from "./carrier-meta";
import { localCarrierHref, localCarrierTitle } from "./local-carrier-search";
import { PickerCardLink } from "../destination-picker/destination-picker";
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
  // Dollars on the English site (doitac-1410 #073).
  const money = useMoney();
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
    return emptyLabel ? (
      <div className="py-12 text-center text-base text-text-tertiary">{emptyLabel}</div>
    ) : null;
  }

  // Same card as the countries and regions, trang-chu-tab-esim v3 (vande-0411 #071).
  return (
    <div className="dp-p">
      {carriers.map((carrier) => {
        const meta = getCarrierMeta(carrier.provider);
        const priceLabel = `${fromLabel} ${money.format(carrier.fromVndPrice)}`;
        const infra = carrierInfra(meta, lang);
        const wordmark = meta.wordmark ?? meta.label;

        return (
          <div key={carrier.provider}>
            <PickerCardLink
              href={localCarrierHref(lang, carrier.provider)}
              testId={`local-carrier-card-${carrier.provider}`}
              mark={
                <span
                  className={`dp-l${wordmark.length > 4 ? " dp-sm" : ""}${meta.italic ? " italic" : ""}`}
                  style={{ backgroundColor: meta.logoBg }}
                  aria-hidden="true"
                >
                  {wordmark}
                </span>
              }
              name={localCarrierTitle(lang, carrier.provider)}
              sub={infra ? `${priceLabel} · ${infra}` : priceLabel}
            />
          </div>
        );
      })}
    </div>
  );
}
