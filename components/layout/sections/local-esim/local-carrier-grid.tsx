"use client";

import { Loader2 } from "lucide-react";
import { useLocalCarriers } from "@/lib/hooks";
import { getCarrierMeta } from "./carrier-meta";
import type { Locale } from "@/lib/i18n-config";

interface LocalCarrierGridProps {
  lang: Locale;
  /** Localized "Từ" / "From" label. */
  fromLabel: string;
  /** Localized empty-state text. */
  emptyLabel: string;
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={className}
    >
      <title>Chevron right</title>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M13.2151 6.8326L8.43758 11.4101C8.27758 11.5451 8.12758 11.6001 8.00008 11.6001C7.87258 11.6001 7.70083 11.5446 7.58533 11.4329L2.78533 6.8326C2.54543 6.6051 2.53763 6.2026 2.76733 5.9851C2.99546 5.74447 3.37683 5.73665 3.61508 5.96713L8.00008 10.1701L12.3851 5.9701C12.6226 5.73962 13.0046 5.74745 13.2328 5.98807C13.4626 6.2026 13.4551 6.6051 13.2151 6.8326Z"
      />
    </svg>
  );
}

/**
 * Grid of domestic-eSIM carrier cards, grouped dynamically from the
 * `isLocalInventory` plans' `provider` values (not hardcoded). Each card links
 * to `/esim-noi-dia/{provider}`. Shared by the homepage and all-destinations
 * "eSIM nội địa" tabs.
 */
export function LocalCarrierGrid({ lang, fromLabel, emptyLabel }: LocalCarrierGridProps) {
  const { data: carriers = [], isLoading } = useLocalCarriers();

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

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 w-full">
      {carriers.map((carrier) => {
        const meta = getCarrierMeta(carrier.provider);
        const href =
          lang === "vi"
            ? `/esim-noi-dia/${carrier.provider}`
            : `/en/domestic-esim/${carrier.provider}`;
        const priceLabel = `${fromLabel} ${carrier.fromVndPrice.toLocaleString("vi-VN")}đ`;
        const sub = meta.infra ? `${priceLabel} · ${meta.infra}` : priceLabel;

        return (
          <a
            key={carrier.provider}
            href={href}
            data-testid={`local-carrier-card-${carrier.provider}`}
            className="align-bottom focus-visible:outline-hidden focus-visible:shadow-focus text-text-primary block group ease-out h-full rounded-sm transition-colors bg-bg-primary"
          >
            <div className="flex items-center gap-4 border border-transparent p-4 h-full rounded-sm transition-all hover:bg-gray-100 hover:-translate-y-[3px] hover:shadow-md bg-gray-50">
              {/* Carrier logo */}
              <div
                className="w-[52px] h-[52px] shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden"
                style={{ backgroundColor: meta.logoBg }}
              >
                <span className={meta.italic ? "italic" : undefined}>
                  {meta.label.slice(0, 2).toUpperCase()}
                </span>
              </div>

              {/* Name + price/infra */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="body-lg-medium truncate">
                  {lang === "vi" ? "eSIM " : ""}
                  {meta.label}
                </p>
                <p className="body-md text-text-tertiary truncate">{sub}</p>
              </div>

              {/* Arrow */}
              <div className="ml-auto shrink-0">
                <ChevronRightIcon className="-rotate-90 text-text-tertiary group-hover:text-text-primary transition-colors" />
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
