"use client";



import { tr, useT } from "../../local-esim/design/design-i18n";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { getCloudinaryTransformedUrl } from "@/lib/image-utils";
import { Ic } from "../../local-esim/design/nd-icons";
import { DeviceCheck, DeviceModal, Qty, StockAlert, VoucherBreakdown, type Brand } from "../../local-esim/design/nd-parts";
import { vnd } from "../../local-esim/design/nd-state";
import { perDay } from "./rg-model";
import type { RegionPurchase } from "./rg-state";
import {
  AppFilter,
  CalendarModal,
  CountriesModal,
  CovFlags,
  CrossCards,
  DayChips,
  DaysField,
  DeliveryRows,
  DestPicker,
  DestRes,
  EkycModal,
  FeatureRows,
  NeedHint,
  PlanPanes,
  SegTabs,
  Variants,
  planText,
  Flag,
} from "./rg-parts";

const HERO = "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&q=60";

interface Props {
  p: RegionPurchase;
  /** "Châu Á" — the region's name without the country count. */
  label: string;
  lang: string;
  breadcrumb: { home: string; destinations: string };
}

/** Carriers of a country page's plans, "China Unicom, China Mobile" (vande #032). */
export function countryCarriers(p: RegionPurchase): string {
  const all = [...p.all.dataPlans, ...p.all.slowUnlimited, ...p.all.fastUnlimited, ...p.all.dailyUnlimited];
  const names = new Set<string>();
  for (const plan of all) {
    for (const op of String(plan.operatorName ?? "").split(",")) {
      const name = op.trim();
      if (name) names.add(name);
    }
  }
  return Array.from(names).slice(0, 3).join(", ");
}

/** "18 điểm đến: Nhật Bản, Hàn Quốc, Thái Lan, Singapore và 14 nước khác". */
export function coverageLine(p: RegionPurchase): string {
  // Names in the page language (vande #029): titleVi first only on /vi.
  const names = (p.member?.destinations ?? []).map((d) => (p.lang === "vi" ? d.titleVi || d.title || d.name : d.title || d.name));
  const n = names.length;
  if (!n) return "";
  if (n > 5) return tr(p.lang, "{0} điểm đến: {1} và {2} nước khác", n, names.slice(0, 4).join(", "), n - 4);
  if (n > 1) return tr(p.lang, "{0} điểm đến: {1} và {2}", n, names.slice(0, -1).join(", "), names[n - 1]);
  return tr(p.lang, "{0} điểm đến: {1}", n, names[0]);
}

/**
 * Desktop layout of the region page — a port of "esim-chau-a-desktop-v41.html"
 * (#067, test round 4). Markup and class names follow the design file one to
 * one; the design's script is replaced by React state (rg-state / rg-parts).
 */
