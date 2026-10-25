"use client";



import { useDesignLang, useT } from "./design-i18n";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import type { Plan, SupportedDevicesResponse } from "@/lib/api";
import { formatActivationDate } from "@/lib/plan-activation";
import { dailyResetText } from "@/lib/plan-daily-reset";
import { localizedHref } from "@/lib/route-mapping";
import { Ic } from "./nd-icons";
import {
  badgeOf,
  cardLines,
  cardNote,
  dataTitle,
  groupSoldOut,
  hotspotLabel,
  monthLabel,
  networkLabel,
  phonePrefixLabel,
  priceVnd,
  renewalLabel,
  renewalShort,
  techOf,
  variantFor,
  type OfferGroup,
} from "./nd-model";
import { vnd, type DomesticPurchase, type PriceState } from "./nd-state";
import type { CarrierMeta } from "../carrier-meta";

/* ───────────── modal (.ov) — the design's openModal/closeModal ───────────── */

let openCount = 0;

/** `.ov` overlay: Esc, backdrop click and `[data-close]` close it; body scroll locked. */
export function Overlay({
  id,
  open,
  onClose,
  top,
  children,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  top?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    if (openCount++ === 0) document.body.style.overflow = "hidden";
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const dialog = ref.current?.querySelector<HTMLElement>("[role=dialog]");
    if (dialog) {
      dialog.tabIndex = -1;
      setTimeout(() => dialog.focus({ preventScroll: true }), 40);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      if (--openCount === 0) document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, [open, onClose]);
  return (
    <div
      ref={ref}
      className={`ov${top ? " ov--top" : ""}${open ? " open" : ""}`}
      id={id}
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (t === e.currentTarget || t.closest("[data-close]")) onClose();
      }}
    >
      {children}
    </div>
  );
}

/* ───────────── accordion item toggled by aria-expanded (.acc-q) ───────────── */

export function AccItem({
  q,
  children,
  defaultOpen = false,
  heading,
}: {
  q: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Mobile wraps the question in `<h2 class="acc-h">`. */
  heading?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const btn = (
    <button className="acc-q" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
      {q}
    </button>
  );
  return (
    <div className="acc-item">
      {heading ? <h2 className="acc-h">{btn}</h2> : btn}
      <div className="acc-a" hidden={!open}>
        {children}
      </div>
    </div>
  );
}

/* ───────────── ⓘ tooltip (.tip) — tap toggles .show ───────────── */

export function Tip({ text, w = 14, extra = "" }: { text: string; w?: number; extra?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!show) return;
    const off = () => setShow(false);
    document.addEventListener("click", off);
    return () => document.removeEventListener("click", off);
  }, [show]);
  return (
    <span
      className={`tip${extra ? " " + extra : ""}${show ? " show" : ""}`}
      aria-label={text}
      data-tip={text}
      role="note"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setShow((s) => !s);
      }}
    >
      <Ic name="ic-info-i" w={w} />
    </span>
  );
}

/* ───────────── copy-to-clipboard button state ───────────── */

export function useCopied(): [boolean, (text: string) => void] {
  const [ok, setOk] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>();
  const copy = useCallback((text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setOk(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setOk(false), 1800);
  }, []);
  return [ok, copy];
}

/* ───────────── plan radio group keyboard (design's radioGroup) ───────────── */

export function radioKeys(e: KeyboardEvent<HTMLElement>, onPick: (el: HTMLElement) => void) {
  const el = (e.target as HTMLElement).closest<HTMLElement>("[role=radio]");
  if (!el) return;
  const group = el.closest("[role=radiogroup]");
  if (!group) return;
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    onPick(el);
    return;
  }
  const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
  if (!step) return;
  e.preventDefault();
  const radios = Array.from(group.querySelectorAll<HTMLElement>("[role=radio]")).filter(
    (r) => r.offsetParent !== null && r.getAttribute("aria-disabled") !== "true",
  );
  const next = radios[(radios.indexOf(el) + step + radios.length) % radios.length];
  next?.focus();
  if (next) onPick(next);
}

/* ───────────── one plan card ───────────── */

