"use client";

import { useState } from "react";
import Image from "next/image";
import type { Destination, Plan, Region } from "@/lib/api";
import { getCloudinaryTransformedUrl } from "@/lib/image-utils";
import type { DestinationDict } from "./types";
import { CountriesModal } from "./countries-modal";

interface ProductCardProps {
  destination: Destination;
  dict: DestinationDict;
  lang: string;
  planSource?: "destination" | "region";
  selectedPlan?: Plan | null;
  region?: Region | null;
  /** Called when user opens the eKYC popup from the inline banner. */
  onOpenEkyc?: () => void;
}

/* ── SVG helpers ── */
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" fill="#dcfce7" />
    <path d="M4 7l2 2 4-4" stroke="#16a34a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" fill="#fee2e2" />
    <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#dc2626" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const ClockChip = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const WarnIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-px">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

function flagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/* ── Feature row ── */
function FeatureRow({ label, value, yesText, noText }: { label: string; value: boolean; yesText: string; noText: string }) {
  return (
    <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] last:border-b-0 gap-3">
      <span className="text-base sm:text-sm  text-[#374151]">{label}</span>
      <div className="flex items-center gap-1">
        {value ? (
          <span className="inline-flex items-center gap-1 text-base sm:text-sm font-semibold text-[#16A34A]"><CheckIcon />{yesText}</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-base sm:text-sm font-semibold text-[#DC2626]"><XIcon />{noText}</span>
        )}
      </div>
    </div>
  );
}

/**
 * Combined product card: hero image, title, countries button, feature/delivery tabs,
 * and an inline eKYC warning banner (when the selected plan requires KYC).
 *
 * All sections live inside one rounded panel — matching the connected `.pic` block
 * from the HTML reference.
 */
