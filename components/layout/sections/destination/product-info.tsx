"use client";

import { useState, useCallback } from "react";
import type { Destination, Plan, Region, SupportedDevicesResponse } from "@/lib/api";
import type { DestinationDict } from "./types";
import { useDebounce } from "@/lib/use-debounce";

interface ProductInfoProps {
  destination: Destination;
  dict: DestinationDict;
  lang: string;
  planSource?: "destination" | "region";
  selectedPlan?: Plan | null;
  region?: Region | null;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

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
const BigCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
    <path d="M6 10l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const BigXIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" fill="#fee2e2" stroke="#dc2626" strokeWidth="1" />
    <path d="M7 7l6 6M13 7l-6 6" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/* ── Feature row ── */
function FeatureRow({ label, value, yesText, noText }: { label: string; value: boolean; yesText: string; noText: string }) {
  return (
    <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] last:border-b-0 gap-3">
      <span className="text-sm text-[#374151]">{label}</span>
      <div className="flex items-center gap-1">
        {value ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#16A34A]"><CheckIcon />{yesText}</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#DC2626]"><XIcon />{noText}</span>
        )}
      </div>
    </div>
  );
}

/* ── Device Compatibility Checker ── */
function DeviceChecker({ dict, lang }: { dict: DestinationDict; lang: string }) {
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

      // Flatten all device names from the response
      const allDevices: string[] = [];
      for (const type of data.data) {
        for (const mfr of type.manufacturers) {
          for (const dev of mfr.devices) {
            allDevices.push(dev.device);
          }
        }
      }

      if (allDevices.length > 0) {
        // Check if any device name closely matches the query
        const lowerQuery = trimmed.toLowerCase();
        const exactMatch = allDevices.find(
          (d) => d.toLowerCase() === lowerQuery || d.toLowerCase().includes(lowerQuery) || lowerQuery.includes(d.toLowerCase())
        );

        if (exactMatch) {
          setResult({ found: true, deviceName: exactMatch, similarDevices: [] });
        } else {
          // Show similar devices from the results
          setResult({
            found: false,
            deviceName: trimmed,
            similarDevices: allDevices.slice(0, 5),
          });
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

  return (
    <div className="border border-[#e5e7eb] rounded-2xl overflow-hidden bg-white mt-4">
      <div className="flex items-center gap-3 px-4 py-3.5 pb-1.5">
        <div className="w-8 h-8 rounded-lg bg-[#fff500] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="2" width="14" height="20" rx="3" stroke="#111" strokeWidth="2" />
            <path d="M12 18h.01" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M9 6h6" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-[13px] font-bold tracking-[0.05em] uppercase text-[#111]">
          {dict.deviceCheck.title}
        </span>
      </div>

      <div className="px-4 pb-3.5">
        <p className="text-sm text-[#6b7280] mb-2.5">{dict.deviceCheck.placeholder}</p>
        {/* Search input */}
        <div className="flex gap-2 mb-2.5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="VD: iPhone 15, Samsung S24, …"
            className="flex-1 px-3 py-[9px] border-[1.5px] border-[#e5e7eb] rounded-md text-sm text-[#111] placeholder:text-[#9ca3af] outline-none bg-white transition-colors focus:border-[#fff500] font-[inherit]"
          />
          <button
            onClick={handleCheck}
            disabled={isChecking || !query.trim()}
            className="px-[18px] py-[9px] bg-[#111] text-white text-[13px] font-bold rounded-md border-none cursor-pointer font-[inherit] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? dict.deviceCheck.checking : dict.deviceCheck.button}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mb-2">
            {result.found ? (
              <div className="flex items-center gap-2.5 p-[9px_12px] bg-[#f0fdf4] border border-[#bbf7d0] rounded-md">
                <BigCheckIcon />
                <span className="text-sm font-medium text-[#15803d]">
                  {dict.deviceCheck.supported.replace("{device}", result.deviceName)}
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-[9px_12px] bg-[#fef2f2] border border-[#fecaca] rounded-md">
                  <BigXIcon />
                  <span className="text-sm font-medium text-[#991b1b]">
                    {dict.deviceCheck.notSupported.replace("{device}", result.deviceName)}
                  </span>
                </div>
                {result.similarDevices.length > 0 && (
                  <div className="p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-md">
                    <p className="text-xs font-semibold text-[#6b7280] mb-2">
                      {dict.deviceCheck.similarDevices}
                    </p>
                    <div className="flex flex-wrap gap-[5px]">
                      {result.similarDevices.map((d) => (
                        <span
                          key={d}
                          className="text-[13px] px-2.5 py-[3px] bg-white border border-[#e5e7eb] rounded-[20px] text-[#374151] cursor-pointer hover:bg-[#fef9e7] hover:border-[#F5C518] transition-colors"
                          onClick={() => {
                            setQuery(d);
                          }}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick check chips */}
        <div className="flex flex-wrap gap-[5px] items-center">
          <span className="text-[13px] text-[#6b7280]">Thử nhanh:</span>
          {["iPhone 15", "Samsung S24", "Pixel 8"].map((d) => (
            <span
              key={d}
              className="text-[13px] px-2.5 py-[3px] bg-white border border-[#e5e7eb] rounded-[20px] text-[#374151] cursor-pointer hover:bg-[#fef9e7] hover:border-[#F5C518] transition-colors"
              onClick={() => { setQuery(d); }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductInfo({ destination, dict, lang, planSource = "destination", selectedPlan, region }: ProductInfoProps) {
  const [countriesOpen, setCountriesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"features" | "delivery">("features");
  const isRegion = planSource === "region";

  // Derive feature values from the selected plan's actual data
  const hasHotspot = true;
  const hasCalls = selectedPlan ? (Number(selectedPlan.call ?? 0) > 0 || Number(selectedPlan.sms ?? 0) > 0) : false;
  const hasLocalNumber = false;
  const hasEkyc = false;
  const hasTopup = selectedPlan ? selectedPlan.topUp : false;

  const operatorName = selectedPlan?.operatorName || null;
  const regionDestinations = region?.destinations || [];
  const speed = selectedPlan?.speed || null;

  return (
    <>
      {/* Country expand row — only for region pages */}
      {isRegion && (
        <>
          <button
            onClick={() => setCountriesOpen(!countriesOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 border-[1.5px] border-[#e5e7eb] rounded-lg bg-[#f9fafb] text-[13px] font-semibold text-[#111] cursor-pointer font-[inherit] transition-colors hover:bg-[#f0f0f0] hover:border-[#c1c7cf] mb-3"
          >
            <span className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#6b7280] border border-[#e5e7eb] rounded px-1.5 py-0.5 bg-white">
                {regionDestinations.slice(0, 4).map((d) => d.countryCode || "").join(" ")}
              </span>
              {dict.viewCountries.replace("{count}", String(regionDestinations.length || region?.destinationCount || 0))}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {countriesOpen && regionDestinations.length > 0 && (
            <div className="bg-white border border-[#e5e7eb] rounded-lg mb-3 p-3.5">
              <div className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2.5">
                {dict.supportedCountries.replace("{count}", String(regionDestinations.length))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {regionDestinations.map((d) => (
                  <span key={d.id} className="inline-flex items-center gap-1 text-[13px] font-medium px-2.5 py-1 bg-[#f9fafb] border border-[#e5e7eb] rounded-full text-[#374151]">
                    {d.flagUrl && <img src={d.flagUrl} alt="" className="w-4 h-3 rounded-sm object-cover" />}
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Tab bar ── */}
      <div className="grid grid-cols-2 border-b-[1.5px] border-[#e5e7eb] mt-3.5">
        <button
          onClick={() => setActiveTab("features")}
          className={`py-[11px] px-2 text-[13px] font-semibold text-center flex items-center justify-center gap-1.5 transition-colors border-b-[2.5px] -mb-[1.5px] cursor-pointer bg-transparent font-[inherit] ${
            activeTab === "features"
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
          onClick={() => setActiveTab("delivery")}
          className={`py-[11px] px-2 text-[13px] font-semibold text-center flex items-center justify-center gap-1.5 transition-colors border-b-[2.5px] -mb-[1.5px] cursor-pointer bg-transparent font-[inherit] ${
            activeTab === "delivery"
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

      {/* ── Tab content (desktop: tab-switched, mobile: both visible) ── */}

      {/* ── Tab content ── */}
      {activeTab === "features" && (
        <div className="pt-2">
          {/* Carriers row */}
          {operatorName && (
            <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] gap-3">
              <span className="text-sm text-[#374151] shrink-0">{dict.carriers.domestic}</span>
              <div className="flex flex-nowrap gap-[5px] flex-1 justify-end overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                <span className="px-2.5 py-1 border border-[#D1D5DB] rounded-md text-[13px] font-semibold whitespace-nowrap shrink-0">
                  {operatorName}
                </span>
              </div>
            </div>
          )}
          {speed && (
            <div className="flex items-center justify-between py-[13px] border-b border-[#f3f4f6] gap-3">
              <span className="text-sm text-[#374151] shrink-0">{dict.carriers.speed}</span>
              <div className="flex flex-nowrap gap-[5px] flex-1 justify-end overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                <span className="px-2.5 py-1 border border-[#D1D5DB] rounded-md text-[13px] font-semibold whitespace-nowrap shrink-0">
                  {speed}
                </span>
              </div>
            </div>
          )}
          <FeatureRow label={dict.features.hotspot} value={hasHotspot} yesText={dict.features.yes} noText={dict.features.no} />
          <FeatureRow label={dict.features.calls} value={hasCalls} yesText={dict.features.yes} noText={dict.features.no} />
          <FeatureRow label={dict.features.localNumber} value={hasLocalNumber} yesText={dict.features.yes} noText={dict.features.no} />
          <FeatureRow label={dict.features.ekyc} value={hasEkyc} yesText={dict.features.yes} noText={dict.features.no} />
          <FeatureRow label={dict.features.topup} value={hasTopup} yesText={dict.features.yes} noText={dict.features.no} />
      </div>
      )}

      {activeTab === "delivery" && (
        <div className="pt-2">
          <div className="flex items-start justify-between py-[13px] border-b border-[#f3f4f6] gap-3">
            <span className="text-sm text-[#374151]">{dict.delivery.deliveryTime}</span>
            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-[5px] px-3 py-[5px] bg-[#DCFCE7] border-[1.5px] border-[#86EFAC] rounded-[20px] text-[#15803D] text-[13px] font-bold">
                <ClockChip />{dict.delivery.instant}
              </span>
              <span className="text-[13px] text-[#6b7280]">{dict.delivery.instantDesc}</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-[13px] gap-3">
            <span className="text-sm text-[#374151]">{dict.delivery.activationPeriod}</span>
            <span className="text-sm font-bold">{dict.delivery.activationDesc}</span>
          </div>
          {/* Warning note */}
          <div className="flex items-start gap-2.5 mt-2.5 p-3 bg-[#FFFBEB] border-[1.5px] border-[#FDE68A] rounded-lg">
            <WarnIcon />
            <p className="text-sm text-[#92400E] leading-normal">
              <strong className="text-[#78350F]">{dict.note.title}</strong> {dict.note.text}
            </p>
          </div>
        </div>
      )}

      {/* ── Device Compatibility Checker ── */}
      <DeviceChecker dict={dict} lang={lang} />
    </>
  );
}
