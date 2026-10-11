"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { LocalCarrier } from "@/lib/api";
import { getCarrierMeta, carrierInitial, type CarrierMeta } from "../carrier-meta";
import { Ic } from "./nd-icons";
import { planLabel, phonePrefixLabel, techOf, variantFor } from "./nd-model";
import { vnd, type DomesticPurchase } from "./nd-state";
import {
  AccItem,
  CrossCard,
  CycleMenu,
  DeliveryRows,
  DeviceCheck,
  DeviceModal,
  EkycModal,
  FeatureRows,
  Overlay,
  PlanCard,
  Qty,
  StockAlert,
  Tip,
  VoucherRows,
  planCycleLine,
  radioKeys,
  type Brand,
} from "./nd-parts";

const HERO =
  "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop";

interface Props {
  p: DomesticPurchase;
  meta: CarrierMeta;
  lang: string;
  otherCarriers: LocalCarrier[];
  crossHref: (provider: string) => string;
  breadcrumb: { home: string; destinations: string; vietnam: string };
}

/**
 * Mobile layout of the domestic-eSIM carrier page — a port of
 * "esim-noi-dia-mobile-v45.html" (#066, test round 4). The design's own top
 * bar is left out: the site header is shared by every page.
 */
export function NdMobile({ p, meta, lang, otherCarriers, crossHref, breadcrumb }: Props) {
  const plan = p.plan;
  const [ekyc, setEkyc] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [devBrand, setDevBrand] = useState<Brand | "">("");
  const [vch, setVch] = useState(false);

  const logoStyle: CSSProperties = { background: meta.logoBg };
  const prefix = phonePrefixLabel(meta, plan);
  const line = planCycleLine(plan, p.months);
  const tag = [meta.network ? `Dùng hạ tầng ${meta.network}` : null, prefix].filter(Boolean).join(" – ");

  // "Xem thêm N gói 5G": on a page that sells both, 5G cards fold away until
  // asked for — the chosen one always stays in view (design's #moreBtn).
  const [more, setMore] = useState(false);
  const is5g = (g: (typeof p.highSpeed)[number]) => techOf(variantFor(g, p.months)) === "5G";
  const foldable = p.highSpeed.some((g) => !is5g(g)) && p.highSpeed.some(is5g);
  const folded = foldable ? p.highSpeed.filter((g) => is5g(g) && !more && p.group?.key !== g.key).length : 0;

  // The buy bar shows once the page is scrolled and the plans are in reach.
  const buyRef = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);
  const [buyShow, setBuyShow] = useState(false);
  const [tight, setTight] = useState(0);
  useEffect(() => {
    const update = () => {
      const bar = buyRef.current;
      const plans = plansRef.current;
      if (!bar || !plans) return;
      setBuyShow(scrollY > 0 && plans.getBoundingClientRect().top < innerHeight - bar.offsetHeight);
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    requestAnimationFrame(update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, []);
  // Shrink the price text when the plan line and price do not fit (is-tight).
  useEffect(() => {
    const info = buyRef.current?.querySelector<HTMLElement>(".m-buy-info");
    if (!info) return;
    setTight(0);
    requestAnimationFrame(() => {
      if (info.scrollWidth > info.clientWidth) {
        setTight(1);
        requestAnimationFrame(() => info.scrollWidth > info.clientWidth && setTight(2));
      }
    });
  }, [p.net, p.quantity, p.months, p.plan?.id]);

  const pickFromKeys = (el: HTMLElement) => {
    const g = [...p.highSpeed, ...p.unlimited].find((x) => x.variants.some((v) => `p${v.providerPlanId}` === el.id));
    if (g) p.selectGroup(g);
  };

  return (
    <div className="ndm m nd tidy">
      <main className="m-app">
        {" "}
        <nav aria-label="Breadcrumb" className="bc">
          <ol>
            <li>
              <a href={breadcrumb.home}>Trang chủ</a>
            </li>
            <li>
              <a href={breadcrumb.destinations}>Điểm đến</a>
            </li>
            <li>
              <a href={breadcrumb.vietnam}>Việt Nam</a>
            </li>
            <li>
              <span aria-current="page">eSIM {meta.label}</span>
            </li>
          </ol>
        </nav>{" "}
        <div className="m-hero" style={{ "--hero-bg": `linear-gradient(160deg,${meta.logoBg},#F2784B,#F5C518)` } as CSSProperties}>
          {" "}
          <picture>
            <source
              media="(min-width:37.5rem)"
              sizes="100vw"
              srcSet={`${HERO}&q=60&w=1200&h=540 1200w, ${HERO}&q=60&w=1800&h=800 1800w, ${HERO}&q=45&w=2400&h=1067 2400w`}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Thành phố Việt Nam về đêm"
              decoding="async"
              fetchPriority="high"
              height={336}
              sizes="100vw"
              src={`${HERO}&q=60&w=800&h=560`}
              srcSet={`${HERO}&q=60&w=480&h=336 480w, ${HERO}&q=60&w=800&h=560 800w, ${HERO}&q=50&w=1200&h=840 1200w, ${HERO}&q=45&w=1320&h=924 1320w`}
              width={480}
            />
          </picture>{" "}
          <div className="m-hero-in">
            {" "}
            <div className="m-rate" role="img" aria-label="Đánh giá 4,8 trên 5 từ hơn 12.000 lượt trên Trustpilot">
              <b>4.8</b>
              <Ic name="ic-star" w={13} />
              hơn 12k đánh giá
              <span className="m-rate-tp">
                <Ic name="ic-star" w={11} />
                Trustpilot
              </span>
            </div>{" "}
            {tag && <div className="m-hero-tag">{tag}</div>}{" "}
            <div className="m-hero-t">
              <span className="nd-logo pic-flag" aria-hidden="true" style={logoStyle}>
                {carrierInitial(meta)}
              </span>
              <h1>eSIM {meta.label}</h1>
              <Ic name="fl-vn" w={24} h={18} cls="flag" label="VN" />
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="m-sec m-sheet">
          {" "}
          <p className="m-desc">
            eSIM {meta.label} — nhà mạng nội địa{meta.network ? ` trên hạ tầng ${meta.network}` : ""}, sóng 4G/5G toàn quốc.
            {meta.phonePrefix ? ` Có số thuê bao đầu ${meta.phonePrefix},` : " Có số thuê bao,"} tất cả gói đều dùng được
            Data + Gọi + SMS, gia hạn theo chu kỳ hàng tháng.
          </p>{" "}
          <div className="price-row price-row--vch" id="priceAnchor">
            <button className="pv" type="button" id="vchTag" aria-haspopup="dialog" onClick={() => setVch(true)}>
              <span className="price-now" id="priceNet">
                {plan ? vnd(p.net) : "—"}
              </span>
              <span className="pv-lbl">
                <Ic name="ic-ticket" w={14} />
                {p.voucher ? "Giá sau voucher" : "Chi tiết giá"}
                <Ic name="ic-chev-right" w={12} />
              </span>
            </button>
          </div>{" "}
          <div className="daily-row">
            <span className="daily-detail" id="dOSDetail">
              {plan ? `Gói: ${planLabel(plan)} · ${p.months} tháng` : ""}
            </span>
          </div>{" "}
        </div>{" "}
        <section className="m-step" aria-labelledby="step1">
          {" "}
          <h2 className="sec-lbl" id="step1">
            <span className="sec-num">
              <span className="sr-only">Bước </span>1
            </span>
            <span className="sr-only">. </span>
            <span>Chọn gói cước</span>
            <Tip text="Tất cả eSIM đều có chức năng sử dụng Data + Gọi + SMS" w={16} extra="tip--h" />
          </h2>{" "}
          <div id="plans" role="radiogroup" aria-labelledby="step1" ref={plansRef} onKeyDown={(e) => radioKeys(e, pickFromKeys)}>
            {p.highSpeed.length > 0 && (
              <div className="pg" role="group" aria-labelledby="pg1">
                {" "}
                <div className="pg-hd">
                  <Ic name="ic-bolt" w={14} />
                  <h3 className="pg-title" id="pg1">
                    Gói Data tốc độ cao
                  </h3>
                </div>{" "}
                <div className="plan-list">
                  {p.highSpeed.map((g) => {
                    const extra = foldable && is5g(g);
                    return (
                      <PlanCard
                        key={g.key}
                        group={g}
                        months={p.months}
                        selected={p.group?.key === g.key}
                        onSelect={() => p.selectGroup(g)}
                        mobile
                        extra={extra}
                        hidden={extra && !more && p.group?.key !== g.key}
                      />
                    );
                  })}
                </div>{" "}
                {foldable && (
                  <button
                    className={`nd-more${more ? " is-open" : ""}`}
                    type="button"
                    aria-expanded={more}
                    id="moreBtn"
                    hidden={!more && folded === 0}
                    onClick={() => setMore(!more)}
                  >
                    <span id="moreTxt">{more ? "Thu gọn gói 5G" : `Xem thêm ${folded} gói 5G`}</span>
                    <Ic name="ic-chev-down" w={14} />
                  </button>
                )}
              </div>
            )}
            {p.unlimited.length > 0 && (
              <div className="pg" role="group" aria-labelledby="pg2">
                {" "}
                <div className="pg-hd">
                  <Ic name="ic-infinity" w={14} />
                  <h3 className="pg-title" id="pg2">
                    Gói Data không giới hạn
                  </h3>
                </div>{" "}
                <div className="plan-list">
                  {p.unlimited.map((g) => (
                    <PlanCard key={g.key} group={g} months={p.months} selected={p.group?.key === g.key} onSelect={() => p.selectGroup(g)} mobile />
                  ))}
                </div>{" "}
              </div>
            )}
          </div>{" "}
        </section>{" "}
        <section className="m-step" aria-labelledby="step2">
          {" "}
          <h2 className="sec-lbl" id="step2">
            <span className="sec-num">
              <span className="sr-only">Bước </span>2
            </span>
            <span className="sr-only">. </span>
            <span>Tùy chọn của bạn</span>
          </h2>{" "}
          <div className="m-row">
            <span className="m-row-l" id="cycLbl">
              Chu kỳ sử dụng
            </span>
            <CycleMenu p={p} labelId="cycLbl" />
          </div>{" "}
          <div className="m-row">
            <span className="m-row-l" id="qtyLbl">
              Số lượng eSIM
            </span>
            <Qty p={p} labelId="qtyLbl" />
          </div>{" "}
          <StockAlert p={p} />{" "}
          <div className="trust">
            <div className="ti">
              <Ic name="ic-shield" w={14} />
              Thanh toán an toàn
            </div>
            <div className="ti">
              <Ic name="ic-headset" w={14} />
              Hỗ trợ 24/7
            </div>
            <div className="ti">
              <Ic name="ic-refund" w={14} />
              Hoàn tiền 100%
            </div>
          </div>{" "}
        </section>{" "}
        <section className="m-acc" aria-label="Thông tin chi tiết">
          {" "}
          <AccItem
            heading
            defaultOpen
            q={
              <>
                <Ic name="ic-gear" w={16} />
                <span>Tính năng eSIM</span>
                <Ic name="ic-chev-down" w={16} />
              </>
            }
          >
            <FeatureRows meta={meta} plan={plan} onEkyc={() => setEkyc(true)} ekycTitle="eSIM này cần xác thực thuê bao" />
          </AccItem>{" "}
          <AccItem
            heading
            q={
              <>
                <Ic name="ic-box" w={16} />
                <span>Giao hàng & Kích hoạt</span>
                <Ic name="ic-chev-down" w={16} />
              </>
            }
          >
            <DeliveryRows plan={plan} />
          </AccItem>{" "}
          <AccItem
            heading
            q={
              <>
                <Ic name="ic-device" w={16} />
                <span>Kiểm tra thiết bị hỗ trợ eSIM</span>
                <Ic name="ic-chev-down" w={16} />
              </>
            }
          >
            <section className="dc dc--sel" aria-label="Kiểm tra thiết bị hỗ trợ eSIM" id="dcCard">
              {" "}
              <DeviceCheck
                lang={lang}
                native
                onAll={(b) => {
                  setDevBrand(b);
                  setDevOpen(true);
                }}
              />{" "}
            </section>
          </AccItem>{" "}
        </section>{" "}
        {otherCarriers.length > 0 && (
          <section className="m-cross" aria-labelledby="crossHd">
            {" "}
            <h2 className="cross-hd" id="crossHd">
              Xem các eSIM nội địa khác
            </h2>{" "}
            <p className="cross-lead">
              Mỗi nhà mạng có hạ tầng sóng, đầu số và bảng giá riêng — chọn gói phù hợp nhất với nhu cầu data và gọi của bạn.
            </p>{" "}
            <div className="m-cross-list">
              {otherCarriers.map((c) => (
                <CrossCard key={c.provider} href={crossHref(c.provider)} meta={getCarrierMeta(c.provider)} fromVnd={c.fromVndPrice} showPrefix />
              ))}
            </div>{" "}
          </section>
        )}{" "}
      </main>
      <div
        className={`m-buy${buyShow ? " show" : ""}${tight ? " is-tight" : ""}${tight > 1 ? " is-tight2" : ""}`}
        id="mBuy"
        role="region"
        aria-label="Mua nhanh"
        ref={buyRef}
      >
        {" "}
        <div className="m-buy-info">
          <div className="m-buy-plan">
            <span id="mPlan">{line}</span>
            <span className="m-buy-qty" id="mQty" hidden={p.quantity < 2}>
              {p.quantity} eSIM
            </span>
          </div>
          <button className="m-buy-price" type="button" aria-haspopup="dialog" onClick={() => setVch(true)}>
            <Ic name="ic-ticket" w={14} />
            <span className="sr-only">{p.voucher ? "Giá sau voucher " : "Giá "}</span>
            <span id="mTotal">{vnd(p.net)}</span>
            {p.net < p.total && (
              <>
                <span className="sr-only">, giá trước voucher </span>
                <s className="m-buy-old" id="mTotalOld">
                  {vnd(p.total)}
                </s>
              </>
            )}
          </button>
        </div>{" "}
        <button className="btn btn-outline m-cart" type="button" aria-label="Thêm vào giỏ hàng" disabled={!plan} onClick={p.addToCart}>
          <Ic name="ic-cart" w={20} />
        </button>{" "}
        <button className="btn btn-primary m-buy-cta" type="button" id="buyBtn" disabled={!plan} onClick={p.buyNow}>
          Mua ngay
        </button>{" "}
      </div>{" "}
      <EkycModal open={ekyc} onClose={() => setEkyc(false)} carrierLabel={meta.label} />
      <DeviceModal open={devOpen} onClose={() => setDevOpen(false)} lang={lang} initialBrand={devBrand} />
      <Overlay id="vchOv" open={vch} onClose={() => setVch(false)}>
        <div className="modal modal--vch" role="dialog" aria-labelledby="vpT" aria-modal="true">
          {" "}
          <div className="modal-hd">
            <div className="modal-top">
              <div>
                <div className="modal-title modal-title--sm" id="vpT">
                  Chi tiết giá
                </div>
                <p className="modal-desc" id="vchPlan">
                  {p.quantity} eSIM · {line}
                </p>
              </div>
              <button className="btn-close" type="button" aria-label="Đóng" data-close="">
                <Ic name="ic-x" w={24} />
              </button>
            </div>
          </div>{" "}
          <div className="modal-body">
            <VoucherRows p={p} />
          </div>{" "}
          <div className="modal-ft">
            <button className="btn btn-block btn-dark" type="button" data-close="">
              Đã hiểu
            </button>
          </div>{" "}
        </div>
      </Overlay>
    </div>
  );
}
