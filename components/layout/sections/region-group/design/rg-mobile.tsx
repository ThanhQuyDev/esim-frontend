"use client";


import { useT } from "../../local-esim/design/design-i18n";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { getCloudinaryTransformedUrl } from "@/lib/image-utils";
import { Ic } from "../../local-esim/design/nd-icons";
import { AccItem, DeviceCheck, DeviceModal, Overlay, Qty, StockAlert, VoucherRows, type Brand } from "../../local-esim/design/nd-parts";
import { vnd } from "../../local-esim/design/nd-state";
import { perDay } from "./rg-model";
import type { RegionPurchase } from "./rg-state";
import { countryCarriers, coverageLine } from "./rg-desktop";
import {
  AppFilter,
  CalendarModal,
  CountriesModal,
  CovFlags,
  CrossCards,
  DeliveryRows,
  DestRes,
  DestTrigger,
  EkycModal,
  FeatureRows,
  PickerSheet,
  PlanPanes,
  SegTabs,
  TripDays,
  Variants,
  planText,
  Flag,
} from "./rg-parts";
import { DEFAULT_DESTINATION_IMAGE } from "@/lib/destination-image";


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
  const tx = useT();
  const plan = p.plan;
  const [ctr, setCtr] = useState(false);
  const [ekyc, setEkyc] = useState(false);
  const [cal, setCal] = useState(false);
  const [pick, setPick] = useState(false);
  const [vch, setVch] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [devBrand, setDevBrand] = useState<Brand | "">("");

  const n = p.n;
  const line = planText(p, p.lang);
  const hero = getCloudinaryTransformedUrl(
    // The chosen variant's CMS picture, else any variant's, before the design's photo (vande #029).
    p.member?.avatarUrl || p.members.find((m) => m.avatarUrl)?.avatarUrl,
    { width: 960, height: 672, quality: "auto:good", gravity: "center" });

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

  // "Kiểm tra ngay" (spec §9.8): open the device check, bring it into view,
  // flash its border once.
  const [devGo, setDevGo] = useState(0);
  const goDeviceCheck = () => setDevGo((n) => n + 1);
  // Scrolled once the accordion has opened, so the card's final place is known.
  useEffect(() => {
    if (!devGo) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(
      () => document.getElementById("dcCard")?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }),
      60,
    );
    return () => window.clearTimeout(t);
  }, [devGo]);

  return (
    <div className="rgm dv4 m tidy tv">
      <main className="m-app">
        <nav aria-label="Breadcrumb" className="bc">
          <ol>
            <li>
              <a href={breadcrumb.home}>{tx("Trang chủ")}</a>
            </li>
            <li>
              <a href={breadcrumb.destinations}>{tx("eSIM du lịch")}</a>
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
              {p.noticeHtml ? (
                // The note the admin wrote for this country or region (doitac-1410 #078) — one note, not two (vande #032, #051).
                <span dangerouslySetInnerHTML={{ __html: p.noticeHtml }} />
              ) : p.country && p.china ? (
                <>
                  <b>{tx("Cài eSIM, tắt định vị trước khi bay")}</b>{" "}{tx("để có mạng ngay khi đến.")}{" "}
                  <b>{tx("Không dùng Wi-Fi ở Trung Quốc")}</b>{" "}{tx("vì có thể bị phát hiện, chặn ứng dụng quốc tế.")}
                </>
              ) : (
              <>
              <b>{tx("Cài eSIM trước khi bay")}</b>{" "}{tx("để có mạng ngay khi đến nơi.")}{!p.country && p.showFilter && (
                <>
                  {" "}
                  <b>{tx("Đi qua Trung Quốc?")}</b>{" "}{tx("Bật bộ lọc ở bước 2 để chọn gói dùng được TikTok, ChatGPT.")}</>
              )}
              </>
              )}
            </span>
          </div>
        </div>{" "}
        <div className="m-hero" style={{ "--hero-bg": "linear-gradient(160deg,#E8824A,#FAC96A,#7BAFC0)" } as CSSProperties}>
          <picture>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={tx("Phong cảnh {0}", label)}
              decoding="async"
              fetchPriority="high"
              height={336}
              width={480}
              sizes="100vw"
              // No picture in the CMS yet: our own default, not a stock photo
              // of Mount Fuji on every country's page (vande #074).
              src={hero || DEFAULT_DESTINATION_IMAGE}
              onError={(e) => e.currentTarget.parentElement?.remove()}
            />
          </picture>{" "}
          <div className="m-hero-in">
            <div className="m-rate" role="img" aria-label={tx("Đánh giá 4,7 trên 5 từ hơn 97.000 lượt trên Trustpilot")}>
              <b>4.7</b>
              <Ic name="ic-star" w={13} />{tx("hơn 97k đánh giá")}<span className="m-rate-tp">
                <Ic name="ic-star" w={11} />
                Trustpilot
              </span>
            </div>{" "}
            <div className="m-hero-tag">{tx("eSIM du lịch hàng đầu tại")}{" "}{label}</div>{" "}
            <div className="m-hero-t">
              {p.country ? (
                <Flag code={p.country.countryCode || ""} url={p.country.flagUrl ?? undefined} w={28} h={21} />
              ) : (
              <span className="pic-logo" aria-hidden="true">
                <Ic name="ic-globe" w={16} />
              </span>
              )}
              <h1>eSIM {label}</h1>
              {!p.country && (
              <button className="pill pill--sm pill--cnt pill--link pill--solid" type="button" id="vBadge" aria-haspopup="dialog" onClick={() => setCtr(true)}>
                {n}{" "}{tx("quốc gia")}</button>
              )}
            </div>
          </div>
        </div>{" "}
        <div className="m-sec m-sheet">
          {p.country ? (
            <p className="m-desc">
              {tx("eSIM du lịch {0}", label)}
              {countryCarriers(p) ? tx(" mạng {0}", countryCarriers(p)) : ""}{tx(" 4G/5G.")}{" "}
              {p.china && (
                <>
                  <b>{tx("Không cần VPN")}</b>
                  {tx(": dùng được ngay Facebook, Zalo, Google Maps, YouTube — có gói dùng cả TikTok, ChatGPT.")}{" "}
                </>
              )}
              {tx("Nhận mã QR qua email ngay sau khi mua.")}
            </p>
          ) : (
          <p className="m-desc">{tx("eSIM du lịch")}{" "}{label}{" "}{tx("dùng được tại")}{" "}<span id="vSub">{coverageLine(p)}</span>. <b>{tx("Một eSIM cho cả chuyến đi nhiều nước")}</b>{tx(", mạng 4G/5G tốc độ cao. Nhận mã QR qua email ngay sau khi mua.")}</p>
          )}{" "}
          <div className="price-row price-row--vch">
            <button className="pv" type="button" id="vchTag" aria-haspopup="dialog" onClick={() => setVch(true)}>
              <span className="price-now" id="priceNet">
                {plan ? vnd(p.net) : "—"}
              </span>
              <span className="pv-lbl">
                <Ic name="ic-ticket" w={14} />
                {p.voucher ? tx("Giá sau voucher") : tx("Chi tiết giá")}
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
                    {vnd(perDay(p.net / p.quantity, p.days))}{tx("/ngày")}{p.quantity > 1 ? tx(" mỗi eSIM") : ""}
                  </span>
                </span>
                <span className="daily-sep" aria-hidden="true">
                  |
                </span>
              </>
            )}
            <span className="daily-detail" id="dOSDetail">
              {plan ? (p.country ? tx("Gói: {0}", line) : tx("Gói: {0} nước · {1}", n, line)) + (p.quantity > 1 ? ` · ${p.quantity} eSIM` : "") : ""}
            </span>
          </div>
        </div>{" "}
        {p.members.length > 1 && (
          <section className="m-step" aria-labelledby="stepV">
            <h2 className="sec-lbl" id="stepV">
              <span className="sec-num">
                <span className="sr-only">{tx("Bước")}{" "}</span>1
              </span>
              <span className="sr-only">. </span>
              <span>{tx("Chọn phạm vi phủ sóng")}</span>
            </h2>{" "}
            <Variants p={p} />{" "}
            <div className="cov">
              <div className="cov-hd cov-hd--2">
                <span className="cov-t">
                  <b id="covSub">eSIM {label}</b>
                </span>
                <button className="fs-link" type="button" aria-haspopup="dialog" onClick={() => setCtr(true)}>{tx("Xem")}{" "}<span id="covN">{n}{" "}{tx("nước")}</span>
                  <Ic name="ic-chev-right" w={13} />
                </button>
                <CovFlags p={p} max={8} />
              </div>{" "}
              <DestTrigger p={p} onOpen={() => setPick(true)} /> <DestRes p={p} />
            </div>
          </section>
        )}{" "}
        {/* "Chọn số ngày trước" (vande #089): trip, plans, quantity. */}
        <section className="m-step" aria-labelledby="step1">
          <h2 className="sec-lbl" id="step1">
            <span className="sec-num">
              <span className="sr-only">{tx("Bước")}{" "}</span>
              {p.members.length > 1 ? 2 : 1}
            </span>
            <span className="sr-only">. </span>
            <span>{tx("Bạn đi {0} mấy ngày?", label)}</span>
          </h2>{" "}
          <TripDays p={p} mobile onCal={() => setCal(true)} />
        </section>{" "}
        <section className="m-step" aria-labelledby="stepP">
          <h2 className="sec-lbl" id="stepP">
            <span className="sec-num">
              <span className="sr-only">{tx("Bước")}{" "}</span>
              {p.members.length > 1 ? 3 : 2}
            </span>
            <span className="sr-only">. </span>
            <span>{tx("Chọn gói cước cho chuyến")}{" "}<span id="tripSum">{tx("{0} ngày", p.tripDays)}</span></span>
          </h2>{" "}
          <SegTabs p={p} /> <AppFilter p={p} mobile />{" "}
          <PlanPanes p={p} onEkyc={() => setEkyc(true)} mobile plansRef={plansRef} />
        </section>{" "}
        <section className="m-step" aria-labelledby="step2">
          <h2 className="sec-lbl" id="step2">
            <span className="sec-num">
              <span className="sr-only">{tx("Bước")}{" "}</span>
              {p.members.length > 1 ? 4 : 3}
            </span>
            <span className="sr-only">. </span>
            <span>{tx("Số lượng eSIM")}</span>
          </h2>{" "}
          <div className="m-qty">
            <div className="m-row">
              <span className="m-row-l" id="qtyLbl">{tx("Số lượng eSIM")}</span>
              <Qty p={p} labelId="qtyLbl" />
            </div>
            <StockAlert p={p} />
          </div>{" "}
          <div className="trust">
            <div className="ti">
              <Ic name="ic-shield" w={14} />{tx("Thanh toán an toàn")}</div>
            <div className="ti">
              <Ic name="ic-headset" w={14} />{tx("Hỗ trợ 24/7")}</div>
            <div className="ti">
              <Ic name="ic-refund" w={14} />{tx("Hoàn tiền 100%")}</div>
          </div>{" "}
          <p className="dev-note dev-note--lined">
            <Ic name="ic-info" w={14} />
            <span>{tx("Vui lòng kiểm tra thiết bị có hỗ trợ eSIM trước khi thanh toán.")}</span>
            <button className="dev-go" type="button" data-devgo="" onClick={goDeviceCheck}>{tx("Kiểm tra ngay")}<Ic name="ic-chev-right" w={13} />
            </button>
          </p>
        </section>{" "}
        <section className="m-acc" aria-label={tx("Thông tin chi tiết")}>
          <AccItem
            heading
            defaultOpen
            q={
              <>
                <Ic name="ic-gear" w={16} />
                <span>{tx("Tính năng eSIM")}</span>
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
                <span>{tx("Giao hàng & Kích hoạt")}</span>
                <Ic name="ic-chev-down" w={16} />
              </>
            }
          >
            <DeliveryRows plan={plan} />
          </AccItem>{" "}
          <AccItem
            heading
            openSignal={devGo}
            q={
              <>
                <Ic name="ic-device" w={16} />
                <span>{tx("Kiểm tra thiết bị hỗ trợ eSIM")}</span>
                <Ic name="ic-chev-down" w={16} />
              </>
            }
          >
            <section className={`dc dc--sel${devGo ? " is-flash" : ""}`} aria-label={tx("Kiểm tra thiết bị hỗ trợ eSIM")} id="dcCard" key={`dc${devGo}`}>
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
            <h2 className="cross-hd" id="crossHd">{tx("Xem eSIM cho các điểm đến khác")}</h2>{" "}
            <p className="cross-lead">{tx("Mỗi điểm đến có nhà mạng, vùng phủ sóng và bảng giá riêng — chọn gói phù hợp nhất với hành trình và nhu cầu data của bạn.")}</p>{" "}
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
        aria-label={tx("Mua nhanh")}
        ref={buyRef}
      >
        <div className="m-buy-info">
          <div className="m-buy-plan">
            <span id="mPlan">{p.need ? tx("Chưa chọn số ngày") : p.country ? line : tx("{0} nước · {1}", n, line)}</span>
            <span className="m-buy-qty" id="mQty" hidden={p.quantity < 2}>
              {p.quantity} eSIM
            </span>
          </div>
          <button className="m-buy-price" type="button" aria-haspopup="dialog" onClick={() => setVch(true)}>
            <Ic name="ic-ticket" w={14} />
            <span className="sr-only">{p.voucher ? tx("Giá sau voucher ") : tx("Giá ")}</span>
            <span id="mTotal">{vnd(p.net)}</span>
            {p.net < p.total && (
              <>
                <span className="sr-only">{tx(", giá trước voucher")}{" "}</span>
                <s className="m-buy-old" id="mTotalOld">
                  {vnd(p.total)}
                </s>
              </>
            )}
          </button>
        </div>{" "}
        <button className="btn btn-outline m-cart" type="button" aria-label={tx("Thêm vào giỏ hàng")} disabled={!plan} aria-disabled={p.need} data-dgo="" onClick={() => p.addToCart()}>
          <Ic name="ic-cart" w={20} />
        </button>{" "}
        <button className="btn btn-primary m-buy-cta" type="button" id="buyBtn" disabled={!plan} aria-disabled={p.need} data-dgo="" onClick={() => p.buyNow()}>{tx("Mua ngay")}</button>
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
                <div className="modal-title modal-title--sm" id="vpT">{tx("Chi tiết giá")}</div>
                <p className="modal-desc" id="vchPlan">
                  {p.quantity} eSIM · {p.country ? line : (<>{n}{" "}{tx("nước ·")}{" "}{line}</>)}
                </p>
              </div>
              <button className="btn-close" type="button" aria-label={tx("Đóng")} data-close="">
                <Ic name="ic-x" w={24} />
              </button>
            </div>
          </div>{" "}
          <div className="modal-body">
            <VoucherRows p={p} />
          </div>{" "}
          <div className="modal-ft">
            <button className="btn btn-block btn-dark" type="button" data-close="">{tx("Đã hiểu")}</button>
          </div>
        </div>
      </Overlay>
    </div>
  );
}
