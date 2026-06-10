"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import type { KycRegionKey } from "@/components/layout/sections/kyc-guide";

interface EkycModalProps {
  open: boolean;
  onClose: () => void;
  lang: string;
}

interface EkycCountry {
  flag: string;
  name: string;
  /** KYC guide region key — drives the `?region=` deep link. */
  region: KycRegionKey;
}

interface FaqItem {
  q: string;
  a: string;
}

const COUNTRIES: EkycCountry[] = [
  { flag: "https://cdn-revamp.airalo.com/images/e6694469-0a21-4019-9c14-8a4702a405ba.png", name: "Hong Kong", region: "hk" },
  { flag: "https://cdn-revamp.airalo.com/images/5592454e-3d9a-40bc-aa0c-97895974ba34.png", name: "Taiwan", region: "tw" },
  { flag: "https://cdn-revamp.airalo.com/images/cb8614ac-fd38-4ed4-9462-808eefe9858a.png", name: "Macau", region: "hkmo" },
];

const COUNTRIES_EN: EkycCountry[] = [
  { flag: "https://cdn-revamp.airalo.com/images/e6694469-0a21-4019-9c14-8a4702a405ba.png", name: "Hong Kong", region: "hk" },
  { flag: "https://cdn-revamp.airalo.com/images/5592454e-3d9a-40bc-aa0c-97895974ba34.png", name: "Taiwan", region: "tw" },
  { flag: "https://cdn-revamp.airalo.com/images/cb8614ac-fd38-4ed4-9462-808eefe9858a.png", name: "Macau", region: "hkmo" },
];

const FAQ_VI: FaqItem[] = [
  {
    q: "Thông tin của tôi có được bảo mật không?",
    a: "Hoàn toàn. Dữ liệu được mã hóa đầu cuối và chỉ dùng để đáp ứng yêu cầu pháp lý. esim.vn không lưu trữ hay chia sẻ thông tin với bên thứ ba.",
  },
  {
    q: "Tôi có thể dùng Hộ chiếu nước ngoài không?",
    a: "Có. Hệ thống chấp nhận Hộ chiếu quốc tế còn hiệu lực. Chỉ cần chụp trang thông tin cá nhân rõ nét, đủ ánh sáng.",
  },
  {
    q: "Nếu xác thực thất bại, tôi phải làm gì?",
    a: "Bạn có thể thử lại tối đa 3 lần. Nếu vẫn thất bại, liên hệ hỗ trợ 24/7 qua chat trong ứng dụng hoặc email hotro@esim.com.vn.",
  },
  {
    q: "Xác thực mất bao lâu để được duyệt?",
    a: "Thông thường hệ thống xử lý trong vài phút. Sau khi được duyệt, bạn sẽ nhận thông báo qua Email hoặc SMS và sử dụng eSIM ngay.",
  },
];

const FAQ_EN: FaqItem[] = [
  {
    q: "Is my information kept private?",
    a: "Absolutely. Data is end-to-end encrypted and used solely to comply with legal requirements. esim.vn does not store or share information with third parties.",
  },
  {
    q: "Can I use a foreign passport?",
    a: "Yes. The system accepts any valid international passport. Just photograph the personal information page clearly with good lighting.",
  },
  {
    q: "What should I do if verification fails?",
    a: "You can retry up to 3 times. If it still fails, contact 24/7 support via in-app chat or email hotro@esim.com.vn.",
  },
  {
    q: "How long does verification take?",
    a: "The system usually processes within minutes. Once approved, you'll receive an email or SMS and can use the eSIM immediately.",
  },
];

const TEXT = {
  vi: {
    badge: "Hướng dẫn xác thực danh tính",
    title: "Xác thực danh tính để dùng eSIM",
    sub1: "Theo quy định tại một số quốc gia, bạn cần xác minh danh tính để kích hoạt eSIM.",
    sub2: "eSIM phải được cài đặt trên thiết bị trước khi đăng ký tại quốc gia được chỉ định.",
    statTimeLabel: "Thời gian hoàn tất",
    statSafeLabel: "An toàn & bảo mật",
    statSupportLabel: "Hỗ trợ trực tuyến",
    notice:
      "<strong>📌 Lưu ý:</strong> Bạn <strong>không cần xác thực</strong> nếu không dùng eSIM tại các quốc gia dưới đây. Thủ tục chỉ mất <strong>3–5 phút</strong> và hoàn toàn miễn phí.",
    countriesTitle: "Quốc gia bắt buộc xác thực",
    seeGuide: "Xem hướng dẫn",
    seeGuideMobile: "Hướng dẫn",
    faqTitle: "Câu hỏi thường gặp",
    cta: "Đã hiểu, tiếp tục mua eSIM",
    footerNote: "Cần hỗ trợ? Liên hệ qua Chat hoặc email hotro@esim.com.vn",
  },
  en: {
    badge: "Identity verification guide",
    title: "Verify your identity to use eSIM",
    sub1: "Local regulations require identity verification before activating eSIM in some countries.",
    sub2: "The eSIM must be installed on your device before registration in the designated country.",
    statTimeLabel: "Time to complete",
    statSafeLabel: "Safe & secure",
    statSupportLabel: "Online support",
    notice:
      "<strong>📌 Note:</strong> You <strong>do not need to verify</strong> if you are not using the eSIM in the countries below. The procedure takes only <strong>3–5 minutes</strong> and is completely free.",
    countriesTitle: "Countries requiring verification",
    seeGuide: "See guide",
    seeGuideMobile: "See guide",
    faqTitle: "Frequently asked questions",
    cta: "Got it, continue buying eSIM",
    footerNote: "Need help? Contact us via Chat or email hotro@esim.com.vn",
  },
} as const;

