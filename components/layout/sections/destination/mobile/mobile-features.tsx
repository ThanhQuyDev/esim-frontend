"use client";

import { useState, useCallback } from "react";
import type { Destination, Plan, Region, SupportedDevicesResponse } from "@/lib/api";
import type { DestinationDict } from "../types";

interface MobileFeaturesProps {
  destination: Destination;
  dict: DestinationDict;
  lang: string;
  planSource: "destination" | "region";
  selectedPlan: Plan | null;
  region?: Region | null;
  /** Open the eKYC guide modal — shown when the selected plan requires KYC. */
  onOpenEkyc?: () => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

/* ── SVG Icons ── */
const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" fill="#dcfce7" />
    <path d="M4 7l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" fill="#fee2e2" />
    <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/* ── Section Icon Box (yellow) ── */
function SectionIconBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-7 h-7 rounded-lg bg-[#FFF500] flex items-center justify-center shrink-0">
      {children}
    </span>
  );
}

/* ── Feature Row ── */
function FeatureRow({ label, value, yesText, noText }: { label: string; value: boolean; yesText: string; noText: string }) {
  return (
    <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] last:border-b-0 gap-3">
      <span className="text-sm text-[#374151]">{label}</span>
      {value ? (
        <span className="inline-flex items-center gap-[5px] text-sm font-semibold text-[#16A34A]">
          <CheckIcon />
          {yesText}
        </span>
      ) : (
        <span className="inline-flex items-center gap-[5px] text-sm font-semibold text-[#DC2626]">
          <XIcon />
          {noText}
        </span>
      )}
    </div>
  );
}

/* ── Device Checker ── */
function MobileDeviceChecker({ dict, lang }: { dict: DestinationDict; lang: string }) {
  const [query, setQuery] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    deviceName: string;
    similarDevices: string[];
  } | null>(null);

  const handleCheck = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsChecking(true);
    setResult(null);

    try {
      const params = new URLSearchParams({ search: trimmed });
      const url = `${API_BASE_URL}/api/v1/supported-devices/grouped?${params.toString()}`;
      const headers: Record<string, string> = {};
      if (lang) headers["x-custom-lang"] = lang;

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("API error");

      const data: SupportedDevicesResponse = await res.json();
      const allDevices: string[] = [];
      for (const type of data.data) {
        for (const mfr of type.manufacturers) {
          for (const dev of mfr.devices) {
            allDevices.push(dev.device);
          }
        }
      }

      if (allDevices.length > 0) {
        const lowerQuery = trimmed.toLowerCase();
        const exactMatch = allDevices.find(
          (d) =>
            d.toLowerCase() === lowerQuery ||
            d.toLowerCase().includes(lowerQuery) ||
            lowerQuery.includes(d.toLowerCase())
        );
        if (exactMatch) {
          setResult({ found: true, deviceName: exactMatch, similarDevices: [] });
        } else {
          setResult({ found: false, deviceName: trimmed, similarDevices: allDevices.slice(0, 5) });
        }
      } else {
        setResult({ found: false, deviceName: trimmed, similarDevices: [] });
      }
    } catch {
      setResult({ found: false, deviceName: trimmed, similarDevices: [] });
    } finally {
      setIsChecking(false);
    }
  }, [query, lang]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheck();
  };

  const deviceLink = lang === "vi" ? "/vi/thiet-bi-ho-tro-esim" : `/${lang}/esim-supported-devices`;

  return (
    <div className="px-4 py-[18px] border-t-[7px] border-[#f3f4f6]">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <SectionIconBox>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="3" />
            <path d="M12 18h.01M9 6h6" />
          </svg>
        </SectionIconBox>
        <span className="text-base font-bold text-[#1a1a1a]">{dict.deviceCheck.title}</span>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm text-[#6b7280]">{dict.deviceCheck.placeholder}</p>
        {/* Input row */}
        <div className="flex gap-[9px]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="VD: iPhone 15, Samsung S24…"
            className="flex-1 px-4 py-3 border border-[#e5e7eb] rounded-[30px] text-base font-[inherit] text-[#1a1a1a] outline-none bg-white focus:border-[#1a1a1a]"
          />
          <button
            onClick={handleCheck}
            disabled={isChecking || !query.trim()}
            className="px-5 py-3 bg-[#1a1a1a] text-white border-none rounded-[30px] text-sm font-bold cursor-pointer font-[inherit] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed active:bg-[#333]"
          >
            {isChecking ? dict.deviceCheck.checking : dict.deviceCheck.button}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div>
            {result.found ? (
              <div className="p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-sm font-medium text-[#15803d]">
                {dict.deviceCheck.supported.replace("{device}", result.deviceName)}
              </div>
            ) : (
              <div className="p-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-sm font-medium text-[#991b1b]">
                {dict.deviceCheck.notSupported.replace("{device}", result.deviceName)}
              </div>
            )}
          </div>
        )}

        {/* Info note */}
        <div className="flex flex-col gap-[5px] mt-1">
          <div className="flex items-start gap-[7px] text-sm text-[#6b7280] leading-[1.55]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span>{dict.disclaimer}</span>
          </div>
          <a href={deviceLink} className="text-sm text-[#1a1a1a] font-semibold underline pl-5">
            {dict.disclaimerLink}
          </a>
        </div>
      </div>
    </div>
  );
}

