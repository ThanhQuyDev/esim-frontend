"use client";


import { useT } from "./design-i18n";
import { getCloudinaryTransformedUrl } from "@/lib/image-utils";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { LocalCarrier, Plan } from "@/lib/api";
import { getCarrierMeta, carrierInitial, type CarrierMeta } from "../carrier-meta";
import { Ic } from "./nd-icons";
import { dataTitle, planLabel, summary, cycleMonths } from "./nd-model";
import { vnd, type DomesticPurchase } from "./nd-state";
import {
  CrossCard,
  CycleMenu,
  DeliveryRows,
  DeviceCheck,
  DeviceModal,
  EkycModal,
  FeatureRows,
  PlanCard,
  Qty,
  StockAlert,
  VoucherBreakdown,
  planCycleLine,
  radioKeys,
  type Brand,
  VnFlag,
  type DomesticCountry,
} from "./nd-parts";

const HERO =
  "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=60";

interface Props {
  p: DomesticPurchase;
  meta: CarrierMeta;
  carrier: string;
  lang: string;
  otherCarriers: LocalCarrier[];
  crossHref: (provider: string) => string;
  breadcrumb: { home: string; destinations: string; vietnam: string };
  allPlans: Plan[];
  /** Vietnam's picture and flag from the CMS (vande #029). */
  country: DomesticCountry | null;
}

/**
 * Desktop layout of the domestic-eSIM carrier page — a port of
 * "esim-noi-dia-desktop-v60.html" (#066, test round 4). Markup and class
 * names follow the design file one to one; the design's script is replaced
 * by React state (see nd-state / nd-parts).
 */