export function PlanCard({
  group,
  months,
  selected,
  onSelect,
  mobile,
  extra,
  hidden,
}: {
  group: OfferGroup;
  months: number;
  selected: boolean;
  onSelect: () => void;
  mobile?: boolean;
  /** Mobile: a 5G card folded behind "Xem thêm N gói 5G" (`.xtra`). */
  extra?: boolean;
  hidden?: boolean;
}) {
  const tx = useT();
  const lang = useDesignLang();
  const plan = variantFor(group, months);
  const soldOut = groupSoldOut(group);
  const badge = soldOut ? { cls: "sold" as const, label: tx("Tạm hết hàng") } : badgeOf(plan);
  const lines = cardLines(plan, lang);
  const note = cardNote(plan, lang);
  const tech = techOf(plan);
  const techTag = (
    <span className={`tech ${tech === "5G" ? "t5" : "t4"}`}>
      <Ic name="ic-signal" w={9} />
      <span>{tech}</span>
    </span>
  );
  const pbi = badge ? <span className={`pbi ${badge.cls}`}>{tx(badge.label)}</span> : null;
  const body = (
    <>
      <span className="plan-t1">{dataTitle(plan, lang)}</span>
      {lines.length > 0 && (
        <span className="plan-t2">
          {lines.map((l) => (
            <span className="tline" key={l.text}>
              <Ic name={l.icon} w={12} />
              <span>{l.text}</span>
              {l.tip && <Tip text={l.tip} />}
            </span>
          ))}
        </span>
      )}
      <span className="plan-t3">
        <span className="tnote">
          <Ic name={note.icon} w={11} />
          <span className={note.isCycle ? "cyc-note" : undefined}>{note.text}</span>
        </span>
      </span>
    </>
  );
  return (
    <div
      className={`plan-btn${mobile ? " plan-btn--m" : ""}${extra ? " xtra" : ""}`}
      id={`p${plan.providerPlanId}`}
      hidden={hidden}
      role="radio"
      aria-checked={selected}
      aria-disabled={soldOut || undefined}
      data-sold-out={soldOut ? "true" : undefined}
      data-testid={`local-plan-${plan.id}`}
      tabIndex={selected ? 0 : -1}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(".tip")) return;
        onSelect();
      }}
      style={soldOut ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
    >
      {mobile ? (
        <>
          <span className="plan-l">
            <span className="plan-top">
              <span className="plan-left">
                <span className="plan-name">{plan.providerPlanId}</span>
                {techTag}
                {pbi}
              </span>
            </span>{" "}
            {body}
          </span>{" "}
          <span className="plan-r">
            <span className="plan-price">{vnd(priceVnd(plan))}</span>
            {renewalShort(plan, lang) && <span className="plan-per">{renewalShort(plan, lang)}</span>}
          </span>
        </>
      ) : (
        <>
          {pbi}
          <span className="plan-top">
            <span className="plan-left">
              <span className="plan-name">{plan.providerPlanId}</span>
              {techTag}
            </span>
            <span className="plan-price">{vnd(priceVnd(plan))}</span>
          </span>{" "}
          {body}
        </>
      )}
    </div>
  );
}

/* ───────────── "Chu kỳ sử dụng" menu (.dsel--cyc) ───────────── */