/** Modal showing the eKYC requirement guide — countries list, FAQ, primary CTA. */
export function EkycModal({ open, onClose, lang }: EkycModalProps) {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const t = lang === "en" ? TEXT.en : TEXT.vi;
  const countries = lang === "en" ? COUNTRIES_EN : COUNTRIES;
  const faq = lang === "en" ? FAQ_EN : FAQ_VI;

  const goToGuide = (region: KycRegionKey) => {
    onClose();
    window.open(`/${lang}/kyc-guide?region=${region}`,'_blank')
  };

  return (
    <Modal open={open} onClose={onClose} zIndex={800} ariaLabel={t.title}>
      <div
        className={[
          "bg-white flex flex-col overflow-hidden",
          // Mobile (≤640px): bottom sheet anchored to bottom, full width, top corners rounded only.
          // Desktop: centered modal (700px, all corners rounded).
          "max-[640px]:!w-full max-[640px]:!max-w-none max-[640px]:!max-h-none max-[640px]:!h-[88vh] max-[640px]:!rounded-t-[24px] max-[640px]:!rounded-b-none",
        ].join(" ")}
        style={{
          width: "min(700px, calc(100vw - 32px))",
          maxHeight: "90vh",
          borderRadius: "24px",
          boxShadow: "0 32px 100px rgba(0,0,0,0.28)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero header */}
        <div
          className="px-8 pt-6 pb-[22px] max-[640px]:px-5 max-[640px]:pt-3 max-[640px]:pb-4 shrink-0 relative overflow-hidden"
          style={{ background: "linear-gradient(to right, #C0392B, #922B21, #7B241C)" }}
        >
          <div className="hidden max-[640px]:flex justify-center pb-3 shrink-0" style={{ background: "linear-gradient(to right, #C0392B, #922B21, #7B241C)" }}>
            <span className="w-11 h-[5px] rounded-full" style={{ background: "rgba(255,255,255,0.35)" }} />
          </div>
          {/* Decorative circle */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "-40px",
              right: "-40px",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
            }}
          />
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div
              className="inline-flex items-center gap-[7px] px-3 py-[5px] rounded-full text-[11.5px] font-bold text-white border"
              style={{ background: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.25)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="2" />
                <path d="M3 20s1-3 6-3 6 3 6 3" />
                <path d="M16 8h3M16 12h3" />
              </svg>
              {t.badge}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 rounded-full cursor-pointer flex items-center justify-center text-white shrink-0 transition-colors"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1.5px solid rgba(255,255,255,0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div
            className="text-white font-extrabold mb-2.5 relative z-10"
            style={{ fontSize: "22px", letterSpacing: "-0.4px", lineHeight: 1.3 }}
          >
            {t.title}
          </div>
          <div className="flex flex-col gap-2 mb-4 relative z-10" style={{ color: "rgba(255,255,255,0.92)", fontSize: "13px", lineHeight: 1.65 }}>
            <div className="flex items-start gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span>{t.sub1}</span>
            </div>
            <div className="flex items-start gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M12 18h.01M9 6h6M9 10h6" />
              </svg>
              <span>{t.sub2}</span>
            </div>
          </div>
          {/* Stats */}
          <div className="flex rounded-xl overflow-hidden relative z-10" style={{ background: "rgba(0,0,0,0.28)" }}>
            {[
              { v: "3'", l: t.statTimeLabel },
              { v: "100%", l: t.statSafeLabel },
              { v: "24/7", l: t.statSupportLabel },
            ].map((s, i) => (
              <div
                key={s.l}
                className="flex-1 text-center py-2.5"
                style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.12)" : "none" }}
              >
                <div className="text-white font-extrabold text-[17px]">{s.v}</div>
                <div className="text-sm mt-px" style={{ color: "rgba(255,255,255,0.72)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-8 py-2 max-[640px]:px-5 flex-1" style={{ overscrollBehavior: "contain" }}>
          <div
            className="rounded-xl mt-[18px] mb-4 px-4 py-3 text-sm leading-[1.6]"
            style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A", color: "#92400E" }}
            dangerouslySetInnerHTML={{ __html: t.notice }}
          />

          <div className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#6B7280] mb-3 flex items-center gap-2">
            {t.countriesTitle}
            <span className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          {/* Desktop: 3-column grid with white cards. Mobile: horizontal scroll with red gradient cards. */}
          <div className="grid grid-cols-3 gap-3 mb-5 max-[640px]:hidden">
            {countries.map((c) => (
              <div
                key={c.name}
                role="button"
                tabIndex={0}
                onClick={() => goToGuide(c.region)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") goToGuide(c.region);
                }}
                className="flex flex-col items-center gap-2 px-3 pt-[18px] pb-3.5 rounded-2xl bg-white cursor-pointer transition-all"
                style={{ border: "1.5px solid #E5E7EB" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FFF5F5";
                  e.currentTarget.style.borderColor = "#C0392B";
                  e.currentTarget.style.boxShadow = "0 0 0 1.5px #C0392B, 0 6px 20px rgba(192,57,43,0.15)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div className="w-10 h-10 leading-none"><img src={c.flag} alt={c.name} className="w-10 h-10 rounded-full object-cover" /></div>
                <div className="text-sm font-bold text-[#111] text-center leading-[1.4]">{c.name}</div>
                <div
                  className="inline-flex items-center justify-center gap-[5px] px-3 py-1 rounded-full text-xs font-bold text-[#DC2626] mt-0.5"
                  style={{ background: "#FFF0EE", border: "1.5px solid #FECACA" }}
                >
                  {t.seeGuide}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile country row — horizontal scroll, square cards with gradient + decorative circle */}
          <div
            className="hidden max-[640px]:block overflow-x-auto mb-[18px] pb-0.5 -mx-5 px-5"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex gap-2.5">
              {countries.map((c) => (
                <div
                  key={c.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => goToGuide(c.region)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") goToGuide(c.region);
                  }}
                  className="relative flex flex-col items-center gap-2 px-3 pt-4 pb-3.5 rounded-[14px] cursor-pointer overflow-hidden shrink-0"
                  style={{
                    border: "2px solid #FECACA",
                    background: "linear-gradient(145deg, #FFF5F5, #FFF0EE)",
                    width: "calc((100vw - 62px) / 3)",
                    minWidth: "108px",
                    maxWidth: "140px",
                    aspectRatio: "1 / 1",
                  }}
                >
                  {/* Decorative circle (top-right) */}
                  <span
                    className="absolute pointer-events-none"
                    style={{
                      top: "-16px",
                      right: "-16px",
                      width: "60px",
                      height: "60px",
                      background: "rgba(220,38,38,0.07)",
                      borderRadius: "50%",
                    }}
                  />
                  <div className="w-8 h-8 leading-none relative z-[1]"><img src={c.flag} alt={c.name} className="w-8 h-8 rounded-full object-cover" /></div>
                  <div
                    className="text-xs font-bold text-center leading-[1.35] relative z-[1] flex-1 flex items-center justify-center"
                    style={{ color: "#991B1B" }}
                  >
                    {c.name}
                  </div>
                  <div
                    className="items-center hidden md:inline-flex justify-center gap-[3px] px-3 py-1 rounded-full text-sm font-bold text-white relative z-[1] whitespace-nowrap"
                    style={{ background: "#DC2626" }}
                  >
                    {t.seeGuide}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                  <div
                    className="items-center md:hidden flex justify-center gap-[3px] px-3 py-0.5 rounded-full text-[11px] font-bold text-white relative z-[1] whitespace-nowrap"
                    style={{ background: "#DC2626" }}
                  >
                    {t.seeGuideMobile}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-4">
            <div className="text-sm font-extrabold text-[#111] mb-2.5 flex items-center gap-2">
              {t.faqTitle}
              <span className="flex-1 h-[1.5px] rounded bg-[#E5E7EB]" />
            </div>
            {faq.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-[10px] mb-2 overflow-hidden"
                  style={{ border: "1.5px solid #E5E7EB" }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex items-center justify-between w-full px-3.5 py-2.5 text-sm font-semibold text-[#111] bg-white gap-2 transition-colors hover:bg-[#F9FAFB] border-none cursor-pointer text-left"
                  >
                    <span className="flex-1">{item.q}</span>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="shrink-0 text-[#6B7280] transition-transform"
                      style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3 text-sm text-[#6B7280] leading-[1.7]">{item.a}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-8 pt-3.5 pb-5 max-[640px]:px-5 shrink-0 flex flex-col gap-2.5"
          style={{
            borderTop: "1px solid #E5E7EB",
            paddingBottom: "max(20px, calc(env(safe-area-inset-bottom, 0px) + 14px))",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-2.5 py-3 rounded-full text-sm font-bold text-white border-none cursor-pointer font-[inherit] transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #DC2626, #B91C1C)",
              boxShadow: "0 4px 14px rgba(220,38,38,0.3)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {t.cta}
          </button>
          <div className="text-[12.5px] text-[#6B7280] text-center flex items-center justify-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            {t.footerNote}
          </div>
        </div>
      </div>
    </Modal>
  );
}
