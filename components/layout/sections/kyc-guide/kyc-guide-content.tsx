"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  KYC_REGIONS,
  KYC_STEPS,
  type KycRegionKey,
  type KycStep,
} from "./kyc-guide-data";
import { PassportModal, IccidModal } from "./kyc-guide-modals";

const REGION_KEYS: KycRegionKey[] = ["hk", "tw", "hkmo"];

/* ── Inline SVG icons ── */
const IconWarnYellow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconWarnBig = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconInfoBlue = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconCheckGreen = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconCheckRed = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconXRed = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconDoneCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconExternal = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const IconChat = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconBag = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h12l2 5H4L6 2z" />
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M12 11v6M9 14h6" />
  </svg>
);
const IconPassportSec = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <circle cx="12" cy="9" r="3" />
    <path d="M6 16h12M6 19h8" />
  </svg>
);
const IconPhoneSec = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M12 18h.01M9 6h6M9 10h6" />
  </svg>
);
const IconStepsSec = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);
const IconCamSec = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const IconBanSec = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

/* ── Section card ── */
function SectionCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-white rounded-2xl px-7 py-6 mb-5 max-[640px]:px-3.5 max-[640px]:py-4 max-[640px]:mb-3"
      style={{ border: "1.5px solid #E5E7EB" }}
    >
      <div className="flex items-center gap-3 mb-5 max-[640px]:gap-2.5 max-[640px]:mb-3.5">
        <div className="w-[38px] h-[38px] max-[640px]:w-8 max-[640px]:h-8 bg-[#FEE2E2] rounded-[10px] max-[640px]:rounded-[9px] flex items-center justify-center shrink-0">{icon}</div>
        <div className="text-lg font-extrabold max-[640px]:text-base max-[640px]:font-bold">{label}</div>
        <div className="flex-1 h-px bg-[#E5E7EB]" />
      </div>
      {children}
    </div>
  );
}

/* ── Illustration block ── */
function Illustration({ svg, caption }: { svg: string; caption: string }) {
  return (
    <div className="rounded-[14px] max-[640px]:rounded-xl overflow-hidden bg-[#F3F4F6] mt-3 max-[640px]:mt-2" style={{ border: "1.5px solid #E5E7EB" }}>
      <div className="block w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      <div
        className="text-xs max-[640px]:text-[13px] text-[#6B7280] text-center px-3 max-[640px]:px-2.5 py-2 max-[640px]:py-1.5 bg-white font-medium leading-[1.4]"
        style={{ borderTop: "1px solid #E5E7EB" }}
      >
        {caption}
      </div>
    </div>
  );
}

