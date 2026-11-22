"use client";

import { useDesignLang, useT } from "./design-i18n";
import { Ic } from "./nd-icons";
import {
  badgeOf,
  cardLines,
  cardNote,
  cycleDaysOf,
  dataTitle,
  dayLabel,
  groupSoldOut,
  offerOf,
  priceVnd,
  techOf,
  variantFor,
  type OfferGroup,
} from "./nd-model";
import { AccItem, Overlay, Tip } from "./nd-parts";
import { useVnd, type DomesticPurchase } from "./nd-state";

/**
 * The domestic page's pieces from the v70 / v55 designs (vande-2011 #032,
 * spec part D): the flat plan card, the cycle chips, the eKYC strip under the
 * plans and the eKYC popup with the two accepted documents.
 */

/** One plan card (`.ndp`, spec D3.1). The price is the eSIM's for the chosen cycle. */
export function NdpCard({
  group,
  days,
  selected,
  onSelect,
  carrier,
  extra,
  hidden,
}: {
  group: OfferGroup;
  days: number;
  selected: boolean;
  onSelect: () => void;
  /** "Wintel", top right of the card. */
  carrier: string;
  /** Phone: a 5G card folded behind "Xem thêm N gói 5G". */
  extra?: boolean;
  hidden?: boolean;
}) {
  const vnd = useVnd();
  const tx = useT();
  const lang = useDesignLang();
  const plan = variantFor(group, days);
  const soldOut = groupSoldOut(group);
  const badge = soldOut ? { cls: "sold", label: "Tạm hết hàng" } : badgeOf(plan);
  const lines = cardLines(plan, lang);
  const note = cardNote(plan, lang);
  const fee = offerOf(plan)?.cycleFeeVnd;
  const is5g = techOf(plan) === "5G";
  return (
    <div
      className={`ndp${extra ? " xtra" : ""}`}
      id={`p${plan.providerPlanId}`}
      hidden={hidden}
      role="radio"
      aria-checked={selected}
      aria-disabled={soldOut || undefined}
      data-sold-out={soldOut ? "true" : undefined}
      data-testid={`local-plan-${plan.id}`}
      tabIndex={selected ? 0 : -1}
      onClick={(e) => {
        // The ⓘ explains; it never picks the plan (spec D3.1).
        if ((e.target as HTMLElement).closest(".tip")) return;
        if (!soldOut) onSelect();
      }}
      style={soldOut ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
    >
      {badge && <span className={`pbi ${badge.cls} ndp-tag`}>{tx(badge.label)}</span>}
      <span className="ndp-r" aria-hidden="true" />
      <span className="ndp-n">{plan.providerPlanId}</span>
      <span className="ndp-o">{carrier}</span>
      <span className="ndp-t">{dataTitle(plan, lang)}</span>
      <span className={`ndp-g${is5g ? " ndp-g--5" : ""}`}>
        <Ic name="ic-signal" w={10} />
        {is5g ? "5G" : "4G"}
      </span>
      <span className="ndp-c">
        {lines.map((l) => (
          <span className="ndp-l" key={l.text}>
            <span>{l.text}</span>
            {l.tip && <Tip text={l.tip} extra="tip--c" />}
          </span>
        ))}
        {/* "Miễn phí gói N đầu" left the card in v65: said once under the cycle chips. */}
        {!note.isCycle && (
          <span className="ndp-l ndp-note">
            <Ic name={note.icon === "ic-bolt" ? "ic-zap" : note.icon} w={14} />
            <span>{note.text}</span>
          </span>
        )}
      </span>
      {fee ? <span className="ndp-pm">{tx("Gia hạn {0}/{1}", vnd(fee), dayLabel(cycleDaysOf(plan), lang))}</span> : <span className="ndp-pm" />}
      <span className="ndp-p">
        <span className="ndp-pv">{vnd(priceVnd(plan))}</span>
      </span>
    </div>
  );
}

/** Step 2 "Chọn chu kỳ sử dụng": one chip per cycle of the chosen plan, and what renewing costs (spec D5.2). */
export function CycleChips({ p }: { p: DomesticPurchase }) {
  const vnd = useVnd();
  const tx = useT();
  const lang = useDesignLang();
  const options = p.group?.variants ?? [];
  const fee = p.plan ? offerOf(p.plan)?.cycleFeeVnd : null;
  const cycle = dayLabel(p.days, lang);
  return (
    <>
      <div
        className="chip-grid cyc-chips"
        id="cycChips"
        role="radiogroup"
        aria-labelledby="stepC"
        onKeyDown={(e) => {
          const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
          if (!step || !options.length) return;
          e.preventDefault();
          const i = Math.max(0, options.findIndex((v) => cycleDaysOf(v) === p.days));
          const next = options[(i + step + options.length) % options.length];
          p.setDays(cycleDaysOf(next));
          requestAnimationFrame(() => document.querySelector<HTMLElement>(`#cycChips [data-m="${cycleDaysOf(next)}"]`)?.focus());
        }}
      >
        {options.map((v) => {
          const d = cycleDaysOf(v);
          const on = d === p.days;
          return (
            <span key={v.id} className="chip" role="radio" aria-checked={on} tabIndex={on ? 0 : -1} data-m={d} onClick={() => p.setDays(d)}>
              {dayLabel(d, lang)}
            </span>
          );
        })}
      </div>
      <p className="cyc-hint" id="cycHint">
        {tx("Giá eSIM đã gồm cước")} <b>{cycle}</b> {tx("đầu.")}
        {fee ? (
          <>
            {" "}
            {tx("Hết hạn, nạp")} <b>{vnd(fee)}</b> {tx("để gia hạn thêm {0}.", cycle)}
          </>
        ) : null}
      </p>
    </>
  );
}

/** "Mọi gói đều cần xác thực thuê bao (eKYC) · Xem hướng dẫn", once under the plans (spec D3.2). */
export function NdEkycNote({ onOpen, mobile }: { onOpen: () => void; mobile?: boolean }) {
  const tx = useT();
  return (
    <button className={`ekyc-note nd-ekyc${mobile ? " ekyc-note--1l" : ""}`} type="button" id="ekycNote" aria-haspopup="dialog" onClick={onOpen}>
      <Ic name="ic-warning" w={16} />
      <span className="ekyc-note-c">
        <span className="ekyc-note-t">{mobile ? tx("Mọi gói cần xác thực thuê bao") : tx("Mọi gói đều cần xác thực thuê bao (eKYC)")}</span>
        <span className="ekyc-note-l">
          {mobile ? <span className="ekyc-note-lt">{tx("Hướng dẫn")}</span> : tx("Xem hướng dẫn")}
          <Ic name="ic-chev-right" w={12} />
        </span>
      </span>
    </button>
  );
}

const KYC_FAQ: [string, string][] = [
  [
    "Thông tin của tôi có được bảo mật không?",
    "Hoàn toàn. Dữ liệu được mã hoá và chỉ dùng để đăng ký thuê bao chính chủ theo quy định của cơ quan quản lý viễn thông.",
  ],
  ["Người nước ngoài có đăng ký được không?", "Có. Hệ thống chấp nhận hộ chiếu nước ngoài còn hiệu lực khi xác thực trên ứng dụng của nhà mạng."],
  [
    "Một CCCD đăng ký được bao nhiêu thuê bao?",
    "Theo Nghị định 163/2024/NĐ-CP, với mỗi nhà mạng, 3 số thuê bao trả trước đầu tiên đăng ký được bằng hình thức xác nhận thông tin như trên; từ số thứ 4 trở lên phải ký hợp đồng tại điểm giao dịch của nhà mạng.",
  ],
  [
    "Nếu xác thực thất bại, tôi phải làm gì?",
    "Bạn có thể thử lại nhiều lần. Nếu vẫn thất bại, liên hệ hỗ trợ 24/7 qua chat trong ứng dụng hoặc gửi email hotro@esim.com.vn.",
  ],
];

/** "Xác thực thuê bao (eKYC)" (spec D6): 3 steps, the two accepted documents, 4 questions. */
export function NdKycModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tx = useT();
  const ids: [string, string, string, string][] = [
    ["ic-id-lg", "CCCD gắn chip", "Dành cho công dân Việt Nam", "Chụp mặt trước và mặt sau CCCD gắn chip"],
    ["ic-passport-lg", "Hộ chiếu nước ngoài", "Dành cho người nước ngoài", "Chụp trang thông tin cá nhân của hộ chiếu (còn hiệu lực)"],
  ];
  return (
    <Overlay id="ekycOv" open={open} onClose={onClose} top>
      <div className="modal modal--kyc" role="dialog" aria-labelledby="ekycTitle" aria-modal="true">
        <div className="modal-hd modal-hd--kyc">
          <div className="modal-top">
            <div className="modal-title modal-title--sm" id="ekycTitle">
              {tx("Xác thực thuê bao (eKYC)")}
            </div>
            <button className="btn-close" type="button" aria-label={tx("Đóng")} data-close="">
              <Ic name="ic-x" w={24} />
            </button>
          </div>
        </div>
        <div className="modal-body kyc-body">
          <div className="section-lbl">{tx("Cách xác thực")}</div>
          <p className="kyc-lead">{tx("Theo quy định tại Việt Nam, mọi khách hàng phải xác thực danh tính để sử dụng eSIM. Thủ tục gồm 3 bước:")}</p>
          <ol className="kyc-steps">
            <li>
              <span>{tx("Mua eSIM và nhận mã QR qua email.")}</span>
            </li>
            <li>
              <span>{tx("Quét mã QR để cài eSIM vào điện thoại.")}</span>
            </li>
            <li>
              <span>
                {tx("Hoàn tất xác thực thuê bao trên")} <b>{tx("ứng dụng của nhà mạng")}</b> {tx("bằng CCCD gắn chip hoặc hộ chiếu nước ngoài.")}
              </span>
            </li>
          </ol>
          <p className="kyc-lead">
            {tx("eSIM chỉ dùng được sau khi xác thực xong. Mẹo: chuẩn bị sẵn")} <b>{tx("CCCD gắn chip")}</b> {tx("hoặc")} <b>{tx("hộ chiếu")}</b>{" "}
            {tx("trước khi bắt đầu để xác thực nhanh và suôn sẻ.")}
          </p>
          <div className="section-lbl">{tx("Giấy tờ được chấp nhận")}</div>
          <div className="kyc-ids">
            {ids.map(([ic, t, s, shot]) => (
              <div className="kyc-id" key={ic}>
                <span className="kyc-id-ico">
                  <Ic name={ic} w={40} />
                </span>
                <b className="kyc-id-t">{tx(t)}</b>
                <span className="kyc-id-s">{tx(s)}</span>
                <ol className="kyc-id-steps">
                  <li>
                    {tx("Mở ứng dụng của nhà mạng, chọn")} <strong>{tx("“Xác thực danh tính”")}</strong>
                  </li>
                  <li>{tx(shot)}</li>
                  <li>{tx("Quét khuôn mặt để đối chiếu (nhìn thẳng, đủ sáng)")}</li>
                </ol>
              </div>
            ))}
          </div>
          <div className="acc acc--line">
            <div className="acc-title">{tx("Câu hỏi thường gặp")}</div>
            {KYC_FAQ.map(([q, a]) => (
              <AccItem
                key={q}
                q={
                  <>
                    {tx(q)}
                    <Ic name="ic-chev-down" w={15} />
                  </>
                }
              >
                {tx(a)}
              </AccItem>
            ))}
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-block btn-danger btn-lg" type="button" data-close="">
            {tx("Đã hiểu, tiếp tục mua eSIM")}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