export function CycleMenu({ p, labelId }: { p: DomesticPurchase; labelId: string }) {
  const tx = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = p.group?.variants ?? [];
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", off);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", off);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div className="dsel dsel--cyc" id="cycDd" ref={ref}>
      <button
        className="dsel-btn"
        type="button"
        aria-expanded={open}
        aria-controls="cycList"
        id="cycBtn"
        aria-haspopup="menu"
        aria-labelledby={`${labelId} cycV`}
        onClick={() => setOpen(!open)}
        disabled={options.length === 0}
      >
        <span className="dsel-v" id="cycV">
          {monthLabel(p.months, p.lang)}
        </span>
        <Ic name="ic-chev-down" w={16} />
      </button>{" "}
      <div className="dsel-list" id="cycList" role="menu" hidden={!open} aria-labelledby={labelId}>
        {options.map((v) => {
          const m = v.domesticOffer?.cycleMonths ?? Math.max(1, Math.round(v.durationDays / 30));
          return (
            <button
              key={v.id}
              className="dopt dopt--c"
              type="button"
              role="menuitemradio"
              aria-checked={m === p.months}
              data-m={m}
              onClick={() => {
                p.setMonths(m);
                setOpen(false);
              }}
            >
              <span className="dopt-k" />
              <span className="dopt-d">{monthLabel(m, p.lang)}</span>
              <span className="dopt-l">{tx("Giá cước")}</span>
              <span className="dopt-p">{vnd(priceVnd(v))}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────── quantity (.qty-sel) ───────────── */

export function Qty({
  p,
  labelId,
  ids = ["qtyMinus", "qtyVal", "qtyPlus"],
  compact,
  className = "qty-sel",
}: {
  p: PriceState;
  labelId?: string;
  ids?: [string, string, string];
  compact?: boolean;
  className?: string;
}) {
  const tx = useT();
  return (
    <div className={className} role="group" {...(labelId ? { "aria-labelledby": labelId } : { "aria-label": tx("Số lượng") })}>
      <button
        className="qty-btn"
        type="button"
        aria-label={tx("Giảm số lượng")}
        id={ids[0]}
        disabled={p.quantity <= 1}
        onClick={() => p.setQty(Math.max(1, p.quantity - 1))}
      >
        −
      </button>
      <span className="qty-val" id={ids[1]} aria-live="polite">
        {compact ? p.quantity : `${p.quantity} eSIM`}
      </span>
      <button
        className="qty-btn"
        type="button"
        aria-label={tx("Tăng số lượng")}
        id={ids[2]}
        disabled={p.atMax}
        onClick={() => p.setQty(p.quantity + 1)}
      >
        +
      </button>
    </div>
  );
}

export function StockAlert({ p }: { p: PriceState }) {
  const tx = useT();
  return (
    <div className="alert alert--sm alert--warning qstock" id="qStock" role="status" hidden={!p.atMax || p.stock === Infinity}>
      <Ic name="ic-package" w={15} />
      <span id="qStockTxt">
        {p.atMax && p.stock !== Infinity
          ? tx("Gói này chỉ còn {0} eSIM trong kho — bạn đã chọn số lượng tối đa có thể mua.", p.stock)
          : ""}
      </span>
    </div>
  );
}

/* ───────────── voucher price breakdown (.vpop-bd) ───────────── */

/** The price lines (`dl.vpop-bd`) and the voucher note — shared by popover and modal. */
export function VoucherRows({ p }: { p: PriceState }) {
  const tx = useT();
  const [ok, copy] = useCopied();
  const orig = p.listTotal > p.total ? p.listTotal : p.total;
  const disc = orig - p.total;
  const pct = orig > 0 ? Math.round((disc / orig) * 100) : 0;
  return (
    <>
      <dl className="vpop-bd">
        {" "}
        <div>
          <dt>{tx("Giá gốc")}</dt>
          <dd id="vpOrig">{vnd(orig)}</dd>
        </div>{" "}
        <div id="vpDiscRow" hidden={disc <= 0}>
          <dt>{tx("Giảm giá sản phẩm")}{" "}
            <span className="vpop-pct" id="vpPct">
              −{pct}%
            </span>
          </dt>
          <dd id="vpDisc" className="is-neg">
            −{vnd(disc)}
          </dd>
        </div>{" "}
        {p.voucher && (
          <div className="vpop-v">
            <dt>
              Voucher esim.vn<span className="vpop-ast" aria-hidden="true">*</span>
              <button
                className={`vcode${ok ? " is-ok" : ""}`}
                type="button"
                aria-label={tx("Sao chép mã voucher {0}", p.voucher.code)}
                data-code={p.voucher.code}
                onClick={() => copy(p.voucher!.code)}
              >
                <Ic name={ok ? "ic-yes" : "ic-copy"} w={14} />
                <span className="vcode-t">{ok ? tx("Đã sao chép") : p.voucher.code}</span>
              </button>
              <small>{tx("Giảm")}{" "}{p.voucher.discountPercent}%
                {p.voucherMax ? tx(", tối đa {0} mỗi đơn", vnd(p.voucherMax)) : ""}.<br />{tx("Số lượng voucher có hạn.")}</small>
            </dt>
            <dd id="vchOff" className="is-neg">
              −{vnd(p.voucher.discountVnd)}
            </dd>
          </div>
        )}{" "}
        <div className="vpop-net">
          <dt>{tx("Giá tạm tính")}<small>{p.voucher ? tx("khi áp dụng voucher trên") : tx("chưa gồm voucher")}</small>
          </dt>
          <dd id="vchNet">{vnd(p.net)}</dd>
        </div>{" "}
      </dl>{" "}
      {p.voucher && <div className="vpop-note">{tx("*Nhập mã voucher ở bước giỏ hàng để được giá như trên.")}</div>}
    </>
  );
}

/** Desktop popover content (`#vchPop`). */
export function VoucherBreakdown({ p, planLine }: { p: PriceState; planLine: string }) {
  const tx = useT();
  return (
    <>
      <div className="vpop-hd">
        <div>
          <div className="vpop-t" id="vpT">{tx("Chi tiết giá")}</div>
          <div className="vpop-plan" id="vchPlan">
            {planLine}
          </div>
        </div>
        <button className="vpop-x" type="button" aria-label={tx("Đóng")} data-close="">
          <Ic name="ic-x" w={20} />
        </button>
      </div>{" "}
      <VoucherRows p={p} />
    </>
  );
}

/* ───────────── feature rows (Tính năng eSIM / Giao hàng & Kích hoạt) ───────────── */

export function FeatureRows({
  meta,
  plan,
  onEkyc,
  ekycTitle,
}: {
  meta: CarrierMeta;
  plan: Plan | null;
  onEkyc: () => void;
  ekycTitle: string;
}) {
  const tx = useT();
  const lang = useDesignLang();
  const [bannerOpen, setBannerOpen] = useState(false);
  const hotspot = plan ? hotspotLabel(plan, lang) : null;
  const prefix = phonePrefixLabel(meta, plan, lang);
  const fee = plan ? renewalLabel(plan, vnd, lang) : null;
  return (
    <>
      <div className="sr sr--nets sr--nets-fix">
        <span className="sl">{tx("Nhà mạng hỗ trợ")}</span>
        <div className="nets" id="specNets">
          <span className="net" id="specNet">
            {networkLabel(meta, plan, lang)}
          </span>
        </div>
      </div>{" "}
      {hotspot && (
        <div className="sr">
          <span className="sl">{tx("Chia sẻ kết nối / Hotspot")}</span>
          <span className="pill pill--info">
            <Ic name="ic-wifi" w={13} />
            <span id="specHotspot">{hotspot}</span>
          </span>
        </div>
      )}{" "}
      <div className="sr">
        <span className="sl">{tx("Gọi & Nhắn tin")}</span>
        <span className="v-yes">
          <Ic name="ic-yes" w={16} />
          {plan && !plan.call && !plan.sms ? tx("Không") : tx("Có")}
        </span>
      </div>{" "}
      {prefix && (
        <div className="sr">
          <span className="sl">{tx("Số điện thoại")}</span>
          <span className="pill pill--sm pill--success">
            <Ic name="ic-phone" w={13} />
            {prefix}
          </span>
        </div>
      )}{" "}
      {fee && (
        <div className="sr">
          <span className="sl">{tx("Cước phí gia hạn gói")}</span>
          <span className="sv" id="specFee">
            {fee}
          </span>
        </div>
      )}
      {plan?.isKyc && (
        <div className="ekyc-banner" id="ekycBanner">
          {" "}
          <button
            className="ekyc-banner-hd"
            type="button"
            aria-expanded={bannerOpen}
            aria-controls="ekycBannerBody"
            onClick={() => setBannerOpen(!bannerOpen)}
          >
            {" "}
            <span className="ekyc-banner-icon">
              <Ic name="ic-id-card" w={16} />
            </span>{" "}
            <span className="ekyc-banner-title">{ekycTitle}</span>{" "}
            <span className="ekyc-banner-toggle">
              <Ic name="ic-chev-down" w={14} />
            </span>{" "}
          </button>{" "}
          <div className="ekyc-banner-body" id="ekycBannerBody" hidden={!bannerOpen}>
            {" "}
            <ol className="ekyc-steps">
              {" "}
              <li className="ekyc-step">
                <span className="ekyc-step-num">1</span>
                <span>{tx("Mua eSIM & nhận mã QR qua email.")}</span>
              </li>{" "}
              <li className="ekyc-step">
                <span className="ekyc-step-num">2</span>
                <span>{tx("Quét mã QR để cài đặt vào thiết bị.")}</span>
              </li>{" "}
              <li className="ekyc-step">
                <span className="ekyc-step-num">3</span>
                <span>
                  <strong>{tx("Hoàn tất xác thực thuê bao")}</strong>{" "}{tx("(CCCD hoặc Hộ chiếu nước ngoài) → Bắt đầu sử dụng.")}</span>
              </li>{" "}
            </ol>{" "}
            <button className="btn btn-block btn-danger btn-sm" type="button" onClick={onEkyc}>
              <Ic name="ic-file" w={15} />{tx("Xem hướng dẫn đăng ký chi tiết")}<Ic name="ic-chev-right" w={13} />
            </button>{" "}
          </div>{" "}
        </div>
      )}
    </>
  );
}

export function DeliveryRows({ plan }: { plan: Plan | null }) {
  const tx = useT();
  const deadline = plan?.activationDeadline ? formatActivationDate(plan.activationDeadline) : null;
  // From the plan's own reset data (vande #033), in the page's language: the
  // old check compared a Vietnamese label with a translated one, so the row
  // never showed in English and always said UTC+7.
  const reset = dailyResetText(plan, useDesignLang());
  return (
    <>
      <div className="sr">
        <span className="sl">{tx("Thời gian nhận eSIM")}</span>
        <span className="pill pill--sm pill--success dlv-pill">
          <Ic name="ic-bolt" w={12} />{tx("Nhận ngay lập tức qua email")}</span>
      </div>{" "}
      <div className="sr">
        <span className="sl">{tx("Thời hạn kích hoạt")}</span>
        {deadline ? (
          <span className="sv-text">{tx("Trước ngày")}{" "}<strong id="activateBy">{deadline}</strong>
          </span>
        ) : (
          <span className="sv-text">{tx("Theo quy định của nhà cung cấp (ghi trong email nhận eSIM)")}</span>
        )}
      </div>{" "}
      {reset && (
        <div className="sr">
          <span className="sl">{tx("Giờ làm mới mỗi ngày")}</span>
          <span className="sv-text sv-wrap">{reset}</span>
        </div>
      )}{" "}
      <div className="sr">
        <span className="sl">{tx("Đổi trả & bảo hành")}</span>
        <span className="sv-2">
          <b>{tx("Không hỗ trợ trả hàng")}</b>
          <small>{tx("Có hướng dẫn cài đặt & sử dụng")}</small>
        </span>
      </div>
    </>
  );
}

/* ───────────── supported devices ───────────── */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export type Brand = "apple" | "samsung" | "pixel" | "other";
export const BRANDS: { key: Brand; label: string }[] = [
  { key: "apple", label: "Apple" },
  { key: "samsung", label: "Samsung" },
  { key: "pixel", label: "Google Pixel" },
  { key: "other", label: "Khác" },
];

function brandOf(manufacturer: string): Brand {
  const m = manufacturer.toLowerCase();
  if (m.includes("iphone") || m.includes("apple") || m.includes("ipad")) return "apple";
  if (m.includes("samsung")) return "samsung";
  if (m.includes("google") || m.includes("pixel")) return "pixel";
  return "other";
}

const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

/** Every supported device, by the design's four brand tabs. */
export function useDeviceList(lang: string) {
  const { data } = useQuery({
    queryKey: ["supported-devices", "grouped", lang],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/v1/supported-devices/grouped`, {
        headers: { "x-custom-lang": lang },
      });
      if (!res.ok) throw new Error("devices");
      return (await res.json()) as SupportedDevicesResponse;
    },
    staleTime: 10 * 60 * 1000,
  });
  return useMemo(() => {
    const list: { name: string; brand: Brand }[] = [];
    const seen = new Set<string>();
    for (const type of data?.data ?? []) {
      for (const mfr of type.manufacturers) {
        for (const d of mfr.devices) {
          if (seen.has(d.device)) continue;
          seen.add(d.device);
          list.push({ name: d.device, brand: brandOf(mfr.manufacturer) });
        }
      }
    }
    return list;
  }, [data]);
}

/** The design's custom select (`.dd`), built from a native `<select>`'s options. */
export function DesignSelect({
  id,
  labelId,
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: {
  id: string;
  labelId: string;
  value: string;
  options: { value: string; label: string; unknown?: boolean }[];
  placeholder: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  const tx = useT();
  const [open, setOpen] = useState(false);
  const [act, setAct] = useState(0);
  const [up, setUp] = useState(false);
  const [maxH, setMaxH] = useState<number | undefined>();
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("click", off);
    // Open upward when there is no room below (the sticky bar counts as no room).
    const r = btn.current!.getBoundingClientRect();
    const bar = document.querySelector(".dsb.show");
    const floor = (bar ? bar.getBoundingClientRect().top : innerHeight) - 8;
    const h = list.current?.offsetHeight ?? 0;
    const below = floor - r.bottom - 4;
    const above = r.top - 8;
    if (h > below && above > below) {
      setUp(true);
      setMaxH(h > above ? above : undefined);
    } else {
      setUp(false);
      setMaxH(h > below ? Math.max(below, 120) : undefined);
    }
    list.current?.focus({ preventScroll: true });
    return () => document.removeEventListener("click", off);
  }, [open]);

  const pick = (i: number) => {
    const o = options[i];
    if (!o) return;
    onChange(o.value);
    setOpen(false);
    btn.current?.focus();
  };

  return (
    <div className="dd" ref={ref}>
      <button
        type="button"
        className="dsel-btn dd-btn"
        id={`${id}Btn`}
        ref={btn}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}List`}
        aria-labelledby={`${labelId} ${id}V`}
        disabled={disabled}
        onClick={() => {
          setAct(Math.max(0, options.findIndex((o) => o.value === value)));
          setOpen(!open);
        }}
      >
        <span className={`dsel-v${current ? "" : " is-ph"}`} id={`${id}V`}>
          {current?.label ?? placeholder}
        </span>
        <Ic name="ic-chev-down" w={16} />
      </button>
      <ul
        className={`dsel-list dd-list${up ? " is-up" : ""}`}
        id={`${id}List`}
        role="listbox"
        tabIndex={-1}
        aria-labelledby={labelId}
        aria-activedescendant={open ? `${id}O${act}` : undefined}
        hidden={!open}
        ref={list}
        style={maxH ? { maxHeight: maxH } : undefined}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") setAct((a) => Math.min(a + 1, options.length - 1));
          else if (e.key === "ArrowUp") setAct((a) => Math.max(a - 1, 0));
          else if (e.key === "Enter" || e.key === " ") pick(act);
          else if (e.key === "Escape" || e.key === "Tab") {
            setOpen(false);
            if (e.key === "Escape") btn.current?.focus();
            return;
          } else return;
          e.preventDefault();
        }}
      >
        {open &&
          options.map((o, i) => (
            <li
              key={o.value}
              className={`dd-o${o.unknown ? " dd-o--x" : ""}${i === act ? " is-act" : ""}`}
              role="option"
              id={`${id}O${i}`}
              aria-selected={o.value === value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(i)}
            >
              {tx(o.label)}
            </li>
          ))}
      </ul>
    </div>
  );
}

const APPLE_NOTE = "Trừ máy bán tại Trung Quốc đại lục, Hồng Kông, Ma Cao… Và các dòng máy Lock (khóa mạng).";

/** "Kiểm tra thiết bị hỗ trợ eSIM" body (`.dc-body`). */
export function DeviceCheck({
  lang,
  onAll,
  native,
  flash,
}: {
  lang: string;
  onAll: (brand: Brand | "") => void;
  /** Mobile keeps native selects with a `.dc-v` label over them. */
  native?: boolean;
  flash?: number;
}) {
  const tx = useT();
  const devices = useDeviceList(lang);
  const [brand, setBrand] = useState<Brand | "">("");
  const [model, setModel] = useState("");
  const [ok, copy] = useCopied();
  const brandId = useId();
  void brandId;
  const models = devices.filter((d) => d.brand === brand);
  const modelOptions = brand
    ? [...models.map((d) => ({ value: d.name, label: d.name })), { value: "?", label: tx("Không thấy máy của tôi"), unknown: true }]
    : [];
  const result =
    model === "?"
      ? { cls: "unk", text: tx("Máy của bạn chưa có trong danh sách. Hãy bấm *#06# trên bàn phím gọi điện: thấy mã EID là máy hỗ trợ eSIM.") }
      : model
        ? { cls: "ok", text: tx("✓ Có, {0} hỗ trợ eSIM.", model) }
        : null;
  const brandOptions = BRANDS.map((b) => ({ value: b.key, label: b.label }));

  const selectFor = (
    kind: "brand" | "model",
    id: string,
    labelId: string,
    value: string,
    options: { value: string; label: string; unknown?: boolean }[],
    ph: string,
    disabled: boolean,
    onChange: (v: string) => void,
  ) =>
    native ? (
      <div className="dc-sw dc-sw--v">
        <select className="dc-s" id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
          <option value="">{ph}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {tx(o.label)}
            </option>
          ))}
        </select>
        <span className={`dc-v${value ? "" : " is-ph"}`} aria-hidden="true">
          {options.find((o) => o.value === value)?.label ?? ph}
        </span>
        <Ic name="ic-chev-down" w={16} />
      </div>
    ) : (
      <DesignSelect
        id={id}
        labelId={labelId}
        value={value}
        options={options}
        placeholder={ph}
        disabled={disabled}
        onChange={onChange}
        key={kind}
      />
    );

  return (
    <div className="dc-body" data-flash={flash}>
      {" "}
      <div className="dc-how">
        {" "}
        <p className="dc-how-t">{tx("Cách nhanh nhất")}</p>{" "}
        <p>{tx("Mở bàn phím gọi điện, bấm")}{" "}
          <button
            className={`dc-code${ok ? " is-ok" : ""}`}
            type="button"
            aria-label={ok ? tx("Đã sao chép mã *#06#") : tx("Sao chép mã *#06#")}
            title={tx("Sao chép mã")}
            onClick={() => copy("*#06#")}
          >
            <span className="dc-code-t">*#06#</span>
            <Ic name={ok ? "ic-yes" : "ic-copy"} w={14} />
          </button>
        </p>{" "}
        <p>{tx("Thấy mã")}{" "}<b>EID</b>{" "}{tx("là máy hỗ trợ eSIM; không thấy là không hỗ trợ.")}</p>{" "}
        <p className="dc-how-n">{tx("Lưu ý: chỉ tính EID, không tính IMEI hay MEID.")}</p>{" "}
      </div>{" "}
      <p className="dc-lbl" id="dcPick">{tx("Hoặc chọn kiểu máy của bạn để kiểm tra:")}</p>{" "}
      <div className="dc-sels">
        {" "}
        <div className="dc-f">
          <label className="dc-fl" htmlFor={native ? "dcBrand" : "dcBrandBtn"} id="dcBrandL">{tx("Hãng")}</label>
          {selectFor("brand", "dcBrand", "dcBrandL", brand, brandOptions, tx("Chọn hãng"), false, (v) => {
            setBrand(v as Brand | "");
            setModel("");
          })}
        </div>{" "}
        <div className="dc-f">
          <label className="dc-fl" htmlFor={native ? "dcModel" : "dcModelBtn"} id="dcModelL">{tx("Kiểu máy")}</label>
          {selectFor("model", "dcModel", "dcModelL", model, modelOptions, tx("Chọn kiểu máy"), !brand, setModel)}
        </div>{" "}
      </div>{" "}
      <div className={`dc-res${result ? " " + result.cls : ""}`} id="dcRes" role="status" hidden={!result} aria-live="polite">
        {result?.text}
        {result?.cls === "ok" && brand === "apple" && <small> {tx(APPLE_NOTE)}</small>}
      </div>{" "}
      <button className="dc-all" type="button" aria-haspopup="dialog" onClick={() => onAll(brand)}>{tx("Xem tất cả thiết bị hỗ trợ")}<Ic name="ic-chev-right" w={13} />
      </button>{" "}
    </div>
  );
}

