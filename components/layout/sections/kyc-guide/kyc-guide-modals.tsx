"use client";

import { Modal } from "@/components/layout/sections/destination/modal";
import type { Locale } from "@/lib/i18n-config";

interface KycGuideModalProps {
  open: boolean;
  onClose: () => void;
  lang: Locale;
}

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Close"
    className="w-10 h-10 rounded-full bg-[#F3F4F6] border-none cursor-pointer flex items-center justify-center transition-colors hover:bg-[#E5E7EB] shrink-0"
  >
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </button>
);

const WarnTriangle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-px">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

function ModalShell({
  open,
  onClose,
  title,
  children,
}: KycGuideModalProps & { title: string; children: React.ReactNode }) {
  return (
    <Modal open={open} onClose={onClose} zIndex={60} ariaLabel={title}>
      <div
        className={[
          "bg-white flex flex-col overflow-hidden",
          // Desktop: centered modal
          "max-[640px]:hidden",
          "rounded-[20px] max-h-[84vh]",
        ].join(" ")}
        style={{
          width: "min(500px, calc(100vw - 48px))",
          boxShadow: "0 28px 64px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0" style={{ borderBottom: "1.5px solid #F3F4F6" }}>
          <div className="text-[17px] font-bold text-[#0F172A]">{title}</div>
          <CloseButton onClick={onClose} />
        </div>
        <div className="px-6 pt-5 pb-7 overflow-y-auto flex-1">{children}</div>
      </div>

      {/* Mobile bottom sheet variant */}
      <div
        className="hidden max-[640px]:flex fixed bottom-0 left-0 right-0 max-h-[82vh] flex-col bg-white overflow-hidden"
        style={{ borderRadius: "20px 20px 0 0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="block w-9 h-1 bg-[#E5E7EB] rounded mx-auto mt-3 mb-0 cursor-pointer border-none"
        />
        <div className="flex items-center justify-between px-5 pt-[15px] pb-[13px] shrink-0" style={{ borderBottom: "1px solid #F3F4F6" }}>
          <div className="text-base font-bold text-[#0F172A]">{title}</div>
          <CloseButton onClick={onClose} />
        </div>
        <div className="px-5 pt-[18px] pb-6 overflow-y-auto flex-1" style={{ overscrollBehavior: "contain" }}>{children}</div>
      </div>
    </Modal>
  );
}

function MSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-[#6B7280] mb-2.5">{label}</div>
      {children}
    </div>
  );
}

function MRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-[#374151] leading-[1.65] mb-[9px] last:mb-0">
      <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626] shrink-0 mt-[9px]" />
      <span>{children}</span>
    </div>
  );
}

function MTag({ kind, children }: { kind: "ok" | "no"; children: React.ReactNode }) {
  return (
    <span
      className={`px-3.5 py-[5px] rounded-full text-[12.5px] font-semibold ${
        kind === "ok" ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#991B1B]"
      }`}
    >
      {children}
    </span>
  );
}

function MWarn({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-start gap-2.5 px-4 py-3 mt-2 text-sm text-[#78350F] leading-[1.65]"
      style={{ background: "#FFFBEB", borderLeft: "3px solid #F59E0B", borderRadius: "0 10px 10px 0" }}
    >
      <WarnTriangle />
      <span>{children}</span>
    </div>
  );
}

/** "Passport requirements" modal — opened from the prep section. */
export function PassportModal({ open, onClose, lang }: KycGuideModalProps) {
  const t =
    lang === "en"
      ? {
          title: "Valid passport",
          reqTitle: "Mandatory requirements",
          req: [
            "The passport must be valid and not expired at the time of registration and eSIM usage.",
            "The information on the passport must match the registration details exactly.",
            "The passport photo must be clear, with nothing obscured and no light reflections.",
          ],
          acceptedTitle: "Accepted passport types",
          accepted: ["✓ Ordinary passport", "✓ Diplomatic passport", "✓ Official passport"],
          rejectedTitle: "Not accepted",
          rejected: ["✕ HK SAR Passport", "✕ British National (Overseas)", "✕ Expired passport"],
          warn: "If your passport expires in under 6 months, some countries may refuse entry.",
        }
      : {
          title: "Hộ chiếu còn hiệu lực",
          reqTitle: "Yêu cầu bắt buộc",
          req: [
            "Hộ chiếu phải còn hiệu lực, chưa hết hạn tại thời điểm đăng ký và sử dụng eSIM.",
            "Thông tin trên hộ chiếu phải khớp chính xác với thông tin đăng ký.",
            "Ảnh chụp hộ chiếu phải rõ nét, không bị che khuất, không phản chiếu ánh sáng.",
          ],
          acceptedTitle: "Loại hộ chiếu được chấp nhận",
          accepted: ["✓ Hộ chiếu phổ thông", "✓ Hộ chiếu ngoại giao", "✓ Hộ chiếu công vụ"],
          rejectedTitle: "Không được chấp nhận",
          rejected: ["✕ HK SAR Passport", "✕ British National (Overseas)", "✕ Hộ chiếu hết hạn"],
          warn: "Nếu hộ chiếu sắp hết hạn dưới 6 tháng, một số quốc gia có thể từ chối nhập cảnh.",
        };

  return (
    <ModalShell open={open} onClose={onClose} lang={lang} title={t.title}>
      <MSection label={t.reqTitle}>
        {t.req.map((r, i) => (
          <MRow key={i}>{r}</MRow>
        ))}
      </MSection>

      <MSection label={t.acceptedTitle}>
        <div className="flex flex-wrap gap-[7px] mt-1">
          {t.accepted.map((a, i) => (
            <MTag key={i} kind="ok">{a}</MTag>
          ))}
        </div>
      </MSection>

      <MSection label={t.rejectedTitle}>
        <div className="flex flex-wrap gap-[7px] mt-1">
          {t.rejected.map((r, i) => (
            <MTag key={i} kind="no">{r}</MTag>
          ))}
        </div>
      </MSection>

      <MWarn>{t.warn}</MWarn>
    </ModalShell>
  );
}

/** "Find your ICCID" modal — opened from the prep section. */
export function IccidModal({ open, onClose, lang }: KycGuideModalProps) {
  const t =
    lang === "en"
      ? {
          title: "eSIM ICCID",
          whatTitle: "What is an ICCID?",
          what: [
            <>
              An ICCID (Integrated Circuit Card Identifier) is the unique identifier of an eSIM, consisting of <b>19–20 digits</b>.
            </>,
          ],
          whereTitle: "Where to find the ICCID",
          where: [
            <>
              The <b>confirmation email</b> from esim.vn sent after a successful eSIM purchase.
            </>,
            <>
              iPhone: <b>Settings → Mobile Data → eSIM</b> → view the ICCID number.
            </>,
            <>
              Android: <b>Settings → Connections → SIM → eSIM</b> → view the ICCID.
            </>,
          ],
          exampleTitle: "ICCID example",
          warn: (
            <>
              Enter all 19–20 digits accurately, <b>do not omit</b> any character.
            </>
          ),
        }
      : {
          title: "Mã ICCID của eSIM",
          whatTitle: "ICCID là gì?",
          what: [
            <>
              ICCID (Integrated Circuit Card Identifier) là mã định danh duy nhất của eSIM, gồm <b>19–20 chữ số</b>.
            </>,
          ],
          whereTitle: "Tìm ICCID ở đâu?",
          where: [
            <>
              <b>Email xác nhận</b> từ esim.vn gửi sau khi mua eSIM thành công.
            </>,
            <>
              iPhone: <b>Cài đặt → Cài đặt di động → eSIM</b> → xem Số ICCID.
            </>,
            <>
              Android: <b>Cài đặt → Kết nối → SIM → eSIM</b> → xem ICCID.
            </>,
          ],
          exampleTitle: "Ví dụ ICCID",
          warn: (
            <>
              Nhập chính xác toàn bộ 19–20 chữ số, <b>không bỏ sót</b> bất kỳ ký tự nào.
            </>
          ),
        };

  return (
    <ModalShell open={open} onClose={onClose} lang={lang} title={t.title}>
      <MSection label={t.whatTitle}>
        {t.what.map((w, i) => (
          <MRow key={i}>{w}</MRow>
        ))}
      </MSection>

      <MSection label={t.whereTitle}>
        {t.where.map((w, i) => (
          <MRow key={i}>{w}</MRow>
        ))}
      </MSection>

      <MSection label={t.exampleTitle}>
        <code
          className="block bg-[#F8FAFC] rounded-[10px] py-3.5 px-[18px] text-base font-mono text-[#1C1917] font-semibold my-1.5"
          style={{ border: "1.5px solid #E5E7EB", letterSpacing: "3px" }}
        >
          8984 1234 5678 9012 3
        </code>
      </MSection>

      <MWarn>{t.warn}</MWarn>
    </ModalShell>
  );
}