export function ProductCard({
  destination,
  dict,
  lang,
  planSource = "destination",
  selectedPlan,
  region,
  onOpenEkyc,
}: ProductCardProps) {
  const [activeTab, setActiveTab] = useState<"features" | "delivery">("features");
  const [countriesOpen, setCountriesOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);

  const isRegion = planSource === "region";
  const heroSrc = getCloudinaryTransformedUrl(destination.avatarUrl, {
    width: 520,
    height: 260,
    quality: "auto:eco",
    gravity: "center",
  });

  // Derive feature values from the selected plan
  const hasHotspot = selectedPlan?.hotSpot ?? false;
  const hotSpotAllowGb = selectedPlan?.hotSpotAllow ?? null;
  const hasCalls = selectedPlan ? (Number(selectedPlan.call ?? 0) > 0 || Number(selectedPlan.sms ?? 0) > 0) : false;
  const hasLocalNumber = false;
  const hasEkyc = !!selectedPlan?.isKyc;
  const hasTopup = selectedPlan ? selectedPlan.topUp : false;
  const durations = selectedPlan ? selectedPlan?.durationDays : false

  const operatorName = selectedPlan?.operatorName || null;
  const speed = selectedPlan?.speed || null;

  // Country preview (flag images) for the button — falls back to emoji when flagUrl is missing
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
      <div className="rounded-[20px] overflow-hidden border border-[#e5e7eb] bg-white">
        {/* Hero image */}
        <div className="w-full h-[230px] overflow-hidden">
          {heroSrc ? (
            <Image
              src={heroSrc}
              alt={destination.name}
              width={520}
              height={260}
              sizes="(min-width: 841px) 465px, 100vw"
              priority
              fetchPriority="high"
              className="w-full h-full object-cover object-[center_30%] block"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "linear-gradient(160deg,#E8824A,#FAC96A,#7BAFC0)" }}
            >
              {destination.flagUrl && (
                <Image
                  src={destination.flagUrl}
                  alt={destination.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-lg shadow-lg object-cover"
                />
              )}
            </div>
          )}
        </div>

        {/* Body — overlaps image (matches `.pic-body` from HTML) */}
        <div className="bg-white rounded-t-[18px] -mt-7 relative z-[2] px-[18px] pt-5 pb-4">
          {/* Title row with flag/icon */}
          <div className="flex items-center gap-2.5 mb-2">
            {(region?.iconUrl || destination.flagUrl) ? (
              <div className="w-[30px] h-[30px] rounded-full overflow-hidden shrink-0 border">
                <Image src={(planSource === "region" && region?.iconUrl) ? region.iconUrl : (destination.flagUrl || region?.iconUrl || "")} alt={destination.name} width={30} height={30} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-[30px] h-[30px] bg-[#fff500] rounded-full flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
                </svg>
              </div>
            )}
            <h1 className="text-[26px] font-extrabold text-[#111] leading-[1.25] tracking-[-0.4px]">
              eSIM {(lang === "vi" ? destination.titleVi : destination.title) || dict.title.replace("{destination}", destination.name)}
            </h1>
          </div>
          <p className="text-base sm:text-sm text-[#6b7280] leading-[1.6] mb-3">
            {(lang === "vi" ? destination.descriptionVi : destination.description) || dict.subtitle.replace("{destination}", destination.name)}
          </p>

          {/* Countries button — only meaningful on region pages (multi-country coverage). */}
          {isRegion && (
            <button
              type="button"
              onClick={() => setCountriesOpen(true)}
              className="w-full flex items-center gap-[9px] pl-3.5 pr-3 py-[9px] border border-[#e5e7eb] rounded-[40px] bg-white cursor-pointer font-[inherit] transition-colors hover:bg-[#f9fafb] hover:border-[#9ca3af] whitespace-nowrap overflow-hidden"
            >
              {/* Stacked flag images — falls back to emoji when flagUrl is missing */}
              <span className="flex gap-1 shrink-0">
                {previewCountries.map((c, i) =>
                  c.url ? (
                    <img
                      key={i}
                      src={c.url}
                      alt={c.name}
                      className="w-5 h-[14px] rounded-[2px] object-cover shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <span key={i} className="text-base sm:text-sm leading-none">
                      {c.emoji}
                    </span>
                  )
                )}
              </span>
              <span className="w-px h-4 bg-[#e5e7eb] shrink-0" />
              <span className="flex-1 text-sm font-semibold text-[#111] text-left overflow-hidden text-ellipsis">
                {buttonLabel}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11.5px] font-medium text-white shrink-0"
                style={{ background: "#111" }}
              >
                {viewAllLabel}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                  <polyline points="15 18 21 12 15 6" opacity=".45" />
                </svg>
              </span>
            </button>
          )}

          {/* Tab bar */}
          <div className="grid grid-cols-2 border-b-[1.5px] border-[#e5e7eb] mt-3.5">
            <button
              type="button"
              onClick={() => setActiveTab("features")}
              className={`py-[11px] px-2 text-sm font-semibold text-center flex items-center justify-center gap-1.5 transition-colors border-b-[2.5px] -mb-[1.5px] cursor-pointer bg-transparent font-[inherit] ${activeTab === "features"
                ? "text-[#111] border-[#111]"
                : "text-[#6b7280] border-transparent"
                }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              {dict.tabs.features}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("delivery")}
              className={`py-[11px] px-2 text-sm font-semibold text-center flex items-center justify-center gap-1.5 transition-colors border-b-[2.5px] -mb-[1.5px] cursor-pointer bg-transparent font-[inherit] ${activeTab === "delivery"
                ? "text-[#111] border-[#111]"
                : "text-[#6b7280] border-transparent"
                }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l9 4.5v9L12 22l-9-4.5v-9L12 2z" />
                <polyline points="3.29 7 12 11.5 20.71 7" />
                <line x1="12" y1="22" x2="12" y2="11.5" />
              </svg>
              {dict.tabs.delivery}
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "features" && (
            <div className="pt-2">
              {operatorName && (
                <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] gap-2 flex-nowrap overflow-hidden">
                  <span className="text-base sm:text-sm text-[#374151] shrink-0">{dict.carriers.domestic}</span>
                  <div className="flex flex-nowrap gap-[5px] flex-1 justify-end overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    <span className="px-2.5 py-1 border border-[#D1D5DB] rounded-md text-sm font-semibold whitespace-nowrap shrink-0">
                      {operatorName}
                    </span>
                  </div>
                </div>
              )}
              {speed && (
                <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] gap-2 flex-nowrap overflow-hidden">
                  <span className="text-base sm:text-sm text-[#374151] shrink-0">{dict.carriers.speed}</span>
                  <div className="flex flex-nowrap gap-[5px] flex-1 justify-end overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    <span className="px-2.5 py-1 border border-[#D1D5DB] rounded-md text-sm font-semibold whitespace-nowrap shrink-0">
                      {speed}
                    </span>
                  </div>
                </div>
              )}
              {/* Hotspot — dynamic from plan.hotSpot / plan.hotSpotAllow */}
              <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] gap-3">
                <span className="text-base sm:text-sm text-[#374151]">{dict.features.hotspot}</span>
                {hasHotspot && hotSpotAllowGb ? (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap"
                    style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1.5px solid #BFDBFE" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.55a11 11 0 0114.08 0" />
                      <path d="M1.42 9a16 16 0 0121.16 0" />
                      <path d="M8.53 16.11a6 6 0 016.95 0" />
                      <circle cx="12" cy="20" r="1" fill="#1D4ED8" />
                    </svg>
                    {hotSpotAllowGb} / {durations} {lang === "en" ? "day" : "ngày"}
                  </span>
                ) : hasHotspot ? (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap"
                    style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1.5px solid #BFDBFE" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.55a11 11 0 0114.08 0" />
                      <path d="M1.42 9a16 16 0 0121.16 0" />
                      <path d="M8.53 16.11a6 6 0 016.95 0" />
                      <circle cx="12" cy="20" r="1" fill="#1D4ED8" />
                    </svg>
                    {dict.features.unlimited}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium" style={{ background: "#FEF2F2", color: "#B91C1C", border: "1.5px solid #FECACA" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    {dict.features.no}
                  </span>
                )}
              </div>
              <FeatureRow label={dict.features.calls} value={hasCalls} yesText={dict.features.yes} noText={dict.features.no} />
              <FeatureRow label={dict.features.localNumber} value={hasLocalNumber} yesText={dict.features.yes} noText={dict.features.no} />
              <FeatureRow label={dict.features.topup} value={hasTopup} yesText={dict.features.yes} noText={dict.features.no} />
              {/* Hide eKYC row when banner is shown (since the banner already conveys it) */}
              {!hasEkyc && (
                <FeatureRow label={dict.features.ekyc} value={false} yesText={dict.features.yes} noText={dict.features.no} />
              )}
            </div>
          )}

          {activeTab === "delivery" && (
            <div className="pt-2">
              <div className="flex items-start justify-between py-[13px] border-b border-[#f3f4f6] gap-3">
                <span className="text-base sm:text-sm text-[#374151]">{dict.delivery.deliveryTime}</span>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-[5px] px-3 py-[5px] bg-[#DCFCE7] border border-[#86EFAC] rounded-[20px] text-[#15803D] text-sm font-medium">
                    <ClockChip />{dict.delivery.instant}
                  </span>
                  <span className="text-sm text-[#6b7280]">{dict.delivery.instantDesc}</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] gap-3">
                <span className="text-base sm:text-sm text-[#374151]">{dict.delivery.activationPeriod}</span>
                <span className="text-base sm:text-sm font-medium">
                  {selectedPlan?.provider === 'viettel'
                    ? (lang === "vi" ? "15 ngày kể từ ngày mua" : "15 days from purchase")
                    : dict.delivery.activationDesc}
                </span>
              </div>
              <div className="flex items-start gap-2.5 mt-2.5 p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-sm">
                <WarnIcon />
                <p className="text-base sm:text-sm text-[#92400E] leading-normal">
                  <strong className="text-[#78350F]">{dict.note.title}</strong> {dict.note.text}
                </p>
              </div>
            </div>
          )}

          {/* eKYC banner — only when selected plan requires KYC */}
          {hasEkyc && (
            <div
              className="mt-3.5 mb-0.5 rounded-[14px] overflow-hidden"
              style={{
                border: "2px solid #FCA5A5",
                background: "linear-gradient(135deg, #FFF1F2, #FFF7ED)",
              }}
            >
              <button
                type="button"
                onClick={() => setBannerOpen((v) => !v)}
                className="flex items-center gap-2.5 px-3.5 py-3 cursor-pointer w-full select-none border-none bg-transparent font-[inherit] text-left transition-colors hover:bg-[rgba(220,38,38,0.04)]"
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #EF4444, #DC2626)",
                    boxShadow: "0 2px 6px rgba(239,68,68,0.3)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="9" cy="10" r="2" />
                    <path d="M3 20s1-3 6-3 6 3 6 3" />
                    <path d="M16 8h3M16 12h3" />
                  </svg>
                </span>
                <span className="flex-1 text-sm font-extrabold text-[#991B1B]">
                  {lang === "en"
                    ? "⚠ This eSIM requires identity verification to use"
                    : "⚠ eSIM này cần xác thực danh tính để sử dụng"}
                </span>
                <span
                  className="w-[26px] h-[26px] rounded-full border-none cursor-pointer flex items-center justify-center text-[#DC2626] shrink-0 transition-transform"
                  style={{
                    background: "rgba(220,38,38,0.1)",
                    transform: bannerOpen ? "rotate(180deg)" : "none",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>
              {bannerOpen && (
                <div style={{ borderTop: "1.5px dashed #FCA5A5" }}>
                  <div className="flex flex-col gap-[7px] px-3.5 pt-[11px] pb-1">
                    {[
                      lang === "en" ? "Buy eSIM & receive QR code via email" : "Mua eSIM & nhận mã QR qua email",
                      lang === "en" ? "Scan the QR code to install on your device." : "Quét mã QR để cài đặt vào thiết bị.",
                      lang === "en"
                        ? "Complete identity verification (Passport) → Start using."
                        : "Hoàn tất xác thực danh tính (Hộ chiếu) → Bắt đầu sử dụng.",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full bg-[#DC2626] text-white text-[12px] font-extrabold flex items-center justify-center shrink-0 mt-px"
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm leading-[1.5]" style={{ color: "#7F1D1D" }}>
                          {i === 2 ? (
                            <>
                              <strong style={{ color: "#991B1B" }}>
                                {lang === "en" ? "Complete identity verification" : "Hoàn tất xác thực danh tính"}
                              </strong>{" "}
                              {lang === "en" ? "(Passport) → Start using." : "(Hộ chiếu) → Bắt đầu sử dụng."}
                            </>
                          ) : (
                            step
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={onOpenEkyc}
                    className="flex items-center justify-center gap-2 w-[calc(100%-28px)] my-2.5 mb-3 mx-3.5 py-2.5 rounded-full text-sm font-medium text-white border-none cursor-pointer font-[inherit] transition-opacity hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #DC2626, #B91C1C)",
                      boxShadow: "0 3px 10px rgba(220,38,38,0.3)",
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    {lang === "en" ? "View detailed registration guide" : "Xem hướng dẫn đăng ký chi tiết"}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CountriesModal
        open={countriesOpen}
        onClose={() => setCountriesOpen(false)}
        region={region}
        destination={destination}
        defaultCarrier={operatorName || ""}
        dict={dict}
        lang={lang}
      />
    </>
  );
}