/** "Thiết bị hỗ trợ eSIM" modal (#devOv). */
export function DeviceModal({
  open,
  onClose,
  lang,
  initialBrand,
}: {
  open: boolean;
  onClose: () => void;
  lang: string;
  initialBrand: Brand | "";
}) {
  const tx = useT();
  const devices = useDeviceList(lang);
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState<Brand>("apple");
  useEffect(() => {
    if (open) {
      setQ("");
      setBrand(initialBrand || "apple");
    }
  }, [open, initialBrand]);
  const needle = fold(q.trim());
  const brandLabel = (b: Brand) => fold(BRANDS.find((x) => x.key === b)!.label);
  const shown = devices.filter((d) =>
    needle ? fold(d.name).includes(needle) || brandLabel(d.brand).includes(needle) : d.brand === brand,
  );
  return (
    <Overlay id="devOv" open={open} onClose={onClose}>
      <div className="modal modal--md" role="dialog" aria-labelledby="devTitle" aria-modal="true">
        {" "}
        <div className="modal-hd">
          {" "}
          <div className="modal-top">
            <div>
              <div className="modal-title modal-title--sm" id="devTitle">{tx("Thiết bị hỗ trợ eSIM")}</div>
              <p className="modal-desc">{tx("Chọn hãng hoặc gõ tên máy để tìm nhanh")}</p>
            </div>
            <button className="btn-close" type="button" aria-label={tx("Đóng")} data-close="">
              <Ic name="ic-x" w={24} />
            </button>
          </div>{" "}
          <div className="search" id="devSearch">
            <Ic name="ic-search" w={15} />
            <input
              aria-label={tx("Tìm thiết bị")}
              autoComplete="off"
              id="devQ"
              placeholder={tx("Tìm thiết bị…")}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="search-clr" type="button" aria-label={tx("Xoá tìm kiếm")} hidden={!q} onClick={() => setQ("")}>
              <Ic name="ic-close" w={12} />
            </button>
          </div>{" "}
          <div className="dv-tabs" id="devTabs" role="group" aria-label={tx("Hãng")}>
            {BRANDS.map((b) => (
              <button
                key={b.key}
                className="dv-tab"
                type="button"
                aria-pressed={!needle && b.key === brand}
                data-brand={b.key}
                onClick={() => {
                  setBrand(b.key);
                  setQ("");
                }}
              >
                {b.label}
              </button>
            ))}
          </div>{" "}
        </div>{" "}
        <div className="modal-body" tabIndex={0}>
          {" "}
          <ul className="dv-list" id="devList">
            {shown.map((d) => (
              <li className="dv-item" data-b={d.brand} key={d.name}>
                {d.name}
              </li>
            ))}{" "}
          </ul>{" "}
          <div className="ctr-empty" id="devEmpty" hidden={shown.length > 0}>
            <Ic name="ic-search" w={36} />
            <p>{tx("Không tìm thấy thiết bị phù hợp.")}<br />{tx("Hãy kiểm tra bằng mã")}{" "}<b>*#06#</b>{" "}{tx("hoặc xem danh sách đầy đủ bên dưới.")}</p>
          </div>{" "}
        </div>{" "}
        <div className="modal-ft dv-ft">
          <p className="modal-note">{tx("Không thấy thiết bị của bạn? Danh sách đầy đủ, cập nhật mới nhất có trên esim.vn.")}</p>
          <a href={localizedHref(lang, "esim-supported-devices")} className="btn btn-block btn-dark" rel="noopener" target="_blank">{tx("Xem danh sách đầy đủ trên esim.vn")}<Ic name="ic-chev-right" w={14} />
          </a>
        </div>{" "}
      </div>
    </Overlay>
  );
}