export function NdDesktop({ p, meta, carrier, lang, otherCarriers, crossHref, breadcrumb, allPlans, country }: Props) {
  // The CMS picture of Vietnam when set; the design's photo otherwise (vande #029).
  const hero = getCloudinaryTransformedUrl(country?.avatarUrl ?? undefined, { width: 940, height: 640, quality: "auto:good", gravity: "center" });
  const tx = useT();
  const plan = p.plan;
  const [tab, setTab] = useState<0 | 1>(0);
  const [ekyc, setEkyc] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [devBrand, setDevBrand] = useState<Brand | "">("");
  const [vpop, setVpop] = useState<null | "top" | "bs">(null);
  const [dsbShow, setDsbShow] = useState(false);
  const [flash, setFlash] = useState(0);

  const priceAnchor = useRef<HTMLDivElement>(null);
  const ctaRow = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);
  const dsbRef = useRef<HTMLDivElement>(null);
  const dcRef = useRef<HTMLElement>(null);
  const leftStick = useRef<HTMLDivElement>(null);

  const logoStyle: CSSProperties = { background: meta.logoBg };
  const initial = carrierInitial(meta);
  const months = p.months;
  const line = planCycleLine(plan, months, lang);
  const detail = plan ? tx("Gói: {0} · {1} tháng", planLabel(plan, lang), months) : "";
  const monthsRange = (() => {
    const all = allPlans.map(cycleMonths);
    const lo = Math.min(...all, 1);
    const hi = Math.max(...all, 1);
    return lo === hi ? tx("{0} tháng", lo) : tx("{0}–{1} tháng", lo, hi);
  })();

  // The design's stickyBar(): shown once the price block has scrolled away,
  // the plans are in reach, and the main buy row is not on screen.
  useEffect(() => {
    const update = () => {
      const a = priceAnchor.current;
      const bar = dsbRef.current;
      if (!a || !bar) return;
      const plans = plansRef.current;
      const cta = ctaRow.current;
      const visible = (el: HTMLElement | null) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < innerHeight;
      };
      const show =
        a.getBoundingClientRect().bottom < 0 &&
        (!plans || (scrollY > 0 && plans.getBoundingClientRect().top < innerHeight - bar.offsetHeight)) &&
        !visible(cta);
      setDsbShow(show);
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, []);

  // Left column sticks, but never under the sticky bar.
  useEffect(() => {
    const el = leftStick.current;
    if (!el) return;
    const fit = () => {
      el.style.top = Math.min(16, innerHeight - el.offsetHeight - (dsbRef.current?.offsetHeight ?? 0) - 16) + "px";
    };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    ro?.observe(el);
    addEventListener("resize", fit);
    fit();
    return () => {
      ro?.disconnect();
      removeEventListener("resize", fit);
    };
  }, []);

  // Close the price popover on outside click / Escape.
  useEffect(() => {
    if (!vpop) return;
    const off = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("#vchPop,[data-vpop],#dsbVch")) setVpop(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setVpop(null);
    document.addEventListener("click", off);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", off);
      document.removeEventListener("keydown", esc);
    };
  }, [vpop]);

  const popover = (where: "top" | "bs") =>
    vpop === where && (
      <div
        className={`vpop${where === "bs" ? " vpop--r" : ""}`}
        id="vchPop"
        role="dialog"
        aria-labelledby="vpT"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("[data-close]")) setVpop(null);
        }}
      >
        <VoucherBreakdown p={p} planLine={`${p.quantity} eSIM · ${line}`} />
      </div>
    );

  const openDevices = (brand: Brand | "") => {
    setDevBrand(brand);
    setDevOpen(true);
  };

  const goDeviceCheck = () => {
    dcRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    setFlash((f) => f + 1);
  };

  const pickFromKeys = (el: HTMLElement) => {
    const g = [...p.highSpeed, ...p.unlimited].find((x) => x.variants.some((v) => `p${v.providerPlanId}` === el.id));
    if (g) p.selectGroup(g);
  };

  return (
    <div className="ndd airy crisp nd">
      <nav aria-label="Breadcrumb" className="bc bc--c">
        <ol>
          <li>
            <a href={breadcrumb.home}>{tx("Trang chủ")}</a>
          </li>
          <li>
            <a href={breadcrumb.destinations}>{tx("Điểm đến")}</a>
          </li>
          <li>
            <a href={breadcrumb.vietnam}>{tx("Việt Nam")}</a>
          </li>
          <li>
            <span aria-current="page">eSIM {meta.label}</span>
          </li>
        </ol>
      </nav>{" "}
      <main className="main">
        <div className="pd-top">
          {" "}
          <div className="pd-hd">
            {" "}
            <div className="pic-title-row">
              <span className="nd-logo pic-flag" aria-hidden="true" style={logoStyle}>
                {initial}
              </span>
              <h1 className="pic-title">eSIM {meta.label}</h1>
              <VnFlag url={country?.flagUrl} w={24} h={18} />
            </div>{" "}
          </div>{" "}
          <div className="buy-sum">
            {" "}
            <div className="rat">
              <div className="stars" role="img" aria-label={tx("Đánh giá 4,7 trên 5")}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Ic key={i} name="ic-star" w={16} />
                ))}
              </div>
              <span className="rat-score">4.7</span>
              <span className="rat-cnt">{tx("97.400+ đánh giá")}</span>
              <div className="tp">
                <Ic name="ic-star" w={14} />
                Trustpilot
              </div>
            </div>{" "}
            <div className="price-row price-row--vch" id="priceAnchor" ref={priceAnchor}>
              <button
                className="pv"
                type="button"
                aria-expanded={vpop === "top"}
                aria-controls="vchPop"
                data-vpop=""
                id="vchTag"
                onClick={() => setVpop(vpop === "top" ? null : "top")}
              >
                <span className="price-now" id="priceNet">
                  {plan ? vnd(p.net) : "—"}
                </span>
                <span className="pv-lbl">
                  <Ic name="ic-ticket" w={14} />
                  {p.voucher ? tx("Giá sau voucher") : tx("Chi tiết giá")}
                  <Ic name="ic-chev-down" w={12} />
                </span>
              </button>
              {popover("top")}
            </div>{" "}
            <div className="daily-row">
              <span className="daily-detail" id="dOSDetail">
                {detail}
              </span>
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="left-col left-col--stick" ref={leftStick}>
          {" "}
          <div className="pd-img" style={{ "--hero-bg": `linear-gradient(160deg,${meta.logoBg},#F2784B,#F5C518)` } as CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={tx("Thành phố Việt Nam về đêm")}
              decoding="async"
              fetchPriority="high"
              height={480}
              sizes="(max-width:56.25rem) 100vw, 29rem"
              src={hero || `${HERO}&w=720&h=480`}
              srcSet={hero ? undefined : `${HERO}&w=720&h=480 720w, ${HERO}&w=1400&h=933 1400w`}
              width={720}
              onError={(e) => e.currentTarget.remove()}
            />
          </div>{" "}
          <article aria-label={tx("Thông tin eSIM {0}", meta.label)} className="pic">
            {" "}
            <div className="pic-body">
              {" "}
              <p className="pic-sub">{tx("eSIM nội địa")}{" "}{meta.label}{" "}{tx("chính hãng, đăng ký và kích hoạt hoàn toàn online — nhận mã QR qua email tức thì. Data 4G/5G")}{meta.network ? tx(" trên hạ tầng {0}", meta.network) : ""}{tx(", có số thuê bao gọi & SMS, chu kỳ linh hoạt")}{" "}
                {monthsRange}{tx(", phù hợp dùng lâu dài tại Việt Nam.")}</p>{" "}
              <div
                className="dt-tabs"
                role="tablist"
                aria-label={tx("Chi tiết eSIM")}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                    e.preventDefault();
                    const next = tab === 0 ? 1 : 0;
                    setTab(next);
                    document.getElementById(`tab-dt${next}`)?.focus();
                  }
                }}
              >
                {" "}
                <button
                  className="dt-tab"
                  type="button"
                  id="tab-dt0"
                  aria-controls="dt0"
                  aria-selected={tab === 0}
                  role="tab"
                  tabIndex={tab === 0 ? 0 : -1}
                  onClick={() => setTab(0)}
                >
                  <Ic name="ic-gear" w={13} />{tx("Tính năng eSIM")}</button>{" "}
                <button
                  className="dt-tab"
                  type="button"
                  id="tab-dt1"
                  aria-controls="dt1"
                  aria-selected={tab === 1}
                  role="tab"
                  tabIndex={tab === 1 ? 0 : -1}
                  onClick={() => setTab(1)}
                >
                  <Ic name="ic-box" w={13} />{tx("Giao hàng & Kích hoạt")}</button>{" "}
              </div>{" "}
              <div className="dt-pane" id="dt0" role="tabpanel" aria-labelledby="tab-dt0" hidden={tab !== 0}>
                <FeatureRows
                  meta={meta}
                  plan={plan}
                  onEkyc={() => setEkyc(true)}
                  ekycTitle={tx("eSIM {0} cần xác thực thuê bao (eKYC)", meta.label)}
                />
              </div>{" "}
              <div className="dt-pane" id="dt1" role="tabpanel" aria-labelledby="tab-dt1" hidden={tab !== 1}>
                <DeliveryRows plan={plan} />
              </div>{" "}
            </div>{" "}
          </article>{" "}
          <section
            aria-labelledby="dcTitle"
            className={`dc dc--flat dc--sel${flash ? " is-flash" : ""}`}
            id="dcCard"
            ref={dcRef}
            key={`dc${flash}`}
          >
            {" "}
            <div className="dc-hd">
              <div className="dc-ico">
                <Ic name="ic-device" w={18} />
              </div>
              <h2 className="dc-title" id="dcTitle">{tx("Kiểm tra thiết bị hỗ trợ eSIM")}</h2>
            </div>{" "}
            <DeviceCheck lang={lang} onAll={openDevices} />
          </section>{" "}
        </div>{" "}
        <div className="rc--tight right-col">
          {" "}
          <section aria-labelledby="step1" className="block">
            {" "}
            <h2 className="sec-lbl" id="step1">
              <span className="sec-num">
                <span className="sr-only">{tx("Bước")}{" "}</span>1
              </span>
              <span className="sr-only">. </span>
              <span>{tx("Chọn gói cước")}</span>
              <span className="sec-desc">{tx("— tất cả eSIM đều có chức năng sử dụng Data + Gọi + SMS")}</span>
            </h2>{" "}
            <div id="plans" role="radiogroup" aria-labelledby="step1" ref={plansRef} onKeyDown={(e) => radioKeys(e, pickFromKeys)}>
              {p.highSpeed.length > 0 && (
                <div className="pg pg--scroll" role="group" aria-labelledby="pg1">
                  {" "}
                  <div className="pg-hd">
                    <Ic name="ic-bolt" w={14} />
                    <h3 className="pg-title" id="pg1">{tx("Gói Data tốc độ cao")}</h3>
                    <span className="pg-line" aria-hidden="true" />
                    <span className="pg-count">{p.highSpeed.length}{" "}{tx("gói")}</span>
                  </div>{" "}
                  <div className="plan-grid">
                    {p.highSpeed.map((g) => (
                      <PlanCard key={g.key} group={g} months={months} selected={p.group?.key === g.key} onSelect={() => p.selectGroup(g)} />
                    ))}
                  </div>{" "}
                </div>
              )}
              {p.unlimited.length > 0 && (
                <div className="pg pg--scroll" role="group" aria-labelledby="pg2">
                  {" "}
                  <div className="pg-hd">
                    <Ic name="ic-infinity" w={14} />
                    <h3 className="pg-title" id="pg2">{tx("Gói Data không giới hạn")}</h3>
                    <span className="pg-line" aria-hidden="true" />
                    <span className="pg-count">{p.unlimited.length}{" "}{tx("gói")}</span>
                  </div>{" "}
                  <div className="plan-grid">
                    {p.unlimited.map((g) => (
                      <PlanCard key={g.key} group={g} months={months} selected={p.group?.key === g.key} onSelect={() => p.selectGroup(g)} />
                    ))}
                  </div>{" "}
                </div>
              )}
              {p.groups.length === 0 && <p className="pg-empty">{tx("Nhà mạng này hiện chưa có gói nào.")}</p>}
            </div>{" "}
          </section>{" "}
          <section aria-labelledby="step2" className="block block--last">
            {" "}
            <h2 className="sec-lbl" id="step2">
              <span className="sec-num">
                <span className="sr-only">{tx("Bước")}{" "}</span>2
              </span>
              <span className="sr-only">. </span>
              <span>{tx("Tùy chọn của bạn")}</span>
            </h2>{" "}
            <div className="cust-row cust-row--sc">
              <div>
                <span className="cust-lbl" id="cycLbl">{tx("Chu kỳ sử dụng")}</span>
                <CycleMenu p={p} labelId="cycLbl" />
              </div>
              <div>
                <span className="cust-lbl" id="qtyLbl">{tx("Số lượng eSIM")}</span>{" "}
                <Qty p={p} labelId="qtyLbl" />
              </div>
            </div>{" "}
            <StockAlert p={p} />{" "}
            <div className="buy-row" id="ctaRow" ref={ctaRow}>
              {" "}
              <div className="bs">
                {" "}
                <div className="bs-l">
                  <p className="bs-plan">
                    <span className="nd-logo bs-flag" aria-hidden="true" style={logoStyle}>
                      {initial}
                    </span>
                    <span>
                      <span id="mPlan">{line}</span>
                      <span className="bs-qty" id="mQty" hidden={p.quantity < 2}>
                        {p.quantity} eSIM
                      </span>
                    </span>
                  </p>
                  <p className="bs-apps">
                    <span className="is-ok">
                      <Ic name="ic-check-circle" w={15} />
                      <span id="mSum">{plan ? summary(plan, lang) : ""}</span>
                    </span>
                  </p>
                </div>{" "}
                <div className="bs-r">
                  <p className="bs-total">
                    <span className="sr-only">{tx("Giá trước voucher")}{" "}</span>
                    {p.net < p.total || p.listTotal > p.total ? (
                      <s className="bs-old" id="mTotalOld">
                        {vnd(p.listTotal > p.total ? p.listTotal : p.total)}
                      </s>
                    ) : null}
                    <span className="bs-net" id="mTotal">
                      {vnd(p.net)}
                    </span>
                  </p>
                  {p.voucher && (
                    <button
                      className="bs-vch"
                      type="button"
                      aria-expanded={vpop === "bs"}
                      aria-controls="vchPop"
                      data-vpop=""
                      onClick={() => setVpop(vpop === "bs" ? null : "bs")}
                    >
                      <Ic name="ic-ticket" w={13} />
                      <span>{tx("Giá sau voucher · tiết kiệm")}{" "}<span id="mSave">{vnd(p.voucher.discountVnd)}</span>
                      </span>
                      <Ic name="ic-chev-down" w={12} />
                    </button>
                  )}
                  {popover("bs")}
                </div>{" "}
              </div>{" "}
              <button className="btn btn-lg btn-outline" type="button" data-cart="" disabled={!plan} onClick={p.addToCart}>
                <Ic name="ic-cart" w={18} />{tx("Thêm vào giỏ hàng")}</button>{" "}
              <button className="btn btn-lg btn-primary" type="button" id="buyBtn" disabled={!plan} onClick={p.buyNow}>{tx("Mua ngay")}</button>{" "}
            </div>{" "}
          </section>{" "}
          <div className="trust trust--lined">
            <div className="ti">
              <span className="ti-ic">
                <Ic name="ic-shield" w={16} />
              </span>
              <span className="ti-t">
                <b>{tx("Thanh toán an toàn")}</b>
                <small>{tx("Thẻ, Apple Pay, Google Pay")}</small>
              </span>
            </div>
            <div className="ti">
              <span className="ti-ic">
                <Ic name="ic-headset" w={16} />
              </span>
              <span className="ti-t">
                <b>{tx("Hỗ trợ 24/7")}</b>
                <small>{tx("Qua chat, Zalo, WhatsApp")}</small>
              </span>
            </div>
            <div className="ti">
              <span className="ti-ic">
                <Ic name="ic-refund" w={16} />
              </span>
              <span className="ti-t">
                <b>{tx("Hoàn tiền 100%")}</b>
                <small>{tx("Nếu eSIM chưa kích hoạt")}</small>
              </span>
            </div>
          </div>
          <p className="dev-note dev-note--lined">
            <Ic name="ic-info" w={14} />
            <span>{tx("Vui lòng kiểm tra thiết bị có hỗ trợ eSIM trước khi thanh toán.")}</span>
            <button className="dev-go" type="button" onClick={goDeviceCheck}>{tx("Kiểm tra ngay")}<Ic name="ic-chev-right" w={13} />
            </button>
          </p>{" "}
        </div>{" "}
      </main>{" "}
      {otherCarriers.length > 0 && (
        <section aria-labelledby="crossHd" className="cross">
          {" "}
          <h2 className="cross-hd" id="crossHd">{tx("Xem các eSIM nội địa khác")}</h2>{" "}
          <p className="cross-lead">{tx("Mỗi nhà mạng có hạ tầng sóng, đầu số và bảng giá riêng — chọn gói phù hợp nhất với nhu cầu data và gọi của bạn.")}</p>{" "}
          <div className="cross-grid">
            {otherCarriers.map((c) => (
              <CrossCard key={c.provider} href={crossHref(c.provider)} meta={getCarrierMeta(c.provider)} fromVnd={c.fromVndPrice} />
            ))}
          </div>{" "}
        </section>
      )}{" "}
      <EkycModal open={ekyc} onClose={() => setEkyc(false)} carrierLabel={meta.label} />
      <DeviceModal open={devOpen} onClose={() => setDevOpen(false)} lang={lang} initialBrand={devBrand} />
      <div className={`dsb${dsbShow ? " show" : ""}`} id="dsb" role="region" aria-label={tx("Mua nhanh")} ref={dsbRef}>
        <div className="dsb-inner">
          {" "}
          <div className="dsb-l">
            <span className="nd-logo dsb-flag" aria-hidden="true" style={logoStyle}>
              {initial}
            </span>
            <div className="dsb-info">
              <div className="dsb-name">
                eSIM {meta.label} <VnFlag url={country?.flagUrl} w={16} h={12} />
              </div>
              <div className="dsb-plan" id="dsbPlan">
                {plan ? tx("Gói: {0} — {1} · {2} tháng", plan.providerPlanId, dataTitle(plan, lang), months) : ""}
              </div>
            </div>
          </div>{" "}
          <div className="dsb-r">
            {" "}
            <div className="dsb-pricewrap">
              <span className="dsb-pl">
                {p.net < p.total && (
                  <s className="dsb-old" id="dsbOld">
                    {vnd(p.total)}
                  </s>
                )}
                <span className={`dsb-price${p.voucher ? " dsb-price--net" : ""}`} id="dsbPrice">
                  {vnd(p.net)}
                </span>
              </span>
              {p.voucher && (
                <button
                  className="dsb-vch"
                  type="button"
                  id="dsbVch"
                  aria-controls="vchPop"
                  onClick={() => {
                    setVpop("bs");
                    ctaRow.current?.scrollIntoView({ block: "center", behavior: "smooth" });
                  }}
                >
                  <Ic name="ic-ticket" w={12} />{tx("Giá sau voucher")}</button>
              )}
              <span className="sb-stock" id="sbStock" hidden={!p.atMax || p.stock === Infinity}>
                <Ic name="ic-package" w={12} />
                <span id="sbStockTxt">{p.stock !== Infinity ? tx("Chỉ còn {0} eSIM trong kho", p.stock) : ""}</span>
              </span>
            </div>{" "}
            <Qty p={p} ids={["dsbMinus", "dsbQty", "dsbPlus"]} compact className="dsb-qty" />{" "}
            <button className="btn btn-sm btn-outline dsb-cart" type="button" disabled={!plan} onClick={p.addToCart}>
              <Ic name="ic-cart" w={16} />{tx("Thêm vào giỏ hàng")}</button>{" "}
            <button className="btn btn-sm btn-primary" type="button" disabled={!plan} onClick={p.buyNow}>{tx("Mua ngay")}</button>{" "}
          </div>
        </div>
      </div>
      <span hidden data-carrier={carrier} />
    </div>
  );
}
