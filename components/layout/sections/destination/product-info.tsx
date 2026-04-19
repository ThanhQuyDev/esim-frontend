"use client";

import { useState } from "react";
import type { Destination } from "@/lib/api";
import type { DestinationDict } from "./types";

interface ProductInfoProps {
  destination: Destination;
  dict: DestinationDict;
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

/* ── Feature row ── */
function FeatureRow({ label, value }: { label: string; value: boolean; yesText: string; noText: string } & { yesText: string; noText: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-[11px] border-b border-[#f3f4f6] last:border-b-0 gap-3">
      <span className="text-sm text-[#4b5563] shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        {value ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600"><CheckIcon />{arguments[0].yesText}</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600"><XIcon />{arguments[0].noText}</span>
        )}
      </div>
    </div>
  );
}

/* ── Info block wrapper ── */
function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#e5e7eb] rounded-[10px] overflow-hidden mb-3 bg-white">
      <div className="px-4 py-2 bg-[#f9fafb] border-b border-[#e5e7eb] flex items-center gap-[7px]">
        <div className="w-[5px] h-[5px] rounded-full bg-[#3DDC97] shrink-0" />
        <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}

export function ProductInfo({ destination, dict }: ProductInfoProps) {
  const [countriesOpen, setCountriesOpen] = useState(false);

  // Mock countries — in production, parse from destination.description or API
  const countries = [
    "🇻🇳 Việt Nam", "🇹🇭 Thái Lan", "🇯🇵 Nhật Bản", "🇰🇷 Hàn Quốc",
    "🇸🇬 Singapore", "🇲🇾 Malaysia", "🇮🇩 Indonesia", "🇵🇭 Philippines",
    "🇮🇳 Ấn Độ", "🇨🇳 Trung Quốc", "🇭🇰 Hong Kong", "🇹🇼 Đài Loan",
    "🇲🇴 Ma Cao", "🇰🇭 Campuchia", "🇱🇦 Lào", "🇲🇲 Myanmar",
    "🇧🇳 Brunei", "🇲🇳 Mông Cổ",
  ];

  return (
    <>
      {/* Country expand row */}
      <button
        onClick={() => setCountriesOpen(!countriesOpen)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-[#e5e7eb] rounded-lg mb-2.5 cursor-pointer hover:border-[#bbb] transition-colors text-left"
      >
        <div className="flex gap-0.5 text-base shrink-0">
          <span>🇯🇵</span><span>🇰🇷</span><span>🇹🇭</span><span>🇻🇳</span>
        </div>
        <span className="text-sm text-[#374151] font-medium flex-1">
          {dict.viewCountries.replace("{count}", String(countries.length))}
        </span>
        <span className="text-[13px] text-[#9ca3af]">{countriesOpen ? "∨" : "›"}</span>
      </button>

      {/* Countries panel */}
      {countriesOpen && (
        <div className="bg-white border border-[#e5e7eb] rounded-lg mb-2.5">
          <div className="p-3.5">
            <div className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2.5">
              {dict.supportedCountries.replace("{count}", String(countries.length))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {countries.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 text-[13px] font-medium px-2.5 py-1 bg-[#f9fafb] border border-[#e5e7eb] rounded-full text-[#374151]">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Carriers */}
      <InfoBlock title={dict.carriers.title}>
        <div className="flex items-center justify-between px-4 py-[11px] gap-3">
          <span className="text-sm text-[#4b5563]">{dict.carriers.domestic}</span>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <span className="text-[13px] font-medium px-2 py-[3px] rounded bg-[#f3f4f6] border border-[#e5e7eb] text-[#1a1a1a] whitespace-nowrap">NTT Docomo 4G/5G</span>
            <span className="text-[13px] font-medium px-2 py-[3px] rounded bg-[#f3f4f6] border border-[#e5e7eb] text-[#1a1a1a] whitespace-nowrap">SK Telecom 4G/5G</span>
            <span className="text-[13px] font-medium px-2 py-[3px] rounded bg-[#f3f4f6] border border-[#e5e7eb] text-[#1a1a1a] whitespace-nowrap">AIS 4G/5G</span>
          </div>
        </div>
      </InfoBlock>

      {/* Features */}
      <InfoBlock title={dict.features.title}>
        <FeatureRow label={dict.features.hotspot} value={true} yesText={dict.features.yes} noText={dict.features.no} />
        <FeatureRow label={dict.features.calls} value={false} yesText={dict.features.yes} noText={dict.features.no} />
        <FeatureRow label={dict.features.localNumber} value={false} yesText={dict.features.yes} noText={dict.features.no} />
        <FeatureRow label={dict.features.ekyc} value={false} yesText={dict.features.yes} noText={dict.features.no} />
        <FeatureRow label={dict.features.topup} value={true} yesText={dict.features.yes} noText={dict.features.no} />
      </InfoBlock>

      {/* Delivery & Activation */}
      <InfoBlock title={dict.delivery.title}>
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
      </InfoBlock>
    </>
  );
}
