"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { getCloudinaryTransformedUrl } from "@/lib/image-utils";
import { Ic } from "../../local-esim/design/nd-icons";
import { AccItem, DeviceCheck, DeviceModal, Overlay, Qty, StockAlert, VoucherRows, type Brand } from "../../local-esim/design/nd-parts";
import { vnd } from "../../local-esim/design/nd-state";
import { perDay } from "./rg-model";
import type { RegionPurchase } from "./rg-state";
import { coverageLine } from "./rg-desktop";
import {
  AppFilter,
  CalendarModal,
  CountriesModal,
  CovFlags,
  CrossCards,
  DayChips,
  DaysField,
  DeliveryRows,
  DestRes,
  DestTrigger,
  EkycModal,
  FeatureRows,
  NeedHint,
  PickerSheet,
  PlanPanes,
  SegTabs,
  Variants,
  planText,
} from "./rg-parts";

const HERO = "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop";

interface Props {
  p: RegionPurchase;
  label: string;
  lang: string;
  breadcrumb: { home: string; destinations: string };
}

/**
 * Mobile layout of the region page — a port of "esim-chau-a-mobile-v36.html"
 * (#067, test round 4). The design's own top bar is left out: the site header
 * is shared by every page.
 */
export function RgMobile({ p, label, lang, breadcrumb }: Props) {
  const plan = p.plan;
  const [ctr, setCtr] = useState(false);
  const [ekyc, setEkyc] = useState(false);
  const [cal, setCal] = useState(false);
  const [pick, setPick] = useState(false);
  const [vch, setVch] = useState(false);
  const [dsel, setDsel] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [devBrand, setDevBrand] = useState<Brand | "">("");

  const n = p.n;
  const line = planText(p);
  const hero = getCloudinaryTransformedUrl(p.member?.avatarUrl, { width: 960, height: 672, quality: "auto:good", gravity: "center" });

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
  }, [p.net, p.quantity, line]);

  const goDays = () => {
    setDsel(true);
    requestAnimationFrame(() => document.querySelector(".rgm #dock")?.scrollIntoView({ block: "center", behavior: "smooth" }));
  };
  const guard = (fn: () => unknown) => () => {
    if (p.need) goDays();
    else fn();
  };

  return (
    <div className="rgm m tidy tv">
      <main className="m-app">
        <nav aria-label="Breadcrumb" className="bc">
          <ol>
            <li>
              <a href={breadcrumb.home}>Trang chủ</a>
            </li>
            <li>
              <a href={breadcrumb.destinations}>eSIM du lịch</a>
            </li>
            <li>
              <span aria-current="page">eSIM {label}</span>
            </li>
          </ol>
        </nav>{" "}
        <div className="m-pre">
          <div className="pre-note" role="note">
            <Ic name="ic-info" w={15} />
            <span>
              <b>Cài eSIM trước khi bay</b> để có mạng ngay khi đến nơi.
              {p.showFilter && (
                <>
                  {" "}
                  <b>Đi qua Trung Quốc?</b> Bật bộ lọc ở bước 2 để chọn gói dùng được TikTok, ChatGPT.
                </>
              )}
            </span>
          </div>
        </div>{" "}
        <div className="m-hero" style={{ "--hero-bg": "linear-gradient(160deg,#E8824A,#FAC96A,#7BAFC0)" } as CSSProperties}>
          <picture>
            {!hero && (
              <source
                media="(min-width:37.5rem)"
                sizes="100vw"
                srcSet={`${HERO}&q=60&w=1200&h=540 1200w, ${HERO}&q=60&w=1800&h=800 1800w`}
              />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`Phong cảnh ${label}`}
              decoding="async"
              fetchPriority="high"
              height={336}
              width={480}
              sizes="100vw"
              src={hero || `${HERO}&q=60&w=800&h=560`}
              onError={(e) => e.currentTarget.parentElement?.remove()}
            />
          </picture>{" "}
          <div className="m-hero-in">
            <div className="m-rate" role="img" aria-label="Đánh giá 4,7 trên 5 từ hơn 97.000 lượt trên Trustpilot">
              <b>4.7</b>
              <Ic name="ic-star" w={13} />
              hơn 97k đánh giá
              <span className="m-rate-tp">
                <Ic name="ic-star" w={11} />
                Trustpilot
              </span>
            </div>{" "}
            <div className="m-hero-tag">eSIM du lịch hàng đầu tại {label}</div>{" "}
            <div className="m-hero-t">
              <span className="pic-logo" aria-hidden="true">
                <Ic name="ic-globe" w={16} />
              </span>
              <h1>eSIM {label}</h1>
              <button className="pill pill--sm pill--cnt pill--link pill--solid" type="button" id="vBadge" aria-haspopup="dialog" onClick={() => setCtr(true)}>
                {n} quốc gia
              </button>
            </div>
          </div>
        </div>{" "}
        <div className="m-sec m-sheet">
          <p className="m-desc">
            eSIM du lịch {label} dùng được tại <span id="vSub">{coverageLine(p)}</span>. <b>Một eSIM cho cả chuyến đi nhiều nước</b>, mạng 4G/5G tốc
            độ cao. Nhận mã QR qua email ngay sau khi mua.
          </p>{" "}
          <div className="price-row price-row--vch">
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
            {plan && (
              <>
                <span>
                  ≈{" "}
                  <span className="daily-amt" id="dailyAmt">
                    {vnd(perDay(p.net / p.quantity, p.days))}/ngày{p.quantity > 1 ? " mỗi eSIM" : ""}
                  </span>
                </span>
                <span className="daily-sep" aria-hidden="true">
                  |
                </span>
              </>
            )}
            <span className="daily-detail" id="dOSDetail">
              {plan ? `Gói: ${n} nước · ${line}${p.quantity > 1 ? ` · ${p.quantity} eSIM` : ""}` : ""}
            </span>
          </div>
        </div>{" "}
        {p.members.length > 1 && (
          <section className="m-step" aria-labelledby="stepV">
            <h2 className="sec-lbl" id="stepV">
              <span className="sec-num">
                <span className="sr-only">Bước </span>1
              </span>
              <span className="sr-only">. </span>
              <span>Chọn phạm vi phủ sóng</span>
            </h2>{" "}
            <Variants p={p} />{" "}
            <div className="cov">
              <div className="cov-hd cov-hd--2">
                <span className="cov-t">
                  <b id="covSub">eSIM {label}</b>
                </span>
                <button className="fs-link" type="button" aria-haspopup="dialog" onClick={() => setCtr(true)}>
                  Xem <span id="covN">{n} nước</span>
                  <Ic name="ic-chev-right" w={13} />
                </button>
                <CovFlags p={p} max={8} />
              </div>{" "}
              <DestTrigger p={p} onOpen={() => setPick(true)} /> <DestRes p={p} />
            </div>
          </section>
        )}{" "}
        <section className="m-step" aria-labelledby="step1">
          <h2 className="sec-lbl" id="step1">
            <span className="sec-num">
              <span className="sr-only">Bước </span>
              {p.members.length > 1 ? 2 : 1}
            </span>
            <span className="sr-only">. </span>
            <span>Chọn gói cước</span>
          </h2>{" "}
          <SegTabs p={p} /> <AppFilter p={p} mobile />{" "}
          <PlanPanes p={p} dselOpen={dsel} setDselOpen={setDsel} onEkyc={() => setEkyc(true)} mobile plansRef={plansRef} />
        </section>{" "}
        <section className="m-step" aria-labelledby="step2">
          <h2 className="sec-lbl" id="step2">
            <span className="sec-num">
              <span className="sr-only">Bước </span>
              {p.members.length > 1 ? 3 : 2}
            </span>
            <span className="sr-only">. </span>
            <span>Tùy chọn của bạn</span>
          </h2>{" "}
          <div className="m-row">
            <span className="m-row-l" id="daysLbl">
              Số ngày dùng
            </span>
            <DaysField p={p} cls="m-val" onCal={() => setCal(true)} onGo={goDays} />
          </div>{" "}
          <DayChips p={p} mobile onCal={() => setCal(true)} />{" "}
          <div className="m-row">
            <span className="m-row-l" id="qtyLbl">
              Số lượng eSIM
            </span>
            <Qty p={p} labelId="qtyLbl" />
          </div>{" "}
          <StockAlert p={p} /> <NeedHint p={p} onGo={goDays} />{" "}
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
          </div>
        </section>{" "}
        <section className="m-acc" aria-label="Thông tin chi tiết">
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
            <FeatureRows p={p} onEkyc={() => setEkyc(true)} onCountries={() => setCtr(true)} />
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
              <DeviceCheck
                lang={lang}
                native
                onAll={(b) => {
                  setDevBrand(b);
                  setDevOpen(true);
                }}
              />
            </section>
          </AccItem>
        </section>{" "}
        {(p.member?.destinations?.length ?? 0) > 1 && (
          <section className="m-cross" aria-labelledby="crossHd">
            <h2 className="cross-hd" id="crossHd">
              Xem eSIM cho các điểm đến khác
            </h2>{" "}
            <p className="cross-lead">
              Mỗi điểm đến có nhà mạng, vùng phủ sóng và bảng giá riêng — chọn gói phù hợp nhất với hành trình và nhu cầu data của bạn.
            </p>{" "}
            <div className="m-cross-list">
              <CrossCards p={p} lang={lang} />
            </div>
          </section>
        )}
      </main>
      <div
        className={`m-buy${buyShow ? " show" : ""}${tight ? " is-tight" : ""}${tight > 1 ? " is-tight2" : ""}`}
        id="mBuy"
        role="region"
        aria-label="Mua nhanh"
        ref={buyRef}
      >
        <div className="m-buy-info">
          <div className="m-buy-plan">
            <span id="mPlan">{p.need ? "Chưa chọn số ngày" : `${n} nước · ${line}`}</span>
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
        <button className="btn btn-outline m-cart" type="button" aria-label="Thêm vào giỏ hàng" disabled={!plan} aria-disabled={p.need} data-dgo="" onClick={guard(p.addToCart)}>
          <Ic name="ic-cart" w={20} />
        </button>{" "}
        <button className="btn btn-primary m-buy-cta" type="button" id="buyBtn" disabled={!plan} aria-disabled={p.need} data-dgo="" onClick={guard(p.buyNow)}>
          Mua ngay
        </button>
      </div>
      <CountriesModal p={p} open={ctr} onClose={() => setCtr(false)} />
      <EkycModal p={p} open={ekyc} onClose={() => setEkyc(false)} lang={lang} />
      <CalendarModal p={p} open={cal} onClose={() => setCal(false)} />
      <PickerSheet p={p} open={pick} onClose={() => setPick(false)} />
      <DeviceModal open={devOpen} onClose={() => setDevOpen(false)} lang={lang} initialBrand={devBrand} />
      <Overlay id="vchOv" open={vch} onClose={() => setVch(false)}>
        <div className="modal modal--vch" role="dialog" aria-labelledby="vpT" aria-modal="true">
          <div className="modal-hd">
            <div className="modal-top">
              <div>
                <div className="modal-title modal-title--sm" id="vpT">
                  Chi tiết giá
                </div>
                <p className="modal-desc" id="vchPlan">
                  {p.quantity} eSIM · {n} nước · {line}
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
          </div>
        </div>
      </Overlay>
    </div>
  );
}
