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
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <circle cx="5.5" cy="5.5" r="4.5" stroke="#15803d" strokeWidth="1.1" />
    <path d="M5.5 3.5v2.2l1.2 1" stroke="#15803d" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);
const WarnIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-px">
    <path d="M2 11.5L7 2l5 9.5H2z" stroke="#d97706" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M7 6.5v2.5M7 9.5v.4" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
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
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
    <circle cx="7" cy="7" r="5" stroke="#9ca3af" strokeWidth="1.5" />
    <path d="M11 11l3 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/* ── Feature row ── */
function FeatureRow({ label, value, yesText, noText }: { label: string; value: boolean; yesText: string; noText: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-[11px] border-b border-[#f3f4f6] last:border-b-0 gap-3">
      <span className="text-sm text-[#4b5563] shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        {value ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600"><CheckIcon />{yesText}</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600"><XIcon />{noText}</span>
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
    <div className="border border-[#e5e7eb] rounded-[10px] overflow-hidden bg-white mt-3">
      <div className="px-4 py-2.5 bg-[#f9fafb] border-b border-[#e5e7eb] flex items-center gap-[7px]">
        <div className="w-[5px] h-[5px] rounded-full bg-[#3DDC97] shrink-0" />
        <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
          {dict.deviceCheck.title}
        </span>
      </div>

      <div className="p-4">
        {/* Search input */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 border border-[#e5e7eb] rounded-sm px-3 py-2 bg-white focus-within:border-[#3DDC97] focus-within:ring-1 focus-within:ring-[#3DDC97]/30 transition-colors">
            <SearchIcon />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={dict.deviceCheck.placeholder}
              className="flex-1 text-sm text-[#1a1a1a] placeholder:text-[#9ca3af] outline-none bg-transparent"
            />
          </div>
          <button
            onClick={handleCheck}
            disabled={isChecking || !query.trim()}
            className="px-4 py-2 bg-[#3DDC97] text-white text-sm font-semibold rounded-sm hover:bg-[#2bc882] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {isChecking ? dict.deviceCheck.checking : dict.deviceCheck.button}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-3">
            {result.found ? (
              <div className="flex items-center gap-2.5 p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-sm">
                <BigCheckIcon />
                <span className="text-sm font-medium text-[#15803d]">
                  {dict.deviceCheck.supported.replace("{device}", result.deviceName)}
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-3 bg-[#fef2f2] border border-[#fecaca] rounded-sm">
                  <BigXIcon />
                  <span className="text-sm font-medium text-[#dc2626]">
                    {dict.deviceCheck.notSupported.replace("{device}", result.deviceName)}
                  </span>
                </div>
                {result.similarDevices.length > 0 && (
                  <div className="p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-sm">
                    <p className="text-xs font-semibold text-[#6b7280] mb-2">
                      {dict.deviceCheck.similarDevices}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.similarDevices.map((d) => (
                        <span
                          key={d}
                          className="text-[13px] px-2.5 py-1 bg-white border border-[#e5e7eb] rounded-full text-[#374151] cursor-pointer hover:border-[#3DDC97] transition-colors"
                          onClick={() => {
                            setQuery(d);
                            // Auto-check with this device
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

        {/* View all link */}
        <a
          href={`/${lang}/esim-supported-devices`}
          className="inline-block mt-3 text-[13px] font-medium text-[#3DDC97] hover:text-[#2bc882] transition-colors"
        >
          {dict.deviceCheck.viewAll}
        </a>
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

  return (
    <>
      {/* Country expand row — only for region pages */}
      {isRegion && (
        <>
          <button
            onClick={() => setCountriesOpen(!countriesOpen)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-[#e5e7eb] rounded-lg mb-2.5 cursor-pointer hover:border-[#bbb] transition-colors text-left"
          >
            <div className="flex gap-0.5 text-base shrink-0">
              {regionDestinations.slice(0, 4).map((d) =>
                d.flagUrl ? (
                  <img key={d.id} src={d.flagUrl} alt={d.name} className="w-5 h-5 rounded-sm object-cover" />
                ) : (
                  <span key={d.id}>🌐</span>
                )
              )}
              {regionDestinations.length === 0 && <span>🌐</span>}
            </div>
            <span className="text-sm text-[#374151] font-medium flex-1">
              {dict.viewCountries.replace("{count}", String(regionDestinations.length || region?.destinationCount || 0))}
            </span>
            <span className="text-[13px] text-[#9ca3af]">{countriesOpen ? "∨" : "›"}</span>
          </button>

          {countriesOpen && regionDestinations.length > 0 && (
            <div className="bg-white border border-[#e5e7eb] rounded-md mb-2.5">
              <div className="p-3.5">
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
            </div>
          )}
        </>
      )}

      {/* ── Tab bar ── */}
      <div className="flex border-b border-[#e5e7eb] mb-3">
        <button
          onClick={() => setActiveTab("features")}
          className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors relative ${
            activeTab === "features"
              ? "text-[#3DDC97]"
              : "text-[#6b7280] hover:text-[#374151]"
          }`}
        >
          {dict.tabs.features}
          {activeTab === "features" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3DDC97] rounded-t" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("delivery")}
          className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors relative ${
            activeTab === "delivery"
              ? "text-[#3DDC97]"
              : "text-[#6b7280] hover:text-[#374151]"
          }`}
        >
          {dict.tabs.delivery}
          {activeTab === "delivery" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3DDC97] rounded-t" />
          )}
        </button>
      </div>

      {/* ── Tab content ── */}
      {activeTab === "features" && (
        <div className="border border-[#e5e7eb] rounded-[10px] overflow-hidden mb-3 bg-white">
          {/* Carriers row — merged into Features */}
          {operatorName && (
            <div className="flex items-center justify-between px-4 py-[11px] border-b border-[#f3f4f6] gap-3">
              <span className="text-sm text-[#4b5563]">{dict.carriers.domestic}</span>
              <div className="flex items-center gap-1 flex-wrap justify-end">
                <span className="text-[13px] font-medium px-2 py-[3px] rounded bg-[#f3f4f6] border border-[#e5e7eb] text-[#1a1a1a] whitespace-nowrap">
                  {operatorName}
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
        <div className="border border-[#e5e7eb] rounded-[10px] overflow-hidden mb-3 bg-white">
          <div className="flex items-center justify-between px-4 py-[11px] border-b border-[#f3f4f6] gap-3">
            <span className="text-sm text-[#4b5563]">{dict.delivery.deliveryTime}</span>
            <div className="flex flex-col items-end gap-0.5">
              <span className="inline-flex items-center gap-1 bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] rounded-[5px] px-2 py-[3px] text-[13px] font-semibold">
                <ClockChip />{dict.delivery.instant}
              </span>
              <span className="text-xs text-[#9ca3af]">{dict.delivery.instantDesc}</span>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-[11px] gap-3">
            <span className="text-sm text-[#4b5563]">{dict.delivery.activationPeriod}</span>
            <span className="text-sm font-semibold text-[#1a1a1a]">{dict.delivery.activationDesc}</span>
          </div>
          {/* Warning note */}
          <div className="bg-[#fffbeb] border-t border-[#fde68a] px-4 py-2.5 flex gap-2 items-start">
            <WarnIcon />
            <div className="text-[13px] text-[#78350f] leading-relaxed">
              <strong className="font-semibold text-[#92400e]">{dict.note.title}</strong> {dict.note.text}
            </div>
          </div>
        </div>
      )}

      {/* ── Device Compatibility Checker ── */}
      <DeviceChecker dict={dict} lang={lang} />
    </>
  );
}
