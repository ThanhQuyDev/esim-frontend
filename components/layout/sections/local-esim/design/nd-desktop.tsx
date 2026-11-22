"use client";


import { esimName } from "@/lib/esim-name";
import type { Locale } from "@/lib/i18n-config";
import {
  footerReached,
  scrollToVoucherPopup,
  useChatAboveBar,
  useVoucherArrow,
} from "../../region-group/design/buy-bar";
import { useT } from "./design-i18n";
import { getCloudinaryTransformedUrl } from "@/lib/image-utils";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { LocalCarrier, Plan } from "@/lib/api";
import { carrierName, getCarrierMeta, carrierInitial, type CarrierMeta } from "../carrier-meta";
import { Ic } from "./nd-icons";
import { dataTitle, dayLabel, cycleDaysOf } from "./nd-model";
import { useVnd, type DomesticPurchase } from "./nd-state";
import {
  CrossCard,
  DeliveryRows,
  DeviceModal,
  FeatureRows,
  Qty,
  StockAlert,
  VoucherBreakdown,
  planCycleLine,
  radioKeys,
  type Brand,
  VnFlag,
  type DomesticCountry,
} from "./nd-parts";
import { DevNote, DeviceAnswer, DeviceCheckTabs, useQrHandoff } from "./device-check-tabs";
import { CycleChips, NdEkycNote, NdKycModal, NdpCard } from "./nd-v70";

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
  /** Its local destination's description P1, in place of the stock copy (vande-1411 #025). */
  intro?: string | null;
}

/**
 * Desktop layout of the domestic-eSIM carrier page — a port of
 * "esim-noi-dia-desktop-v60.html" (#066, test round 4). Markup and class
 * names follow the design file one to one; the design's script is replaced
 * by React state (see nd-state / nd-parts).
 */
