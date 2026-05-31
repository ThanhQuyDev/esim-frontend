"use client";

import { useMemo, useState } from "react";
import type { Destination, Region } from "@/lib/api";
import { Modal } from "./modal";
import type { DestinationDict } from "./types";

interface CountriesModalProps {
  open: boolean;
  onClose: () => void;
  region?: Region | null;
  /** Single destination — when present and no region, modal shows just that one country. */
  destination?: Destination | null;
  /** Operator name to display next to each country when region.destinations is present. */
  defaultCarrier?: string;
  dict: DestinationDict;
  lang: string;
}

interface CountryRow {
  /** Country flag URL when available — preferred over the emoji fallback. */
  flagUrl?: string | null;
  /** Emoji flag fallback derived from the country code. */
  flag: string;
  name: string;
  carrier: string;
}

function flagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/** Modal listing all countries / carriers covered by a region or destination plan. */
export function CountriesModal({
  open,
  onClose,
  region,
  destination,
  defaultCarrier = "",
  dict,
  lang,
}: CountriesModalProps) {
  const [query, setQuery] = useState("");

  const rows: CountryRow[] = useMemo(() => {
    if (region?.destinations && region.destinations.length > 0) {
      return region.destinations.map((d) => ({
        flagUrl: d.flagUrl,
        flag: flagEmoji(d.countryCode),
        name: d.name,
        carrier: defaultCarrier || "",
      }));
    }
    if (destination) {
      return [
        {
          flagUrl: destination.flagUrl,
          flag: flagEmoji(destination.countryCode),
          name: destination.name,
          carrier: defaultCarrier || "",
        },
      ];
    }
    return [];
  }, [region, destination, defaultCarrier]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.carrier.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const total = rows.length;
  const titleVi = "🌏 Quốc gia & Nhà mạng";
  const titleEn = "🌏 Countries & Carriers";
  const subVi = `${total} điểm đến được hỗ trợ`;
  const subEn = `${total} supported destinations`;
  const placeholder = lang === "vi" ? "Tìm quốc gia hoặc nhà mạng…" : "Search country or carrier…";
  const emptyText = lang === "vi" ? "Không tìm thấy kết quả phù hợp." : "No matching results.";

  return (
    <Modal open={open} onClose={onClose} ariaLabel={lang === "vi" ? titleVi : titleEn}>
      <div
        className="bg-white rounded-[20px] flex flex-col overflow-hidden"
        style={{
          width: "min(560px, calc(100vw - 32px))",
          height: "min(620px, calc(100vh - 32px))",
          boxShadow: "0 28px 80px rgba(0,0,0,0.22)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 pt-7 shrink-0">
          <div className="flex items-start justify-between mb-[18px] gap-3">
            <div>
              <h3 className="text-xl font-extrabold tracking-[-0.4px] text-[#111] mb-[3px]">
                {lang === "vi" ? titleVi : titleEn}
              </h3>
              <p className="text-[13px] text-[#6B7280]">{lang === "vi" ? subVi : subEn}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 border-[1.5px] border-[#E5E7EB] rounded-full bg-[#F9FAFB] cursor-pointer flex items-center justify-center text-[#374151] transition-colors hover:bg-[#1a1a1a] hover:border-[#1a1a1a] hover:text-white shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2.5 px-3.5 h-12 rounded-full bg-[#F9FAFB] mb-4 border border-transparent transition-colors focus-within:bg-white focus-within:border-[#1a1a1a]">
            <span className="flex items-center text-[#9ca3af] shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 border-none bg-transparent text-sm font-[inherit] text-[#111] outline-none placeholder:text-[#B0B7C3]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear"
                className="w-6 h-6 border-none rounded-full bg-[#E5E7EB] cursor-pointer flex items-center justify-center text-[#6B7280] p-0 transition-colors hover:bg-[#d1d5db] shrink-0"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
          {filtered.length === 0 ? (
            <div className="py-12 px-7 text-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" className="mx-auto">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-sm text-[#6B7280] mt-2.5">{emptyText}</p>
            </div>
          ) : (
            filtered.map((row, i) => (
              <div
                key={`${row.name}-${i}`}
                className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-colors hover:bg-[#F9FAFB]"
              >
                {row.flagUrl ? (
                  <img
                    src={row.flagUrl}
                    alt={row.name}
                    loading="lazy"
                    className="w-[34px] h-6 rounded-[3px] object-cover shrink-0"
                  />
                ) : (
                  <span className="text-2xl w-[34px] text-center leading-none shrink-0">{row.flag}</span>
                )}
                <div>
                  <div className="text-[15px] font-bold text-[#111] leading-tight">{row.name}</div>
                  </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