export function RgDesktop({ p, label, lang, breadcrumb }: Props) {
  const tx = useT();
  const plan = p.plan;
  const [tab, setTab] = useState<0 | 1>(0);
  const [ctr, setCtr] = useState(false);
  const [ekyc, setEkyc] = useState(false);
  const [cal, setCal] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [devBrand, setDevBrand] = useState<Brand | "">("");
  const [vpop, setVpop] = useState<null | "top" | "bs">(null);
  const [dsel, setDsel] = useState(false);
  const [dsbShow, setDsbShow] = useState(false);
  const [flash, setFlash] = useState(0);

  const priceAnchor = useRef<HTMLDivElement>(null);
  const ctaRow = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);
  const dsbRef = useRef<HTMLDivElement>(null);
  const dcRef = useRef<HTMLElement>(null);
  const leftStick = useRef<HTMLDivElement>(null);

  const n = p.n;
  const line = planText(p, p.lang);
  const qtyTail = p.quantity > 1 ? ` · ${p.quantity} eSIM` : "";
  const hero = getCloudinaryTransformedUrl(
    // The chosen variant's CMS picture, else any variant's, before the design's photo (vande #029).
    p.member?.avatarUrl || p.members.find((m) => m.avatarUrl)?.avatarUrl,
    { width: 940, height: 640, quality: "auto:good", gravity: "center" });

  // Sticky bar: shown once the price has scrolled away, the plans are in
  // reach and the main buy row is not on screen (design's stickyBar).
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
      setDsbShow(
        a.getBoundingClientRect().bottom < 0 &&
          (!plans || (scrollY > 0 && plans.getBoundingClientRect().top < innerHeight - bar.offsetHeight)) &&
          !visible(cta),
      );
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, []);

  // The left column sticks, but never under the sticky bar.
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
        <VoucherBreakdown p={p} planLine={p.country ? tx("{0} eSIM · {1}", p.quantity, line) : tx("{0} eSIM · {1} nước · {2}", p.quantity, n, line)} />
      </div>
    );

  /** "Chọn số ngày": open the dropdown and bring it into view. */
  const goDays = () => {
    setDsel(true);
    requestAnimationFrame(() => document.getElementById("dock")?.scrollIntoView({ block: "center", behavior: "smooth" }));
  };
  const guard = (fn: () => unknown) => () => {
    if (p.need) goDays();
    else fn();
  };
  const goDeviceCheck = () => {
    dcRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    setFlash((f) => f + 1);
  };

  return (
    <div className="rgd airy crisp tv">
      <nav aria-label="Breadcrumb" className="bc bc--c">
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
      <aside aria-label={tx("Lưu ý trước chuyến đi")} className="pre-wrap">
        <div className="pre-note" role="note">
          <Ic name="ic-info" w={16} />
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
      </aside>{" "}
      <main className="main">
        <div className="pd-top">
          {" "}
          <div className="pd-hd">
            <div className="pic-title-row">
              {p.country ? (
                <Flag code={p.country.countryCode || ""} url={p.country.flagUrl ?? undefined} w={28} h={21} />
              ) : (
              <span className="pic-logo" aria-hidden="true">
                <Ic name="ic-globe" w={16} />
              </span>
              )}
              <h1 className="pic-title">eSIM {label}</h1>
              {!p.country && (
              <button className="pill pill--sm pill--cnt pill--link pill--neutral" type="button" id="vBadge" aria-haspopup="dialog" onClick={() => setCtr(true)}>
                {n}{" "}{tx("quốc gia")}</button>
              )}
            </div>
          </div>{" "}
          <div className="buy-sum">
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
                id="vchTag"
                aria-controls="vchPop"
                aria-expanded={vpop === "top"}
                data-vpop=""
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
                {plan ? (p.country ? tx("Gói: {0}{1}", line, qtyTail) : tx("Gói: {0} nước · {1}{2}", n, line, qtyTail)) : ""}
              </span>
            </div>
          </div>{" "}
        </div>{" "}
        <div className="left-col left-col--stick" ref={leftStick}>
          <div className="pd-img" style={{ "--hero-bg": "linear-gradient(160deg,#E8824A,#FAC96A,#7BAFC0)" } as CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={tx("Phong cảnh {0}", label)}
              decoding="async"
              fetchPriority="high"
              height={480}
              width={720}
              sizes="(max-width:56.25rem) 100vw, 29rem"
              src={hero || `${HERO}&w=720&h=480`}
              onError={(e) => e.currentTarget.remove()}
            />
          </div>{" "}
          <article aria-label={tx("Thông tin eSIM {0}", label)} className="pic">
            <div className="pic-body">
              {p.country ? (
                <p className="pic-sub">
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
              <p className="pic-sub">{tx("eSIM du lịch")}{" "}{label}{" "}{tx("dùng được tại")}{" "}<span id="vSub">{coverageLine(p)}</span>. <b>{tx("Một eSIM cho cả chuyến đi nhiều nước")}</b>{tx(", mạng 4G/5G tốc độ cao. Nhận mã QR qua email ngay sau khi mua.")}</p>
              )}{" "}
              <div className="dt-tabs" role="tablist" aria-label={tx("Chi tiết eSIM")}>
                {([tx("Tính năng eSIM"), tx("Giao hàng & Kích hoạt")] as const).map((t, i) => (
                  <button
                    key={t}
                    className="dt-tab"
                    type="button"
                    id={`tab-dt${i}`}
                    aria-controls={`dt${i}`}
                    aria-selected={tab === i}
                    tabIndex={tab === i ? 0 : -1}
                    role="tab"
                    onClick={() => setTab(i as 0 | 1)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                        e.preventDefault();
                        const next = tab === 0 ? 1 : 0;
                        setTab(next);
                        document.getElementById(`tab-dt${next}`)?.focus();
                      }
                    }}
                  >
                    <Ic name={i ? "ic-box" : "ic-gear"} w={13} />
                    {t}
                  </button>
                ))}
              </div>{" "}
              <div className="dt-pane" id="dt0" role="tabpanel" aria-labelledby="tab-dt0" hidden={tab !== 0}>
                <FeatureRows p={p} onEkyc={() => setEkyc(true)} onCountries={() => setCtr(true)} />
              </div>{" "}
              <div className="dt-pane" id="dt1" role="tabpanel" aria-labelledby="tab-dt1" hidden={tab !== 1}>
                <DeliveryRows plan={plan} />
              </div>
            </div>
          </article>{" "}
          <section aria-labelledby="dcTitle" className={`dc dc--flat dc--sel${flash ? " is-flash" : ""}`} id="dcCard" ref={dcRef} key={`dc${flash}`}>
            <div className="dc-hd">
              <div className="dc-ico">
                <Ic name="ic-device" w={18} />
              </div>
              <h2 className="dc-title" id="dcTitle">{tx("Kiểm tra thiết bị hỗ trợ eSIM")}</h2>
            </div>{" "}
            <DeviceCheck
              lang={lang}
              onAll={(b) => {
                setDevBrand(b);
                setDevOpen(true);
              }}
            />
          </section>
        </div>{" "}
        <div className="rc--tight right-col">
          {p.members.length > 1 && (
            <section aria-labelledby="stepV" className="block">
              <h2 className="sec-lbl" id="stepV">
                <span className="sec-num">
                  <span className="sr-only">{tx("Bước")}{" "}</span>1
                </span>
                <span className="sr-only">. </span>
                <span>{tx("Chọn phạm vi phủ sóng")}</span>
              </h2>{" "}
              <Variants p={p} />{" "}
              <div className="cov">
                <div className="cov-hd">
                  <CovFlags p={p} max={7} />
                  <span className="cov-t">
                    <b id="covSub">eSIM {label}</b> · <span id="covN">{n}{" "}{tx("nước")}</span>
                  </span>
                  <button className="fs-link" type="button" aria-haspopup="dialog" onClick={() => setCtr(true)}>{tx("Xem tất cả")}<Ic name="ic-chev-right" w={14} />
                  </button>
                </div>{" "}
                <DestPicker p={p} /> <DestRes p={p} />
              </div>
            </section>
          )}{" "}
          <section aria-labelledby="step1" className="block">
            <h2 className="sec-lbl" id="step1">
              <span className="sec-num">
                <span className="sr-only">{tx("Bước")}{" "}</span>
                {p.members.length > 1 ? 2 : 1}
              </span>
              <span className="sr-only">. </span>
              <span>{tx("Chọn gói cước")}</span>
            </h2>{" "}
            <SegTabs p={p} /> <AppFilter p={p} />{" "}
            <PlanPanes p={p} dselOpen={dsel} setDselOpen={setDsel} onEkyc={() => setEkyc(true)} plansRef={plansRef} />
          </section>{" "}
          <section aria-labelledby="step2" className="block block--last">
            <h2 className="sec-lbl" id="step2">
              <span className="sec-num">
                <span className="sr-only">{tx("Bước")}{" "}</span>
                {p.members.length > 1 ? 3 : 2}
              </span>
              <span className="sr-only">. </span>
              <span>{tx("Tùy chọn của bạn")}</span>
            </h2>{" "}
            <div className="cust-row cust-row--sc">
              <div>
                <span className="cust-lbl" id="daysLbl">{tx("Số ngày dùng")}</span>
                <DaysField p={p} cls="days-field" onCal={() => setCal(true)} onGo={goDays} />
              </div>
              <div>
                <span className="cust-lbl" id="qtyLbl">{tx("Số lượng eSIM")}</span>
                <Qty p={p} labelId="qtyLbl" />
              </div>
            </div>{" "}
            <DayChips p={p} onCal={() => setCal(true)} /> <StockAlert p={p} /> <NeedHint p={p} onGo={goDays} />{" "}
            <div className="buy-row" id="ctaRow" ref={ctaRow}>
              <div className="bs">
                <div className="bs-l">
                  <p className="bs-plan">
                    {p.country ? <Flag code={p.country.countryCode || ""} url={p.country.flagUrl ?? undefined} w={18} h={13.5} /> : <Ic name="ic-globe" w={14} />}
                    <span>
                      <span id="mPlan">{p.need ? tx("Chưa chọn số ngày") : p.country ? line : tx("{0} nước · {1}", n, line)}</span>
                      <span className="bs-qty" id="mQty" hidden={p.quantity < 2}>
                        {p.quantity} eSIM
                      </span>
                    </span>
                  </p>
                  <BsApps p={p} />
                </div>{" "}
                <div className="bs-r">
                  <p className="bs-total">
                    <span className="sr-only">{tx("Giá trước voucher")}{" "}</span>
                    {p.net < Math.max(p.total, p.listTotal) && (
                      <s className="bs-old" id="mTotalOld">
                        {vnd(Math.max(p.total, p.listTotal))}
                      </s>
                    )}
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
                      <span>{tx("Giá sau voucher · tiết kiệm")}{" "}<span id="mSave">{vnd(p.total - p.net)}</span>
                      </span>
                      <Ic name="ic-chev-down" w={12} />
                    </button>
                  )}
                  {popover("bs")}
                </div>
              </div>{" "}
              <button className="btn btn-lg btn-outline" type="button" data-cart="" disabled={!plan} aria-disabled={p.need} data-dgo="" onClick={guard(p.addToCart)}>
                <Ic name="ic-cart" w={18} />{tx("Thêm vào giỏ hàng")}</button>{" "}
              <button className="btn btn-lg btn-primary" type="button" id="buyBtn" disabled={!plan} aria-disabled={p.need} data-dgo="" onClick={guard(p.buyNow)}>{tx("Mua ngay")}</button>
            </div>
          </section>{" "}
          <div className="trust trust--lined">
            {[
              ["ic-shield", tx("Thanh toán an toàn"), tx("Thẻ, Apple Pay, Google Pay")],
              ["ic-headset", tx("Hỗ trợ 24/7"), tx("Qua chat, Zalo, WhatsApp")],
              ["ic-refund", tx("Hoàn tiền 100%"), tx("Nếu eSIM chưa kích hoạt")],
            ].map(([ic, b, s]) => (
              <div className="ti" key={ic}>
                <span className="ti-ic">
                  <Ic name={ic} w={16} />
                </span>
                <span className="ti-t">
                  <b>{b}</b>
                  <small>{s}</small>
                </span>
              </div>
            ))}
          </div>{" "}
          <p className="dev-note dev-note--lined">
            <Ic name="ic-info" w={14} />
            <span>{tx("Vui lòng kiểm tra thiết bị có hỗ trợ eSIM trước khi thanh toán.")}</span>
            <button className="dev-go" type="button" onClick={goDeviceCheck}>{tx("Kiểm tra ngay")}<Ic name="ic-chev-right" w={13} />
            </button>
          </p>
        </div>
      </main>{" "}
      {(p.member?.destinations?.length ?? 0) > 1 && (
        <section aria-labelledby="crossHd" className="cross">
          <h2 className="cross-hd" id="crossHd">{tx("Xem eSIM cho các điểm đến khác")}</h2>{" "}
          <p className="cross-lead">{tx("Mỗi điểm đến có nhà mạng, vùng phủ sóng và bảng giá riêng — chọn gói phù hợp nhất với hành trình và nhu cầu data của bạn.")}</p>{" "}
          <div className="cross-grid cross-grid--3">
            <CrossCards p={p} lang={lang} />
          </div>
        </section>
      )}{" "}
      <CountriesModal p={p} open={ctr} onClose={() => setCtr(false)} />
      <EkycModal p={p} open={ekyc} onClose={() => setEkyc(false)} lang={lang} />
      <CalendarModal p={p} open={cal} onClose={() => setCal(false)} />
      <DeviceModal open={devOpen} onClose={() => setDevOpen(false)} lang={lang} initialBrand={devBrand} />
      <div className={`dsb${dsbShow ? " show" : ""}`} id="dsb" role="region" aria-label={tx("Mua nhanh")} ref={dsbRef}>
        <div className="dsb-inner">
          <div className="dsb-l">
            <span className="dsb-logo" aria-hidden="true">
              {p.country ? <Flag code={p.country.countryCode || ""} url={p.country.flagUrl ?? undefined} w={24} h={18} /> : <Ic name="ic-globe" w={18} />}
            </span>
            <div className="dsb-info">
              <div className="dsb-name">
                eSIM {label}{!p.country && (<> · <span id="dsbV">{n}{" "}{tx("quốc gia")}</span></>)}
              </div>
              <div className="dsb-plan" id="dsbPlan">
                {plan ? tx("Gói: {0}", line) : ""}
              </div>
            </div>
          </div>{" "}
          <div className="dsb-r">
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
            <button className="btn btn-sm btn-outline dsb-cart" type="button" disabled={!plan} aria-disabled={p.need} data-dgo="" onClick={guard(p.addToCart)}>
              <Ic name="ic-cart" w={16} />{tx("Thêm vào giỏ hàng")}</button>{" "}
            <button className="btn btn-primary btn-sm" type="button" disabled={!plan} aria-disabled={p.need} data-dgo="" onClick={guard(p.buyNow)}>{tx("Mua ngay")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** "Dùng được TikTok, ChatGPT & Claude" under the plan in the buy row. */
export function BsApps({ p }: { p: RegionPurchase }) {
  const tx = useT();
  if (p.apps === "unknown" || p.need) return null;
  return (
    <p className="bs-apps">
      {p.apps === "all" ? (
        <span className="is-ok">
          <Ic name="ic-check-circle" w={15} />{tx("Dùng được TikTok, ChatGPT & Claude")}</span>
      ) : p.apps === "notiktok" ? (
        <span className="is-no">
          <Ic name="ic-no" w={15} />{tx("Không dùng được TikTok")}</span>
      ) : (
        <span className="is-no">
          <Ic name="ic-no" w={15} />{tx("Không dùng được TikTok, ChatGPT")}</span>
      )}
    </p>
  );
}