/** "Xác thực thuê bao (eKYC)" modal (#ekycOv). */
export function EkycModal({ open, onClose, carrierLabel }: { open: boolean; onClose: () => void; carrierLabel: string }) {
  const tx = useT();
  const app = `app ${carrierLabel}`;
  const [guide, setGuide] = useState<number | null>(null);
  const card = (i: number, icon: string, name: string, sub: string, steps: ReactNode[]) => (
    <button className="opt-card" type="button" aria-expanded={guide === i} onClick={() => setGuide(guide === i ? null : i)}>
      <span className="opt-ico">
        <Ic name={icon} w={48} />
      </span>
      <span className="opt-name">
        {name}
        <small>{sub}</small>
      </span>
      <span className="opt-link">{tx("Xem hướng dẫn")}{" "}<Ic name="ic-chev-right" w={12} />
      </span>{" "}
      <span className="opt-guide" hidden={guide !== i}>
        <ol>
          {steps.map((s, k) => (
            <li key={k}>{s}</li>
          ))}
        </ol>
      </span>
    </button>
  );
  const openStep = (
    <>{tx("Mở")}{" "}{app}{tx(", chọn")}{" "}<strong>{tx("“Xác thực danh tính”")}</strong>
    </>
  );
  return (
    <Overlay id="ekycOv" open={open} onClose={onClose} top>
      <div className="modal modal--kyc" role="dialog" aria-labelledby="ekycTitle" aria-modal="true">
        {" "}
        <div className="modal-hd modal-hd--danger">
          {" "}
          <div className="modal-top">
            <span className="modal-badge">
              <Ic name="ic-id-card" w={12} />{tx("Hướng dẫn xác thực thuê bao")}</span>
            <button className="btn-close" type="button" aria-label={tx("Đóng")} data-close="">
              <Ic name="ic-x" w={24} />
            </button>
          </div>{" "}
          <div className="modal-title" id="ekycTitle">{tx("Xác thực thuê bao (eKYC)")}</div>{" "}
          <ul className="modal-sub">
            {" "}
            <li>
              <Ic name="ic-info" w={15} />
              <span>{tx("Theo quy định tại Việt Nam, mọi khách hàng phải xác thực danh tính để sử dụng eSIM.")}</span>
            </li>{" "}
            <li>
              <Ic name="ic-device-lines" w={15} />
              <span>{tx("Cần cài đặt ứng dụng của nhà mạng để xác thực danh tính.")}</span>
            </li>{" "}
          </ul>{" "}
        </div>{" "}
        <div className="modal-body">
          {" "}
          <div className="notice">
            💡 <strong>{tx("Mẹo nhanh:")}</strong>{" "}{tx("Chuẩn bị sẵn")}{" "}<strong>{tx("CCCD gắn chip")}</strong>{" "}{tx("hoặc")}{" "}<strong>{tx("Hộ chiếu")}</strong>{" "}{tx("trước khi bắt đầu để quá trình xác thực diễn ra nhanh và suôn sẻ nhất.")}</div>{" "}
          <div className="section-lbl">{tx("Hình thức xác thực được hỗ trợ")}</div>{" "}
          <div className="opt-grid">
            {" "}
            {card(0, "ic-id-lg", tx("CCCD gắn chip"), tx("Dành cho công dân Việt Nam"), [
              openStep,
              tx("Chụp mặt trước và mặt sau CCCD gắn chip"),
              tx("Quét khuôn mặt để đối chiếu (nhìn thẳng, đủ sáng)"),
            ])}{" "}
            {card(1, "ic-passport-lg", tx("Hộ chiếu nước ngoài"), tx("Dành cho người nước ngoài"), [
              openStep,
              tx("Chụp trang thông tin cá nhân của hộ chiếu (còn hiệu lực)"),
              tx("Quét khuôn mặt để đối chiếu (nhìn thẳng, đủ sáng)"),
            ])}{" "}
          </div>{" "}
          <div className="acc acc--line">
            <div className="acc-title">{tx("Câu hỏi thường gặp")}</div>{" "}
            <AccItem q={<>{tx("Thông tin của tôi có được bảo mật không?")}<Ic name="ic-chev-down" w={15} /></>}>{tx("Hoàn toàn. Dữ liệu được mã hoá và chỉ dùng để đăng ký thuê bao chính chủ theo quy định của cơ quan quản lý viễn thông.")}</AccItem>{" "}
            <AccItem q={<>{tx("Người nước ngoài có đăng ký được không?")}<Ic name="ic-chev-down" w={15} /></>}>{tx("Có. Hệ thống chấp nhận Hộ chiếu nước ngoài còn hiệu lực khi xác thực trên")}{" "}{app}.
            </AccItem>{" "}
            <AccItem q={<>{tx("Một CCCD đăng ký được bao nhiêu thuê bao?")}<Ic name="ic-chev-down" w={15} /></>}>{tx("Theo quy định hiện hành, mỗi giấy tờ tuỳ thân được đăng ký tối đa 3 thuê bao trên mỗi nhà mạng.")}</AccItem>{" "}
            <AccItem q={<>{tx("Nếu xác thực thất bại, tôi phải làm gì?")}<Ic name="ic-chev-down" w={15} /></>}>{tx("Bạn có thể thử lại nhiều lần. Nếu vẫn thất bại, liên hệ hỗ trợ 24/7 qua chat trong ứng dụng hoặc gửi email hotro@esim.com.vn.")}</AccItem>{" "}
          </div>{" "}
        </div>{" "}
        <div className="modal-ft">
          {" "}
          <button className="btn btn-block btn-danger btn-lg" type="button" data-close="">
            <Ic name="ic-check-badge" w={16} />{tx("Đã hiểu, tiếp tục mua eSIM")}</button>{" "}
          <p className="modal-note">
            <Ic name="ic-info" w={13} />{tx("Cần hỗ trợ? Liên hệ qua Chat hoặc email hotro@esim.com.vn")}</p>{" "}
        </div>{" "}
      </div>
    </Overlay>
  );
}

