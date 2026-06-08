"use client";

import { useState } from "react";
import Image from "next/image";
import type { Destination, Region } from "@/lib/api";
import { getCloudinaryTransformedUrl } from "@/lib/image-utils";
import type { DestinationDict } from "../types";
import { CountriesModal } from "../countries-modal";

interface MobileHeroProps {
  destination: Destination;
  dict: DestinationDict;
  lang: string;
  region?: Region | null;
  /** Operator name to seed the countries modal carrier column. */
  operatorName?: string;
}

function flagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function MobileHero({ destination, dict, lang, region, operatorName }: MobileHeroProps) {
  const [countriesOpen, setCountriesOpen] = useState(false);
  const heroSrc = getCloudinaryTransformedUrl(destination.avatarUrl, {
    width: 820,
    height: 460,
    quality: "auto:eco",
    gravity: "center",
  });

  const isRegion =
    !!region && ((region.destinations?.length ?? 0) > 0 || (region.destinationCount ?? 0) > 1);
  const previewCountries = isRegion
    ? (region?.destinations || []).slice(0, 4).map((d) => ({
      url: d.flagUrl,
      emoji: flagEmoji(d.countryCode),
      name: d.name,
    }))
    : [{ url: destination.flagUrl, emoji: flagEmoji(destination.countryCode), name: destination.name }];
  const countryCount = isRegion
    ? (region?.destinations?.length ?? region?.destinationCount ?? 0)
    : 1;
  const buttonLabel = isRegion
    ? dict.viewCountries.replace("{count}", String(countryCount))
    : (lang === "vi" ? `Bao gồm ${destination.name}` : `Includes ${destination.name}`);
  const viewAllLabel = lang === "vi" ? "Xem tất cả" : "View all";

  return (
    <>
      {/* Hero - 230px full-bleed with dark gradient */}
      <div className="relative w-full h-[230px]">
        <div className="absolute inset-0">
          {heroSrc ? (
            <Image
              src={heroSrc}
              alt={destination.name}
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-[center_30%]"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: "linear-gradient(160deg,#E8824A,#FAC96A,#7BAFC0)" }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom,rgba(0,0,0,.12),rgba(0,0,0,.52) 60%,rgba(0,0,0,.70))",
            }}
          />
        </div>

        <div className="absolute inset-0 z-[2] flex flex-col justify-end px-[18px] pb-[34px] overflow-hidden">
          <div className="flex items-center gap-[9px] mb-[9px] min-w-0">
            <div className="inline-flex items-center gap-[5px] bg-[#22C55E] rounded-[30px] px-[11px] py-1 shrink-0">
              <span className="text-[.875rem] font-extrabold text-white">
                {dict.trust?.rating || "4.7"}
              </span>
              <span className="text-xs text-white">★</span>
            </div>
            <span className="text-sm text-white/[0.92] font-medium truncate">
              {dict.trust?.ratingCount || "97K+ đánh giá"}
            </span>
          </div>
          <div className="text-[12.5px] text-white/[0.82] font-medium mb-[5px] truncate">
            {lang === "vi" ? "eSIM du lịch tốt nhất" : "Best travel eSIM"} {(lang === "vi" ? destination.titleVi : destination.title) || destination.name}
          </div>
          <div className="flex items-center gap-[11px] min-w-0">
            {(region?.iconUrl || destination.flagUrl) ? (
              <div className="w-[30px] h-[30px] rounded-full overflow-hidden shrink-0">
                <Image src={region?.iconUrl ? region.iconUrl : (destination.flagUrl || region?.iconUrl || "")} alt={destination.name} width={30} height={30} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-[30px] h-[30px] bg-[#fff500] rounded-full flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
                </svg>
              </div>
            )}
            <h1 className="text-[28px] font-extrabold text-white tracking-[-0.4px] leading-[1.15] min-w-0 break-words">
              {(lang === "vi" ? destination.titleVi : destination.title) || dict.title.replace("{destination}", destination.name)}
            </h1>
          </div>
        </div>
      </div>

      {/* Sheet - white card overlapping hero by 22px */}
      <div className="relative z-10 bg-white rounded-t-[22px] -mt-[22px] pt-1.5 ">
        {/* Countries button — only meaningful for region pages (multi-country coverage) */}
        {isRegion && (
          <div className="px-4 pt-4 max-w-full">
            <button
              type="button"
              onClick={() => setCountriesOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 border border-[#e5e7eb] rounded-[40px] bg-white cursor-pointer font-[inherit] active:bg-[#f9fafb] overflow-hidden"
            >
              <span className="flex gap-1 shrink-0">
                {previewCountries.map((c, i) =>
                  c.url ? (
                    <img
                      key={i}
                      src={c.url}
                      alt={c.name}
                      loading="lazy"
                      className="w-5 h-[14px] rounded-[2px] object-cover shrink-0"
                    />
                  ) : (
                    <span key={i} className="text-base leading-none">
                      {c.emoji}
                    </span>
                  )
                )}
              </span>
              <span className="w-px h-[18px] bg-[#e5e7eb] mx-0.5 shrink-0" />
              <span className="flex-1 min-w-0 text-sm font-semibold text-[#111] text-left truncate">
                {buttonLabel}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-bold text-white shrink-0"
                style={{ background: "#111" }}
              >
                {viewAllLabel}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                  <polyline points="15 18 21 12 15 6" opacity=".4" />
                </svg>
              </span>
            </button>
          </div>
        )}

        {/* Description */}
        <p className="px-4 pt-3.5 text-[14.5px] text-[#6b7280] leading-[1.65]">
          {(lang === "vi" ? destination.descriptionVi : destination.description) || dict.subtitle.replace("{destination}", destination.name)}
        </p>
      </div>

      {isRegion && (
        <CountriesModal
          open={countriesOpen}
          onClose={() => setCountriesOpen(false)}
          region={region}
          destination={destination}
          defaultCarrier={operatorName || ""}
          dict={dict}
          lang={lang}
        />
      )}
    </>
  );
}
