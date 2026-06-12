"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Destination, Region } from "@/lib/api";
import { Modal } from "./modal";
import type { DestinationDict } from "./types";
import Image from "next/image";

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

/**
 * Normalise a string for search: lowercase + strip diacritics.
 * "Việt Nam" → "viet nam", "Thái Lan" → "thai lan".
 */
function normalise(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset search & auto-focus whenever the modal opens
  useEffect(() => {
    if (open) {
      setQuery("");
      // Defer focus so the portal content is mounted first
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);


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

  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = normalise(query);
    if (!query.trim()) return rows;
    // Match on country name only. The carrier (defaultCarrier) is identical for
    // every row and isn't displayed, so including it caused false "show all"
    // matches — e.g. searching "nor" matches the carrier "Telenor" on every row.
    return rows.filter((r) => normalise(r.name).includes(q));
  }, [rows, query]);

  // Scroll list back to top whenever the filter changes
  useEffect(() => {
    listRef.current?.scrollTo(0, 0);
  }, [filtered]);

  const total = rows.length;
  const titleVi = "Quốc gia & Nhà mạng";
  const titleEn = "Countries & Carriers";
  const subVi = `${total} điểm đến được hỗ trợ`;
  const subEn = `${total} supported destinations`;
  const placeholder = lang === "vi" ? "Tìm quốc gia hoặc nhà mạng…" : "Search country or carrier…";
  const emptyText = lang === "vi" ? "Không tìm thấy kết quả phù hợp." : "No matching results.";

  return (
    <Modal open={open} onClose={onClose} ariaLabel={lang === "vi" ? titleVi : titleEn}>
      <div
        className="bg-white rounded-t-[20px] sm:rounded-[20px] flex flex-col overflow-hidden w-full animate-slide-up"
        style={{
          width: "min(560px, calc(100vw))",
          height: "min(620px, calc(100vh - 180px))",
          boxShadow: "0 28px 80px rgba(0,0,0,0.22)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className=" pt-7 shrink-0">
          <div className="px-7 flex items-start justify-between mb-[18px] gap-3">
            <div>
              <div className="flex items-center gap-3">
              {region?.iconUrl && <Image src={region?.iconUrl} alt={region.name} width={40} height={40}/>}
              <h3 className="text-base font-extrabold tracking-[-0.4px] text-[#111] mb-[3px]">
                {lang === "vi" ? titleVi : titleEn}
              </h3>
              </div>
              <p className="text-sm text-[#6B7280]">{lang === "vi" ? subVi : subEn}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9  border-[#E5E7EB] rounded-full bg-[#F9FAFB] cursor-pointer flex items-center justify-center text-[#374151] transition-colors hover:bg-[#1a1a1a] hover:border-[#1a1a1a] hover:text-white shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2.5 px-3.5 h-12 border-b mb-4 transition-colors focus-within:bg-white focus-within:border-[#1a1a1a]">
            <span className="flex items-center text-[#9ca3af] shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              ref={inputRef}
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
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
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
                className="flex items-center gap-3.5 px-3.5 py-3 border-b-[0.5px] transition-colors hover:bg-[#F9FAFB]"
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
                  <div className="text-base font-bold text-[#111] leading-tight">{row.name}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