function StepItem({ step, index, isLast }: { step: KycStep; index: number; isLast: boolean }) {
  const hintClass =
    step.hc === "warn"
      ? "bg-[#FFFBEB] text-[#92400E]"
      : step.hc === "info"
      ? "bg-[#EFF6FF] text-[#1D4ED8]"
      : "";
  const hintBorder =
    step.hc === "warn"
      ? "1.5px solid #FDE68A"
      : step.hc === "info"
      ? "1.5px solid #BFDBFE"
      : "0";

  return (
    <div className={`flex gap-5 max-[640px]:gap-3 ${isLast ? "mb-0" : "mb-[30px] max-[640px]:mb-6"}`}>
      <div className="flex flex-col items-center shrink-0">
        <div className="w-9 h-9 max-[640px]:w-[30px] max-[640px]:h-[30px] rounded-full bg-[#DC2626] text-white text-base max-[640px]:text-[.875rem] font-bold flex items-center justify-center">
          {index + 1}
        </div>
        {!isLast && (
          <div
            className="w-0.5 flex-1 mt-1.5 max-[640px]:mt-[5px] min-h-[20px] max-[640px]:min-h-[18px]"
            style={{ background: "linear-gradient(to bottom, #FECACA, transparent)" }}
          />
        )}
      </div>
      <div className="flex-1 pt-1 max-[640px]:pt-[3px] min-w-0">
        <div className="text-base max-[640px]:text-[14.5px] font-bold mb-[5px] max-[640px]:leading-[1.3]">{step.t}</div>
        <div
          className="text-base max-[640px]:text-[.875rem] text-[#4B5563] leading-[1.75] mb-2"
          dangerouslySetInnerHTML={{ __html: step.d }}
        />
        {step.h && step.hc && (
          <div
            className={[
              // Desktop: pill chip
              "inline-flex max-[640px]:flex items-center gap-2 max-[640px]:gap-[9px]",
              "px-4 py-1.5 max-[640px]:px-[13px] max-[640px]:py-2.5",
              "rounded-full max-[640px]:rounded-[9px]",
              "text-[13px] max-[640px]:text-[12.5px] font-semibold",
              "mb-2.5 max-[640px]:mb-2.5 leading-[1.5]",
              hintClass,
            ].join(" ")}
            style={{ border: hintBorder }}
          >
            {step.hc === "warn" ? <IconWarnBig /> : <IconInfoBlue />}
            <span>{step.h}</span>
          </div>
        )}
        {step.illustration.kind === "single" && (
          <Illustration svg={step.illustration.svg} caption={step.illustration.caption} />
        )}
        {step.illustration.kind === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-[640px]:gap-2.5 mt-3 max-[640px]:mt-2">
            {step.illustration.items.map((item) => (
              <div
                key={item.caption}
                className="rounded-[14px] max-[640px]:rounded-xl overflow-hidden bg-[#F3F4F6]"
                style={{ border: "1.5px solid #E5E7EB" }}
              >
                <div className="block w-full" dangerouslySetInnerHTML={{ __html: item.svg }} />
                <div
                  className="text-xs max-[640px]:text-[13px] text-[#6B7280] text-center px-3 max-[640px]:px-2.5 py-2 max-[640px]:py-1.5 bg-white font-medium leading-[1.4]"
                  style={{ borderTop: "1px solid #E5E7EB" }}
                >
                  {item.caption}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface KycGuideContentProps {
  initialRegion?: KycRegionKey;
}

/**
 * Full eKYC registration guide page — copies the HTML reference 1:1 with three
 * tabs (HK / TW / HK+Macau) sharing the same step illustrations but distinct
 * notes, tips, and invalid-document lists per region.
 */
export function KycGuideContent({ initialRegion = "hk" }: KycGuideContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeKey, setActiveKey] = useState<KycRegionKey>(initialRegion);
  const [passportOpen, setPassportOpen] = useState(false);
  const [iccidOpen, setIccidOpen] = useState(false);

  // Sync from ?region=... so deep links update the active tab
  useEffect(() => {
    const r = searchParams?.get("region");
    if (r && (REGION_KEYS as string[]).includes(r)) {
      setActiveKey(r as KycRegionKey);
    }
  }, [searchParams]);

  const data = KYC_REGIONS[activeKey];

  const handleTabClick = (k: KycRegionKey) => {
    setActiveKey(k);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Reflect choice in URL without full reload
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("region", k);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-[#F1F5F9] min-h-screen text-[#0F172A] overflow-clip max-[640px]:text-base" style={{ fontFamily: "'Google Sans', system-ui, sans-serif" }}>
      {/* Sticky tabs */}
      <div
        className="bg-white px-12 max-[640px]:px-2 sticky top-0 z-20 overflow-x-auto"
        style={{ borderBottom: "1.5px solid #E5E7EB", scrollbarWidth: "none" }}
      >
        <div className="flex w-full max-w-[832px] mx-auto">
          <div className="flex items-center max-[640px]:gap-0.5">
          {REGION_KEYS.map((k) => {
            const r = KYC_REGIONS[k];
            const active = k === activeKey;
            return (
              <button
                key={k}
                type="button"
                onClick={() => handleTabClick(k)}
                className={`px-[22px] py-3.5 max-[640px]:px-3.5 max-[640px]:py-2.5 text-sm max-[640px]:text-[.875rem] font-semibold cursor-pointer bg-none whitespace-nowrap flex items-center gap-1.5 transition-colors -mb-[1.5px] shrink-0 max-[640px]:min-h-[44px] ${
                  active ? "text-[#DC2626]" : "text-[#6B7280] hover:text-[#374151]"
                }`}
                style={{
                  border: "none",
                  background: "none",
                  borderBottom: active ? "2.5px solid #DC2626" : "2.5px solid transparent",
                }}
              >
                <img src={r.flag} alt={r.name} className="w-5 h-5 rounded-full object-cover" />
                {r.tabLabel}
              </button>
            );
          })}
          </div>
        </div>
      </div>

      {/* Body — reference uses max-w 420px on mobile */}
      <div
        key={activeKey}
        className="max-w-[880px] mx-auto px-6 pt-8 pb-16 max-[640px]:max-w-[420px] max-[640px]:px-3.5 max-[640px]:pt-3.5 max-[640px]:pb-[110px]"
        style={{ animation: "kycFadeIn 0.22s ease" }}
      >
        {/* Hero */}
        <div
          className="rounded-[20px] max-[640px]:rounded-[18px] px-9 pt-7 pb-[26px] mb-6 max-[640px]:px-4 max-[640px]:pt-[18px] max-[640px]:pb-4 max-[640px]:mb-3.5 relative overflow-hidden"
          style={{ background: "linear-gradient(130deg, #B91C1C, #7F1D1D)" }}
        >
          <div
            className="absolute pointer-events-none"
            style={{
              top: "-50px",
              right: "-30px",
              width: "200px",
              height: "200px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "50%",
            }}
          />
          <div className="flex items-start gap-[18px] mb-5 max-[640px]:gap-3 max-[640px]:mb-3.5 relative">
            <div className="shrink-0"><img src={data.flag} alt={data.name} className="w-12 h-12 max-[640px]:w-9 max-[640px]:h-9 rounded-full object-cover" /></div>
            <div>
              <div className="text-[26px] max-[640px]:text-[19px] font-extrabold text-white mb-2 max-[640px]:mb-[7px] leading-[1.2]">{data.name}</div>
              <span
                className="inline-flex items-center gap-1.5 px-[13px] py-[5px] rounded-full text-xs font-bold text-white"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Xác thực danh tính bắt buộc
              </span>
            </div>
          </div>
          <div
            className="grid grid-cols-3 rounded-[14px] overflow-hidden"
            style={{ background: "rgba(0,0,0,0.26)" }}
          >
            {[
              { v: "3′", l: "Thời gian hoàn tất" },
              { v: "100%", l: "An toàn bảo mật" },
              { v: "24/7", l: "Hỗ trợ trực tuyến" },
            ].map((s, i) => (
              <div
                key={s.l}
                className="text-center py-[14px] max-[640px]:py-2.5 max-[640px]:px-1"
                style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none" }}
              >
                <div className="text-[21px] max-[640px]:text-[17px] font-extrabold text-white leading-none">{s.v}</div>
                <div className="text-[13px] max-[640px]:text-[12px] mt-[3px] leading-[1.3]" style={{ color: "rgba(255,255,255,0.7)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notice card */}
        <div className="bg-white rounded-2xl px-7 py-6 mb-5 max-[640px]:px-3.5 max-[640px]:py-4 max-[640px]:mb-3" style={{ border: "1.5px solid #E5E7EB" }}>
          <div
            className="flex items-start gap-3 max-[640px]:gap-[9px] px-[18px] py-3.5 max-[640px]:px-[13px] max-[640px]:py-[11px] text-base max-[640px]:text-[.875rem] font-semibold text-[#78350F] leading-[1.7] max-[640px]:leading-[1.65] mb-4 max-[640px]:mb-3.5"
            style={{
              background: "#FFFBEB",
              borderLeft: "4px solid #F59E0B",
              borderRadius: "0 12px 12px 0",
            }}
          >
            <IconWarnYellow />
            <b>Lưu ý quan trọng trước khi đăng ký</b>
          </div>
          <div className="flex flex-col gap-2.5 mb-4 max-[640px]:gap-[9px] max-[640px]:mb-3.5">
            {data.notes.map((n, i) => (
              <div key={i} className="flex items-start gap-2.5 max-[640px]:gap-[9px] text-base max-[640px]:text-[.875rem] text-[#374151] leading-[1.65]">
                <div className="w-5 h-5 max-[640px]:w-[18px] max-[640px]:h-[18px] rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0 mt-[2px]">
                  <IconCheckRed />
                </div>
                <span dangerouslySetInnerHTML={{ __html: n }} />
              </div>
            ))}
          </div>
          <div className="h-px bg-[#E5E7EB] mb-4 max-[640px]:mb-3.5" />
          {/* Desktop: inline CTA. Mobile: text only — primary CTA lives in the sticky bottom bar. */}
          <div className="flex items-center justify-between gap-6 max-[640px]:gap-0">
            <div className="text-base max-[640px]:text-[12.5px] text-[#6B7280] leading-[1.6]">
              Đã đọc và hiểu các lưu ý? <b className="text-[#374151]">Hoàn tất trong khoảng 3 phút.</b>{" "}
              <span className="max-[640px]:hidden">Bấm nút để bắt đầu đăng ký.</span>
              <span className="hidden max-[640px]:inline">Bấm nút bên dưới để bắt đầu.</span>
            </div>
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#DC2626] text-white rounded-full text-base font-bold whitespace-nowrap no-underline transition-opacity hover:opacity-90 max-[640px]:hidden"
              style={{ border: "none" }}
            >
              Đăng ký xác thực ngay
              <IconExternal />
            </a>
          </div>
        </div>

        {/* Prep section — desktop: side-by-side; mobile: stacked with chevron */}
        <SectionCard icon={<IconBag />} label="Chuẩn bị trước khi bắt đầu">
          <div className="flex gap-3.5 max-[640px]:flex-col max-[640px]:gap-2.5">
            <button
              type="button"
              onClick={() => setPassportOpen(true)}
              className="flex items-center justify-center max-[640px]:justify-start gap-3 max-[640px]:gap-[11px] px-[22px] max-[640px]:pl-2.5 max-[640px]:pr-3.5 py-[11px] max-[640px]:py-2.5 max-[640px]:min-h-[52px] rounded-full bg-[#FFF1F2] cursor-pointer flex-1 transition-all hover:-translate-y-px hover:shadow-[0_3px_14px_rgba(220,38,38,0.13)] max-[640px]:hover:transform-none active:bg-[#FFE4E6] text-left"
              style={{ border: "1.5px solid #FECACA" }}
            >
              <span className="w-8 h-8 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
                <IconPassportSec />
              </span>
              <span className="text-base max-[640px]:text-[.875rem] font-bold text-[#9F1239] max-[640px]:flex-1 max-[640px]:leading-[1.3]">Hộ chiếu còn hiệu lực</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FECACA" strokeWidth="2.5" strokeLinecap="round" className="hidden max-[640px]:block shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIccidOpen(true)}
              className="flex items-center justify-center max-[640px]:justify-start gap-3 max-[640px]:gap-[11px] px-[22px] max-[640px]:pl-2.5 max-[640px]:pr-3.5 py-[11px] max-[640px]:py-2.5 max-[640px]:min-h-[52px] rounded-full bg-[#FFF1F2] cursor-pointer flex-1 transition-all hover:-translate-y-px hover:shadow-[0_3px_14px_rgba(220,38,38,0.13)] max-[640px]:hover:transform-none active:bg-[#FFE4E6] text-left"
              style={{ border: "1.5px solid #FECACA" }}
            >
              <span className="w-8 h-8 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
                <IconPhoneSec />
              </span>
              <span className="text-base max-[640px]:text-[.875rem] font-bold text-[#9F1239] max-[640px]:flex-1 max-[640px]:leading-[1.3]">Mã ICCID của eSIM (19–20 số)</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FECACA" strokeWidth="2.5" strokeLinecap="round" className="hidden max-[640px]:block shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </SectionCard>

        {/* Steps */}
        <SectionCard icon={<IconStepsSec />} label="Hướng dẫn từng bước">
          {KYC_STEPS.map((s, i) => (
            <StepItem key={s.t} step={s} index={i} isLast={i === KYC_STEPS.length - 1} />
          ))}
        </SectionCard>

        {/* Tips */}
        <SectionCard icon={<IconCamSec />} label="Lưu ý khi chụp ảnh hộ chiếu">
          <div className="flex flex-col gap-3 pl-2 max-[640px]:pl-1.5">
            {data.tips.map((t, i) => (
              <div key={i} className="flex items-center gap-3 max-[640px]:gap-[11px] text-base max-[640px]:text-[.875rem] leading-[1.65]">
                <div className="w-5 h-5 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                  <IconCheckGreen />
                </div>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Invalid */}
        <SectionCard icon={<IconBanSec />} label="Giấy tờ không được chấp nhận">
          <div className="flex flex-col gap-3 pl-2 max-[640px]:pl-1.5">
            {data.invalid.map((v, i) => (
              <div key={i} className="flex items-center gap-3 max-[640px]:gap-[11px] text-base max-[640px]:text-[.875rem] text-[#991B1B] leading-[1.65]">
                <div className="w-5 h-5 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
                  <IconXRed />
                </div>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Done card */}
        <div
          className="rounded-2xl px-6 py-5 mb-5 max-[640px]:px-4 max-[640px]:py-[18px] max-[640px]:mb-3 flex items-start gap-3.5 max-[640px]:gap-[13px]"
          style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}
        >
          <div className="w-10 h-10 max-[640px]:w-9 max-[640px]:h-9 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0">
            <IconDoneCheck />
          </div>
          <div>
            <div className="text-base max-[640px]:text-base font-extrabold max-[640px]:font-bold text-[#14532D] mb-[5px]">Hoàn tất! 🎉</div>
            <div
              className="text-base max-[640px]:text-[.875rem] text-[#166534] leading-[1.75] max-[640px]:leading-[1.7]"
              dangerouslySetInnerHTML={{ __html: data.done }}
            />
          </div>
        </div>

        {/* CTA card — hidden on mobile (replaced by sticky bar) */}
        <div
          className="flex items-center gap-[22px] px-[26px] py-[22px] rounded-[18px] mb-[18px] max-[640px]:hidden"
          style={{
            background: "linear-gradient(135deg, #FFF1F2, #FFF7ED)",
            border: "1.5px solid #FECDD3",
          }}
        >
          <div className="flex-1">
            <div className="text-base font-extrabold text-[#7F1D1D] mb-[5px]">
              Bạn đã sẵn sàng? Tiến hành xác thực ngay!
            </div>
            <div className="text-sm text-[#991B1B] leading-[1.55]">
              Bấm vào nút bên cạnh để truy cập trang đăng ký chính thức của nhà mạng CMLink.
            </div>
          </div>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#DC2626] text-white rounded-full text-base font-bold whitespace-nowrap no-underline transition-opacity hover:opacity-90"
            style={{ border: "none" }}
          >
            Đăng ký ngay
            <IconExternal />
          </a>
        </div>

        {/* Support */}
        <div
          className="flex items-center justify-center gap-6 p-4 max-[640px]:gap-5 max-[640px]:px-4 max-[640px]:py-[14px] max-[640px]:mt-1 text-sm max-[640px]:text-[.875rem] text-[#6B7280]"
          style={{ borderTop: "1.5px solid #E5E7EB" }}
        >
          <span className="max-[640px]:hidden">Cần hỗ trợ?</span>
          <a href="#" className="inline-flex items-center gap-1.5 text-[#374151] font-semibold no-underline transition-colors hover:text-[#DC2626] max-[640px]:min-h-[44px]">
            <IconChat /> Chat hỗ trợ
          </a>
          <span className="text-[#E5E7EB]">|</span>
          <a
            href="mailto:hotro@esim.com.vn"
            className="inline-flex items-center gap-1.5 text-[#374151] font-semibold no-underline transition-colors hover:text-[#DC2626] max-[640px]:min-h-[44px]"
          >
            <IconMail />
            <span className="max-[640px]:hidden">hotro@esim.com.vn</span>
            <span className="hidden max-[640px]:inline">Email hỗ trợ</span>
          </a>
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      <div
        className="hidden max-[640px]:block fixed bottom-0 left-0 right-0 z-40 bg-white px-3.5 pt-2.5"
        style={{
          borderTop: "1.5px solid #E5E7EB",
          boxShadow: "0 -6px 20px rgba(0,0,0,0.08)",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 h-[50px] bg-[#DC2626] text-white rounded-full text-sm font-bold no-underline w-full active:opacity-80"
        >
          Đăng ký xác thực ngay
          <IconExternal />
        </a>
      </div>

      {/* Modals */}
      <PassportModal open={passportOpen} onClose={() => setPassportOpen(false)} />
      <IccidModal open={iccidOpen} onClose={() => setIccidOpen(false)} />

      <style jsx>{`
        @keyframes kycFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