/** Cross-sell card for another domestic carrier (`.cross-card`). */
export function CrossCard({
  href,
  meta,
  fromVnd,
  showPrefix,
}: {
  href: string;
  meta: CarrierMeta;
  fromVnd: number;
  showPrefix?: boolean;
}) {
  const tx = useT();
  const parts = [tx("Từ {0}", vnd(fromVnd))];
  if (meta.network) parts.push(tx("Hạ tầng {0}", meta.network));
  if (showPrefix && meta.phonePrefix) parts.push(tx("Đầu số {0}", meta.phonePrefix));
  return (
    <a href={href} className="cross-card">
      <span className="cross-logo" style={{ background: meta.logoBg }}>
        {meta.label}
      </span>
      <div className="cross-txt">
        <h3 className="cross-title">eSIM {meta.label}</h3>
        <span className="cross-price">{parts.join(" · ")}</span>
      </div>
      <Ic name="ic-chev-right" w={18} cls="ic cross-arrow" />
    </a>
  );
}

/** The plan line used in summaries: "WIN119P · 1 tháng". */
export function planCycleLine(plan: Plan | null, months: number, lang: string): string {
  return plan ? `${plan.providerPlanId} · ${monthLabel(months, lang)}` : "";
}

/** Vietnam's picture and flag as set in the CMS (vande #029). */
export type DomesticCountry = { avatarUrl: string | null; flagUrl: string | null };

/** Vietnam's flag: the CMS image when set, else the design's drawing. */
export function VnFlag({ url, w, h }: { url?: string | null; w: number; h: number }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="flag" src={url} alt="VN" width={w} height={h} loading="lazy" decoding="async" />;
  }
  return <Ic name="fl-vn" w={w} h={h} cls="flag" label="VN" />;
}