export function NdDesktop({ p, meta, carrier, lang, otherCarriers, crossHref, breadcrumb, allPlans, country, intro }: Props) {
  const vnd = useVnd();
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
  // The QR hand-off of the device check (vande-2011 #032, spec D7).
  const qr = useQrHandoff(true);
  useEffect(() => {
    if (qr.result) setFlash((f) => f + 1);
  }, [qr.result]);

  const priceAnchor = useRef<HTMLDivElement>(null);
  const ctaRow = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);
  const dsbRef = useRef<HTMLDivElement>(null);
  useVoucherArrow(vpop);
  useChatAboveBar(dsbRef, dsbShow);
  const dcRef = useRef<HTMLElement>(null);
  const leftStick = useRef<HTMLDivElement>(null);

  // The local destination's icon when set, else the brand colour (vande-1411 #025).
  const logoStyle: CSSProperties = meta.iconUrl
    ? { backgroundImage: `url(${meta.iconUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: meta.logoBg };
  const initial = carrierInitial(meta);
  const days = p.days;
  const line = planCycleLine(plan, days, lang);
  // "Gói: WIN119P · 7 GB/ngày · 30 ngày" (+ "· N eSIM"), spec D5.4.
  const detail = plan
    ? `${tx("Gói: {0}", `${plan.providerPlanId} · ${dataTitle(plan, lang)} · ${dayLabel(days, lang)}`)}${p.quantity > 1 ? ` · ${p.quantity} eSIM` : ""}`
    : "";
  const daysRange = (() => {
    const all = allPlans.map(cycleDaysOf);
    const lo = Math.min(...all, 1);
    const hi = Math.max(...all, 1);
    return lo === hi ? tx("{0} ngày", lo) : tx("{0}–{1} ngày", lo, hi);
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
        !visible(cta) &&
        !footerReached();
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
    <div className="ndd nd airy crisp dv4 tv">
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
            <span aria-current="page">{esimName(meta.label, lang as Locale)}</span>
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
                {meta.iconUrl ? null : initial}
              </span>
              {/* v66: one mark before the title, no flag after it. */}
              <h1 className="pic-title">{esimName(meta.label, lang as Locale)}</h1>
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
              {/* The local destination's description P1 (vande-1411 #025). */}
              {intro ? <p className="pic-sub" data-testid="product-description">{intro}</p> : <p className="pic-sub">{tx("eSIM nội địa")}{" "}{meta.label}{" "}{tx("chính hãng, đăng ký và kích hoạt hoàn toàn online — nhận mã QR qua email tức thì. Data 4G/5G")}{meta.network ? tx(" trên hạ tầng {0}", meta.network) : ""}{tx(", có số thuê bao gọi & SMS, chu kỳ linh hoạt")}{" "}
                {daysRange}{tx(", phù hợp dùng lâu dài tại Việt Nam.")}</p>}{" "}
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
            <DeviceCheckTabs lang={lang} pageName={esimName(meta.label, lang as Locale)} qr={qr} onAll={openDevices} flash={flash} />
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
            </h2>{" "}
            <div id="plans" role="radiogroup" aria-labelledby="step1" ref={plansRef} onKeyDown={(e) => radioKeys(e, pickFromKeys)}>
              {p.highSpeed.length > 0 && (
                <div className="pg pg--scroll" role="group" aria-labelledby="pg1">
                  {" "}
                  <div className="pg-hd">
                    <Ic name="ic-zap" w={14} />
                    <h3 className="pg-title" id="pg1">{tx("Gói Data tốc độ cao")}</h3>
                    <span className="pg-line" aria-hidden="true" />
                    <span className="pg-count">{p.highSpeed.length}{" "}{tx("gói")}</span>
                  </div>{" "}
                  <div className="ndp-grid">
                    {p.highSpeed.map((g) => (
                      <NdpCard key={g.key} group={g} days={days} carrier={meta.label} selected={p.group?.key === g.key} onSelect={() => p.selectGroup(g)} />
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
                  <div className="ndp-grid">
                    {p.unlimited.map((g) => (
                      <NdpCard key={g.key} group={g} days={days} carrier={meta.label} selected={p.group?.key === g.key} onSelect={() => p.selectGroup(g)} />
                    ))}
                  </div>{" "}
                </div>
              )}
              {p.groups.length === 0 && <p className="pg-empty">{tx("Nhà mạng này hiện chưa có gói nào.")}</p>}
            </div>{" "}
            {p.groups.length > 0 && <NdEkycNote onOpen={() => setEkyc(true)} />}
          </section>{" "}
          <section aria-labelledby="stepC" className="block">
            <h2 className="sec-lbl" id="stepC">
              <span className="sec-num">
                <span className="sr-only">{tx("Bước")}{" "}</span>2
              </span>
              <span className="sr-only">. </span>
              <span>{tx("Chọn chu kỳ sử dụng")}</span>
            </h2>
            <CycleChips p={p} />
          </section>{" "}
          <section aria-label={tx("Số lượng và mua")} className="block block--last">
            <div className="buy-row buy-row--q" id="ctaRow" ref={ctaRow}>
              <StockAlert p={p} />
              <Qty p={p} className="qty-sel qty-sel--buy" />{" "}
              <button className="btn btn-lg btn-outline" type="button" data-cart="" disabled={!plan} onClick={p.addToCart}>
                <Ic name="ic-cart" w={18} />{tx("Thêm vào giỏ hàng")}</button>{" "}
              <button className="btn btn-lg btn-primary" type="button" id="buyBtn" disabled={!plan} onClick={p.buyNow}>
                <span id="buyLbl">{tx("Mua ngay")}</span>
                <span className="buy-sep" aria-hidden="true">—</span>
                <span id="mTotal">{vnd(p.net)}</span>
              </button>
            </div>
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
                <Ic name="ic-mailfast" w={16} />
              </span>
              <span className="ti-t">
                <b>{tx("Nhận eSIM ngay")}</b>
                <small>{tx("Mã QR gửi qua email tức thì")}</small>
              </span>
            </div>
          </div>
          <DevNote qr={qr} onGo={goDeviceCheck} />{" "}
        </div>{" "}
      </main>{" "}
      {otherCarriers.length > 0 && (
        <section aria-labelledby="crossHd" className="cross">
          {" "}
          <h2 className="cross-hd" id="crossHd">{tx("Xem các eSIM nội địa khác")}</h2>{" "}
          <p className="cross-lead">{tx("Mỗi nhà mạng có hạ tầng sóng, đầu số và bảng giá riêng — chọn gói phù hợp nhất với nhu cầu data và gọi của bạn.")}</p>{" "}
          <div className="cross-grid cross-grid--3">
            {otherCarriers.map((c) => (
              <CrossCard key={c.provider} href={crossHref(c.provider)} meta={{ ...getCarrierMeta(c.provider), label: carrierName(c.provider, lang, c.destination) }} fromVnd={c.fromVndPrice} />
            ))}
          </div>{" "}
        </section>
      )}{" "}
      <NdKycModal open={ekyc} onClose={() => setEkyc(false)} />
      <DeviceAnswer lang={lang} />
      <DeviceModal open={devOpen} onClose={() => setDevOpen(false)} lang={lang} initialBrand={devBrand} />
      <div className={`dsb${dsbShow ? " show" : ""}`} id="dsb" role="region" aria-label={tx("Mua nhanh")} ref={dsbRef}>
        <div className="dsb-inner">
          {" "}
          <div className="dsb-l">
            <span className="nd-logo dsb-flag" aria-hidden="true" style={logoStyle}>
              {meta.iconUrl ? null : initial}
            </span>
            <div className="dsb-info">
              <div className="dsb-name">
                {esimName(meta.label, lang as Locale)}
              </div>
              <div className="dsb-plan" id="dsbPlan">
                {plan ? tx("Gói: {0}", `${plan.providerPlanId} · ${dataTitle(plan, lang)} · ${dayLabel(days, lang)}`) : ""}
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
                    // Up to the price at the top, as in the design (vande-0411 #069).
                    setVpop("top");
                    scrollToVoucherPopup();
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
