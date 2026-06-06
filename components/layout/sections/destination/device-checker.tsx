"use client";

import { useState, useCallback } from "react";
import type { SupportedDevicesResponse } from "@/lib/api";
import type { DestinationDict } from "./types";

interface DeviceCheckerProps {
  dict: DestinationDict;
  lang: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

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

/** Standalone device-compatibility checker block — mirrors the `.dc` block in the HTML reference. */
export function DeviceChecker({ dict, lang }: DeviceCheckerProps) {
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

  const tryQuickLabel = lang === "en" ? "Try:" : "Thử nhanh:";

  return (
    <div className="border border-[#e5e7eb] rounded-2xl overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-1.5">
        <div className="w-8 h-8 rounded-lg bg-[#fff500] flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="2" width="14" height="20" rx="3" stroke="#111" strokeWidth="2" />
            <path d="M12 18h.01" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M9 6h6" stroke="#111" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-sm font-medium tracking-[0.05em] uppercase text-[#111]">
          {dict.deviceCheck.title}
        </span>
      </div>

      <div className="px-4 pb-3.5">
        <p className="text-base sm:text-sm text-[#6b7280] mb-2.5">{dict.deviceCheck.placeholder}</p>
        {/* Search input */}
        <div className="flex gap-2 mb-2.5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={lang === "en" ? "e.g. iPhone 15, Samsung S24, …" : "VD: iPhone 15, Samsung S24, …"}
            className="flex-1 px-4 py-[9px] border-[1.5px] border-[#e5e7eb] rounded-full text-base sm:text-sm text-[#111] placeholder:text-[#9ca3af] outline-none bg-white transition-colors focus:border-[#fff500] font-[inherit]"
          />
          <button
            onClick={handleCheck}
            disabled={isChecking || !query.trim()}
            className="px-5 py-[9px] bg-[#111] text-white text-sm font-medium rounded-full border-none cursor-pointer font-[inherit] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? dict.deviceCheck.checking : dict.deviceCheck.button}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mb-2">
            {result.found ? (
              <div className="flex items-center gap-2.5 px-3 py-[9px] bg-[#f0fdf4] border border-[#bbf7d0] rounded-full">
                <BigCheckIcon />
                <span className="text-base sm:text-sm font-medium text-[#15803d]">
                  {dict.deviceCheck.supported.replace("{device}", result.deviceName)}
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 px-3 py-[9px] bg-[#fef2f2] border border-[#fecaca] rounded-full">
                  <BigXIcon />
                  <span className="text-base sm:text-sm font-medium text-[#991b1b]">
                    {dict.deviceCheck.notSupported.replace("{device}", result.deviceName)}
                  </span>
                </div>
                {result.similarDevices.length > 0 && (
                  <div className="p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-md">
                    <p className="text-sm font-semibold text-[#6b7280] mb-2">
                      {dict.deviceCheck.similarDevices}
                    </p>
                    <div className="flex flex-wrap gap-[5px]">
                      {result.similarDevices.map((d) => (
                        <span
                          key={d}
                          className="text-sm px-2.5 py-[3px] bg-white border border-[#e5e7eb] rounded-[20px] text-[#374151] cursor-pointer hover:bg-[#fef9e7] hover:border-[#F5C518] transition-colors"
                          onClick={() => setQuery(d)}
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
          <span className="text-sm text-[#6b7280]">{tryQuickLabel}</span>
          {["iPhone 15", "Samsung S24", "Pixel 8", "Nokia 6.1"].map((d) => (
            <span
              key={d}
              className="text-sm px-2.5 py-[3px] bg-white border border-[#e5e7eb] rounded-[20px] text-[#374151] cursor-pointer hover:bg-[#fef9e7] hover:border-[#F5C518] transition-colors"
              onClick={() => setQuery(d)}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