export function MobileFeatures({
  destination,
  dict,
  lang,
  planSource,
  selectedPlan,
  region,
  onOpenEkyc,
}: MobileFeaturesProps) {
  const [bannerOpen, setBannerOpen] = useState(false);
  const deviceLink = lang === "vi" ? "/vi/thiet-bi-ho-tro-esim" : `/${lang}/esim-supported-devices`;

  // Determine feature values from selected plan
  const hasHotspot = selectedPlan?.hotSpot ?? false;
  const hotSpotAllowGb = selectedPlan?.hotSpotAllow ?? null;
  const hasCalls = selectedPlan?.call != null && Number(selectedPlan.call) > 0;
  const hasLocalNumber = false; // eSIM typically doesn't provide local number
  const hasEkyc = !!selectedPlan?.isKyc;
  const hasTopup = selectedPlan?.topUp ?? true
  const operatorName = selectedPlan?.operatorName || null;
  const speed = selectedPlan?.speed || null;;

  return (
    <>


      {/* ── Features Section ── */}
      <div className="px-4 py-[18px] border-t-[7px] border-[#f3f4f6]">
        <div className="flex items-center gap-2.5 mb-4">
          <SectionIconBox>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </SectionIconBox>
          <span className="text-base font-bold text-[#1a1a1a]">{dict.features.title}</span>
        </div>
        {operatorName && (
          <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] gap-3">
            <span className="text-sm text-[#374151] shrink-0">{dict.carriers.domestic}</span>
            <div className="flex flex-nowrap gap-[5px] flex-1 justify-end overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <span className="px-2.5 py-1 border border-[#D1D5DB] rounded-md text-sm font-semibold whitespace-nowrap shrink-0">
                {operatorName}
              </span>
            </div>
          </div>
        )}
        {speed && (
          <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] gap-3">
            <span className="text-sm text-[#374151] shrink-0">{dict.carriers.speed}</span>
            <div className="flex flex-nowrap gap-[5px] flex-1 justify-end overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <span className="px-2.5 py-1 border border-[#D1D5DB] rounded-md text-sm font-semibold whitespace-nowrap shrink-0">
                {speed}
              </span>
            </div>
          </div>
        )}
        {/* Hotspot — dynamic from plan.hotSpot / plan.hotSpotAllow */}
        <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] gap-3">
          <span className="text-sm text-[#374151]">{dict.features.hotspot}</span>
          {hasHotspot && hotSpotAllowGb ? (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap"
              style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1.5px solid #BFDBFE" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.55a11 11 0 0114.08 0" />
                <path d="M1.42 9a16 16 0 0121.16 0" />
                <path d="M8.53 16.11a6 6 0 016.95 0" />
                <circle cx="12" cy="20" r="1" fill="#1D4ED8" />
              </svg>
              {hotSpotAllowGb} GB / {lang === "en" ? "day" : "ngày"}
            </span>
          ) : hasHotspot ? (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap"
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
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold" style={{ background: "#FEF2F2", color: "#B91C1C", border: "1.5px solid #FECACA" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              {dict.features.no}
            </span>
          )}
        </div>
        <FeatureRow label={dict.features.calls} value={hasCalls} yesText={dict.features.yes} noText={dict.features.no} />
        <FeatureRow label={dict.features.localNumber} value={hasLocalNumber} yesText={dict.features.yes} noText={dict.features.no} />
        <FeatureRow label={dict.features.topup} value={hasTopup} yesText={dict.features.yes} noText={dict.features.no} />
        {!hasEkyc && (
          <FeatureRow label={dict.features.ekyc} value={false} yesText={dict.features.yes} noText={dict.features.no} />
        )}

        {/* Inline eKYC banner — appears at the bottom of the Features list */}
        {hasEkyc && (
          <div
            className="mt-3.5 rounded-[14px] overflow-hidden"
            style={{
              border: "2px solid #FCA5A5",
              background: "linear-gradient(135deg, #FFF1F2, #FFF7ED)",
            }}
          >
            <button
              type="button"
              onClick={() => setBannerOpen((v) => !v)}
              className="flex items-center gap-2.5 px-3.5 py-3 w-full cursor-pointer select-none border-none bg-transparent font-[inherit] text-left"
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
                {lang === "en" ? "⚠ This eSIM requires identity verification" : "⚠ eSIM này cần xác thực danh tính"}
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
                <div className="flex flex-col gap-[7px] px-3.5 pt-[11px] pb-2.5">
                  {[
                    lang === "en" ? "Buy eSIM & receive QR code via email" : "Mua eSIM & nhận mã QR qua email",
                    lang === "en" ? "Scan the QR code to install on your device." : "Quét mã QR để cài đặt vào thiết bị.",
                    lang === "en"
                      ? "Complete identity verification (Passport) → Start using."
                      : "Hoàn tất xác thực danh tính (Hộ chiếu) → Bắt đầu sử dụng.",
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#DC2626] text-white text-[12px] font-extrabold flex items-center justify-center shrink-0 mt-px">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-[1.5]" style={{ color: "#7F1D1D" }}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
                {onOpenEkyc && (
                  <button
                    type="button"
                    onClick={onOpenEkyc}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 mx-3.5 mb-3.5 rounded-full text-sm font-bold text-white border-none cursor-pointer font-[inherit] w-[calc(100%-28px)] max-w-full"
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
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Device Checker Section (moved above Features) ── */}
      <MobileDeviceChecker dict={dict} lang={lang} />

      {/* ── Delivery Section ── */}
      <div className="px-4 py-[18px] border-t-[7px] border-[#f3f4f6]">
        <div className="flex items-center gap-2.5 mb-4">
          <SectionIconBox>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </SectionIconBox>
          <span className="text-base font-bold text-[#1a1a1a]">{dict.delivery.title}</span>
        </div>

        {/* Delivery time row */}
        <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] gap-3">
          <span className="text-sm text-[#374151]">{dict.delivery.deliveryTime}</span>
          <div className="flex flex-col items-end gap-[5px]">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#DCFCE7] border border-[#86EFAC] rounded-[20px] text-[.875rem] font-bold text-[#15803D] whitespace-nowrap">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {dict.delivery.instant}
            </span>
            <span className="text-sm text-[#6b7280]">{dict.delivery.instantDesc}</span>
          </div>
        </div>

        {/* Activation period */}
        <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] gap-3">
          <span className="text-sm text-[#374151]">{dict.delivery.activationPeriod}</span>
          <span className="text-sm font-bold">
            {selectedPlan?.provider === 'viettel'
              ? (lang === "vi" ? "15 ngày kể từ ngày mua" : "15 days from purchase")
              : dict.delivery.activationDesc}
          </span>
        </div>

        {/* Warning box */}
        <div className="flex items-start gap-2.5 mt-[13px] p-[13px] bg-[#FFFBEB] border border-[#FDE68A] rounded-sm">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-px">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-sm text-[#92400e] leading-[1.55]">
            <strong className="text-[#78350f]">{dict.note.title}:</strong> {dict.note.text}
          </p>
        </div>
      </div>
    </>
  );
}
