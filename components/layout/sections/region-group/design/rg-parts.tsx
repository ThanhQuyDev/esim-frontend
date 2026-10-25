"use client";



import { tr } from "../../local-esim/design/design-i18n-core";
import { useDesignLang, useT } from "../../local-esim/design/design-i18n";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Destination, Plan } from "@/lib/api";
import { worksWithTiktokAndChatGpt } from "@/lib/plan-tiktok";
import { formatActivationDate } from "@/lib/plan-activation";
import { dailyResetText } from "@/lib/plan-daily-reset";
import { refundRule } from "@/lib/plan-refund";
import { planVoiceInfo } from "@/lib/plan-voice";
import { localizedSlug } from "@/lib/slug";
import { Ic } from "../../local-esim/design/nd-icons";
import { AccItem, Overlay, Tip, radioKeys } from "../../local-esim/design/nd-parts";
import { vnd } from "../../local-esim/design/nd-state";
import { POPULAR_DAYS_DESKTOP, POPULAR_DAYS_MOBILE } from "../../destination/day-options";
import { SPRITE_FLAGS } from "./rg-icons";
import {
  badgeFor,
  chipDaysFor,
  gbLabel,
  joinVi,
  perDay,
  planForDays,
  priceOf,
  type Badge,
  type Opt,
  type Tier,
} from "./rg-model";
import { countOf, type RegionPurchase } from "./rg-state";

/* ───────────── small pieces ───────────── */

/**
 * A country flag: the one set for the destination in the CMS, else the
 * design's own drawing (vande #029 — the drawing used to win, so a flag
 * changed in the CMS never showed).
 */
export function Flag({ code, url, w, h, cls = "flag" }: { code: string; url?: string; w: number; h: number; cls?: string }) {
  const c = code.toLowerCase();
  if (!url && SPRITE_FLAGS.has(c)) return <Ic name={`fl-${c}`} w={w} h={h} cls={cls} />;
  if (!url) return <span className={cls} style={{ display: "inline-block", width: w, height: h }} aria-hidden="true" />;
  // eslint-disable-next-line @next/next/no-img-element
  // Sized inline: the mobile hero stretches every <img> inside it to cover.
  return <img className={`${cls} rg-flag-img`} src={url} alt="" width={w} height={h} loading="lazy" decoding="async" style={{ position: "static", width: w, height: h }} />;
}

export function Pbi({ b }: { b: Badge | null }) {
  const tx = useT();
  return b ? <span className={`pbi ${b.cls}`}>{tx(b.label)}</span> : null;
}

const count = (p: RegionPurchase, i: number) => countOf(p.members[i]);

/** "18 nước · 1 GB – 7 ngày" and friends (design's `y`). */
export function planText(p: RegionPurchase, lang: string): string {
  if (!p.plan) return "";
  if (p.need && p.tier) return tr(lang, "{0} – chưa chọn số ngày", p.tier.gb);
  return `${optLabel(p, lang)}${p.perDayKind ? tr(lang, " · {0} ngày", p.days) : ""}`;
}

/** The chip's own label (design's `data-label`). */
export function optLabel(p: RegionPurchase, lang: string): string {
  if (p.tier && p.plan) return tr(lang, "{0} – {1} ngày", p.tier.gb, p.plan.durationDays);
  const o = p.opt;
  if (!o || !p.plan) return "";
  if (o.kind === "combo") return comboLabel(p.plan, lang);
  if (o.kind === "daily") return tr(lang, "{0}/ngày", o.gb);
  if (o.gb) return tr(lang, "{0}/ngày · sau đó {1}", o.gb, o.throttle);
  return o.throttle ? tr(lang, "Không giới hạn · {0}", o.throttle) : tr(lang, "Không giới hạn · tốc độ cao nhất");
}

function comboLabel(plan: Plan, lang: string): string {
  const parts = [gbLabel(Number(plan.dataMb))];
  if (plan.call) parts.push(tr(lang, "{0} phút", plan.call));
  if (plan.sms) parts.push(`${plan.sms} SMS`);
  return tr(lang, "{0} – {1} ngày", parts.filter(Boolean).join(" + "), plan.durationDays);
}

/* ───────────── step 1: coverage variants ───────────── */

export function Variants({ p }: { p: RegionPurchase }) {
  const tx = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ l: false, r: false });
  const fit = p.fit;

  // Keep the chosen variant in view and show the edge fades (design's G/F).
  useEffect(() => {
    const n = ref.current;
    if (!n) return;
    const upd = () => {
      const max = n.scrollWidth - n.clientWidth;
      setEdge({ l: n.scrollLeft > 2, r: n.scrollLeft < max - 2 });
    };
    const el = n.querySelector<HTMLElement>('[aria-checked="true"]');
    if (el && n.scrollWidth > n.clientWidth) {
      const pad = parseFloat(getComputedStyle(n).scrollPaddingLeft) || 0;
      const left = el.offsetLeft - pad;
      const right = el.offsetLeft + el.offsetWidth + pad;
      if (left < n.scrollLeft) n.scrollTo({ left, behavior: "smooth" });
      else if (right > n.scrollLeft + n.clientWidth) n.scrollTo({ left: right - n.clientWidth, behavior: "smooth" });
    }
    upd();
    n.addEventListener("scroll", upd, { passive: true });
    addEventListener("resize", upd);
    return () => {
      n.removeEventListener("scroll", upd);
      removeEventListener("resize", upd);
    };
  }, [p.active]);

  return (
    <div
      className={`rng${edge.l ? " is-l" : ""}${edge.r ? " is-r" : ""}`}
      id="variants"
      role="radiogroup"
      aria-labelledby="stepV"
      ref={ref}
      onKeyDown={(e) => radioKeys(e, (el) => p.setActive(Number(el.dataset.i)))}
      onWheel={(e) => {
        const n = ref.current;
        if (!n) return;
        const max = n.scrollWidth - n.clientWidth;
        if (!max || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        if ((e.deltaY > 0 && n.scrollLeft < max - 1) || (e.deltaY < 0 && n.scrollLeft > 0)) n.scrollLeft += e.deltaY;
      }}
    >
      {p.members.map((m, i) => {
        const codes = (m.destinations ?? []).map((d) => (d.countryCode || "").toUpperCase());
        const miss = p.picked.some((c) => !codes.includes(c));
        const price = Number(m.fromPrice);
        return (
          <div
            key={m.id}
            className="rng-o"
            id={`v${m.id}`}
            data-i={i}
            role="radio"
            aria-checked={i === p.active}
            tabIndex={i === p.active ? 0 : -1}
            data-miss={miss || undefined}
            data-cover={p.picked.length > 0 && !miss ? "" : undefined}
            data-fit={fit === i ? "" : undefined}
            onClick={() => p.setActive(i)}
          >
            <span className="rng-n">{count(p, i)}{" "}{tx("nước")}</span>
            {price > 0 && <span className="rng-p">{tx("từ")}{" "}{vnd(price)}</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ───────────── step 1: coverage, country picker, result line ───────────── */

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();

/** "Có trong gói" / "Có ở gói 28 nước" for one country (design's `.dp-s`). */
function pickNote(p: RegionPurchase, code: string, lang: string): string {
  if (p.codes.includes(code)) return tr(lang, "Có trong gói");
  const c = p.countries.find((x) => x.code === code);
  if (!c?.in.length) return "";
  const cheapest = c.in.reduce((a, b) => (Number(p.members[b].fromPrice) < Number(p.members[a].fromPrice) ? b : a));
  return tr(lang, "Có ở gói {0} nước", count(p, cheapest));
}

export function CountryOptions({
  p,
  query,
  activeIdx,
  sheet,
  onPicked,
}: {
  p: RegionPurchase;
  query: string;
  activeIdx: number;
  sheet?: boolean;
  onPicked?: () => void;
}) {
  const tx = useT();
  const q = fold(query.trim());
  const list = p.countries.filter((c) => !q || fold(c.name).includes(q) || c.code.toLowerCase() === q);
  return (
    <ul
      className={`dp-list${sheet ? " dp-list--sheet" : ""}`}
      id="dpList"
      aria-label={tx("Chọn nước bạn sẽ đến")}
      aria-multiselectable="true"
      role="listbox"
      onMouseDown={(e) => e.preventDefault()}
    >
      {list.map((c, i) => (
        <li
          key={c.code}
          className={`dp-o${p.codes.includes(c.code) ? " is-in" : ""}${i === activeIdx ? " is-act" : ""}`}
          id={`dpo-${c.code.toLowerCase()}`}
          role="option"
          aria-selected={p.picked.includes(c.code)}
          data-code={c.code}
          onClick={() => {
            p.togglePick(c.code);
            onPicked?.();
          }}
        >
          <span className="dp-ck" />
          <Flag code={c.code} url={c.flagUrl} w={24} h={18} />
          <span className="dp-n">{c.name}</span>
          <span className="dp-s">{pickNote(p, c.code, p.lang)}</span>
        </li>
      ))}
      <li className="dp-empty" hidden={list.length > 0} role="presentation">{tx("Không tìm thấy nước phù hợp")}</li>
    </ul>
  );
}

function Tags({ p }: { p: RegionPurchase }) {
  const tx = useT();
  return (
    <span className="dp-tags" id="dpTags">
      {p.picked.map((code) => {
        const miss = !p.codes.includes(code);
        const name = p.nameOf(code);
        const c = p.countries.find((x) => x.code === code);
        return (
          <button
            key={code}
            type="button"
            className={`dp-tag${miss ? " is-miss" : ""}`}
            data-code={code}
            aria-label={tx("Bỏ {0}{1}", name, miss ? " (gói đang chọn không có)" : "")}
            onClick={(e) => {
              e.stopPropagation();
              p.togglePick(code, false);
            }}
          >
            <Flag code={code} url={c?.flagUrl} w={18} h={13.5} />
            {name}
            <Ic name="ic-close" w={10} />
          </button>
        );
      })}
    </span>
  );
}

/** Desktop picker: tags + combobox input + dropdown list (design's `#destPick`). */
export function DestPicker({ p }: { p: RegionPurchase }) {
  const tx = useT();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [act, setAct] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [multi, setMulti] = useState(false);

  const q = fold(query.trim());
  const visible = p.countries.filter((c) => !q || fold(c.name).includes(q));

  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.isConnected && !t.closest("#destPick")) setOpen(false);
    };
    document.addEventListener("click", off);
    return () => document.removeEventListener("click", off);
  }, [open]);

  useEffect(() => {
    const b = box.current;
    if (!b || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setMulti(b.offsetHeight > parseFloat(getComputedStyle(b).minHeight) + 6));
    ro.observe(b);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    document.getElementById(`dpo-${visible[act]?.code.toLowerCase()}`)?.scrollIntoView({ block: "nearest" });
  }, [act]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="dp" id="destPick">
      {" "}
      <div
        className={`dp-box${multi ? " is-multi" : ""}`}
        ref={box}
        onMouseDown={(e) => {
          const t = e.target as HTMLElement;
          if (t === input.current || t.closest(".dp-tag")) return;
          e.preventDefault();
          input.current?.focus();
        }}
      >
        <Ic name="ic-search" w={16} />
        <Tags p={p} />
        <input
          ref={input}
          aria-label={tx("Nước bạn sẽ đến")}
          autoComplete="off"
          placeholder={p.picked.length ? tx("Thêm nước khác…") : tx("Bạn sẽ đến nước nào? Nhập tên nước để kiểm tra")}
          id="dpInput"
          aria-autocomplete="list"
          aria-controls="dpList"
          aria-expanded={open}
          aria-activedescendant={act >= 0 && visible[act] ? `dpo-${visible[act].code.toLowerCase()}` : undefined}
          className="dp-in"
          role="combobox"
          spellCheck={false}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setAct(e.target.value ? 0 : -1);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setAct((a) => Math.min(a + 1, visible.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setAct((a) => Math.max(a - 1, -1));
            } else if (e.key === "Enter") {
              const c = visible[act];
              if (c && open) {
                e.preventDefault();
                p.togglePick(c.code);
                if (query) setQuery("");
              }
            } else if (e.key === "Escape") {
              if (open) {
                e.stopPropagation();
                setOpen(false);
              }
            } else if (e.key === "Backspace" && !query && p.picked.length) {
              p.togglePick(p.picked[p.picked.length - 1], false);
            } else if (e.key === "Tab") setOpen(false);
          }}
        />
        <button
          className="search-clr dp-x"
          type="button"
          aria-label={tx("Xoá chữ đang nhập")}
          id="dpX"
          hidden={!query}
          onClick={() => {
            setQuery("");
            input.current?.focus();
          }}
        >
          <Ic name="ic-close" w={14} />
        </button>
        <button
          className="dp-clr"
          type="button"
          aria-label={tx("Xóa hết nước đã chọn")}
          id="dpClear"
          hidden={!p.picked.length || !!query}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            p.clearPicked();
          }}
        >{tx("Xóa hết")}</button>
      </div>{" "}
      {open && (
        <CountryOptions
          p={p}
          query={query}
          activeIdx={act}
          onPicked={() => {
            if (query) setQuery("");
          }}
        />
      )}{" "}
    </div>
  );
}

/** Mobile picker: tags + a button that opens the picker sheet (`#dpOv`). */
export function DestTrigger({ p, onOpen }: { p: RegionPurchase; onOpen: () => void }) {
  const tx = useT();
  return (
    <div className="dp" id="destPick">
      {" "}
      <div
        className="dp-box"
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest(".dp-tag,.dp-trig,.dp-clr")) onOpen();
        }}
      >
        <Ic name="ic-search" w={16} />
        <Tags p={p} />
        <button className="dp-trig" type="button" id="dpTrig" aria-haspopup="dialog" onClick={onOpen}>
          {p.picked.length ? tx("Thêm nước") : tx("Bạn sẽ đến nước nào?")}
        </button>
        <button className="dp-clr" type="button" id="dpClear" aria-label={tx("Xóa hết nước đã chọn")} hidden={!p.picked.length} onClick={p.clearPicked}>{tx("Xóa hết")}</button>
      </div>{" "}
    </div>
  );
}

export function PickerSheet({ p, open, onClose }: { p: RegionPurchase; open: boolean; onClose: () => void }) {
  const tx = useT();
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);
  const fit = p.fit;
  return (
    <Overlay id="dpOv" open={open} onClose={onClose}>
      <div className="modal" role="dialog" aria-labelledby="dpTitle" aria-modal="true">
        <div className="modal-hd">
          <div className="modal-top">
            <div>
              <div className="modal-title modal-title--sm" id="dpTitle">{tx("Bạn sẽ đến nước nào?")}</div>
              <p className="modal-desc">{tx("Chọn một hoặc nhiều nước — gói rẻ nhất phủ đủ được chọn sẵn.")}</p>
            </div>
            <button className="btn-close" type="button" aria-label={tx("Đóng")} data-close="">
              <Ic name="ic-x" w={24} />
            </button>
          </div>
          <div className="search dp-search">
            <Ic name="ic-search" w={16} />
            <input
              aria-label={tx("Tìm nước")}
              autoComplete="off"
              placeholder={tx("Tìm tên nước…")}
              type="search"
              id="dpInput"
              aria-autocomplete="list"
              aria-controls="dpList"
              aria-expanded="true"
              className="dp-in"
              role="combobox"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="search-clr" type="button" id="dpX" aria-label={tx("Xoá chữ đang tìm")} hidden={!query} onClick={() => setQuery("")}>
              <Ic name="ic-close" w={14} />
            </button>
          </div>
        </div>
        <div className="modal-body" tabIndex={0}>
          <CountryOptions p={p} query={query} activeIdx={-1} sheet />
        </div>
        <div className="modal-ft">
          <p className={`dp-sum${p.picked.length ? (fit !== null ? " is-ok" : " is-warn") : ""}`} id="dpSum" aria-live="polite">
            {p.picked.length ? (
              fit !== null ? (
                <>
                  <Ic name="ic-check-circle" w={14} />
                  <span>{tx("Gói")}{" "}<b>{count(p, fit)}{" "}{tx("nước")}</b>{" "}{tx("phủ đủ")}{" "}{p.picked.length}{" "}{tx("nước bạn chọn")}</span>
                </>
              ) : (
                <>
                  <Ic name="ic-warning" w={14} />
                  <span>{tx("Chưa có gói phủ đủ các nước này")}</span>
                </>
              )
            ) : (
              tx("Chọn nước để được gợi ý gói rẻ nhất.")
            )}
          </p>
          <button className="btn btn-block btn-dark" type="button" data-close="">{tx("Xong")}</button>
        </div>
      </div>
    </Overlay>
  );
}

/** The verdict under the picker (design's `j()` → `#destRes`). */
export function DestRes({ p }: { p: RegionPurchase }) {
  const tx = useT();
  const n = p.picked;
  if (!n.length) return <p className="dest-res" id="destRes" aria-live="polite" hidden role="status" />;
  const cur = p.active;
  const fit = p.fit;
  const missing = n.filter((c) => !p.codes.includes(c));
  const names = (list: string[]) => joinVi(list.map(p.nameOf), p.lang);
  const go = (i: number, text: string) => (
    <button type="button" className="res-go" onClick={() => p.setActive(i)}>
      {text}
      <Ic name="ic-chev-right" w={12} />
    </button>
  );
  const line = (icon: string, body: ReactNode) => (
    <span className="res-t">
      <Ic name={`ic-${icon}`} w={14} />
      <span>{body}</span>
    </span>
  );
  const priceRatio = (a: number, b: number) => {
    const pa = Number(p.members[a].fromPrice);
    const pb = Number(p.members[b].fromPrice);
    return pa > 0 && pb > 0 ? Math.round(100 * (1 - pa / pb)) : 0;
  };
  let body: ReactNode;
  if (missing.length) {
    body = (
      <>
        {line(
          "warning",
          missing.length < 3
            ? tx("Gói {0} nước chưa có {1}", count(p, cur), names(missing))
            : tx("Gói {0} nước thiếu {1}/{2} nước bạn chọn", count(p, cur), missing.length, n.length),
        )}
        {fit !== null && go(fit, tx("Đổi sang gói {0} nước", count(p, fit)))}
      </>
    );
  } else {
    const ok = line(
      "check-circle",
      <>{tx("Gói")}{" "}<strong>{count(p, cur)}{" "}{tx("nước")}</strong>{" "}{tx("phủ đủ")}{" "}{n.length < 3 ? names(n) : tx("cả {0} nước bạn chọn", n.length)}
      </>,
    );
    if (fit !== null && fit !== cur) {
      const save = priceRatio(fit, cur);
      body = (
        <>
          {ok}
          {go(fit, tx("Đổi sang gói {0} nước", count(p, fit)) + (save > 0 ? tx(", rẻ hơn {0}%", save) : ""))}
        </>
      );
    } else {
      const save = cur !== 0 ? priceRatio(cur, 0) : 0;
      body = (
        <>
          {ok}
          {save > 0 && <span className="res-save">{tx("Rẻ hơn")}{" "}{save}{tx("% so với gói")}{" "}{count(p, 0)}{" "}{tx("nước")}</span>}
        </>
      );
    }
  }
  return (
    <p className={`dest-res ${missing.length ? "is-warn" : "is-ok"}`} id="destRes" aria-live="polite" role="status">
      {body}
    </p>
  );
}

/** Flags of the chosen variant (`#covFlags`), at most `max` then "+N". */
export function CovFlags({ p, max }: { p: RegionPurchase; max: number }) {
  const list = p.member?.destinations ?? [];
  const shown = list.length > max + 1 ? max : list.length;
  return (
    <span className="cov-flags" id="covFlags" aria-hidden="true" data-max={max}>
      {list.slice(0, shown).map((d) => (
        <span className="cov-f" key={d.id}>
          <Flag code={d.countryCode || ""} url={d.flagUrl} w={29} h={22} />
        </span>
      ))}
      {list.length > shown && <span className="cov-more">+{list.length - shown}</span>}
    </span>
  );
}

/* ───────────── step 2: tabs, app filter, plans ───────────── */

export function SegTabs({ p }: { p: RegionPurchase }) {
  const tx = useT();
  const nData = p.plans.dataPlans.length + p.plans.slowUnlimited.length + p.plans.fastUnlimited.length + p.plans.dailyUnlimited.length;
  const nCombo = p.plans.smsCallEsim?.length ?? 0;
  if (!nCombo) return null;
  const tab = (key: "data" | "combo", icon: string, label: string, n: number) => (
    <button
      className="seg-btn"
      type="button"
      id={`tab-${key}`}
      aria-controls={key === "data" ? "paneData" : "paneCombo"}
      aria-selected={p.tab === key}
      tabIndex={p.tab === key ? 0 : -1}
      role="tab"
      onClick={() => p.switchTab(key)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          const next = key === "data" ? "combo" : "data";
          p.switchTab(next);
          document.getElementById(`tab-${next}`)?.focus();
        }
      }}
    >
      <Ic name={icon} w={15} />
      {label}
      <span className="seg-n">
        <span id={key === "data" ? "nData" : "nCombo"}>{n}</span>
        <span className="sr-only">{" "}{tx("gói")}</span>
      </span>
    </button>
  );
  return (
    <div className="seg" id="segType" role="tablist" aria-label={tx("Loại gói")}>
      {tab("data", "ic-wifi", tx("Chỉ Data"), nData)} {tab("combo", "ic-phone", tx("Data + Gọi + SMS"), nCombo)}
    </div>
  );
}

export function AppFilter({ p, mobile }: { p: RegionPurchase; mobile?: boolean }) {
  const tx = useT();
  const [ping, setPing] = useState(false);
  const hint = !p.appFilter && p.picked.includes("CN");
  const was = useRef(false);
  useEffect(() => {
    if (hint && !was.current) setPing(true);
    was.current = hint;
  }, [hint]);
  if (!p.showFilter) return null;
  const tabPlans =
    p.tab === "combo"
      ? (p.all.smsCallEsim ?? [])
      : [...p.all.dataPlans, ...p.all.slowUnlimited, ...p.all.fastUnlimited, ...p.all.dailyUnlimited];
  const ok = tabPlans.filter(worksWithTiktokAndChatGpt).length;
  const of = <b>{`${ok}/${tabPlans.length} eSIM`}</b>;
  return (
    <button
      className={`af${hint ? " is-hint" : ""}${ping ? " is-ping" : ""}`}
      type="button"
      id="appFilter"
      role="switch"
      aria-checked={p.appFilter}
      aria-describedby="afSub"
      aria-labelledby="afH"
      onClick={() => p.toggleAppFilter(!p.appFilter)}
      onAnimationEnd={() => setPing(false)}
    >
      {!mobile && (
        <span className="af-ic">
          <Ic name="ic-unlock" w={18} />
        </span>
      )}
      <span className="af-t">
        <span className="af-h" id="afH">{tx("Lọc eSIM dùng được")}{" "}
          <span className="af-apps">
            <span className="af-app">TikTok</span>
            <span className="sr-only">, </span>
            <span className="af-app">ChatGPT</span>
            <span className="sr-only">{" "}{tx("và")}{" "}</span>
            <span className="af-app">Claude</span>
          </span>
        </span>
        <span className="af-s" id="afSub">
          {p.country ? (
            <span className="af-s1">{tx("Trung Quốc chặn các ứng dụng này — bật để chỉ xem")}{" "}{of}{" "}{tx("vẫn dùng được")}</span>
          ) : (
          <span className="af-s1">{tx("Đi Trung Quốc? Bật để xem")}{" "}{of}{" "}{tx("vẫn dùng được")}</span>
          )}
          <span className="af-s2">{tx("Đã lọc")}{" "}{of}{tx(". Tắt lọc để xem tất cả")}</span>
          <span className="af-s3">{tx("Đến Trung Quốc: bật để xem")}{" "}{of}{" "}{tx("vẫn dùng được")}</span>
        </span>
      </span>
      <span className="af-sw" aria-hidden="true" />
    </button>
  );
}

function KycIcon({ show }: { show: boolean }) {
  const tx = useT();
  return show ? (
    <span className="chip-kyc" role="img" aria-label={tx("Cần xác thực danh tính")}>
      <Ic name="ic-passport" w={14} />
    </span>
  ) : null;
}

function PgHead({
  id,
  icon,
  title,
  tip,
  n,
  of,
}: {
  id: string;
  icon: string;
  title: string;
  tip: string;
  n: number;
  of: number | null;
}) {
  const tx = useT();
  return (
    <div className="pg-hd">
      <Ic name={icon} w={14} />
      <h3 className="pg-title" id={id}>
        {title}
      </h3>
      <Tip text={`${title}: ${tip}`} w={14} extra="tip--pg" />
      <span className="pg-line" aria-hidden="true" />
      <span className="pg-count">{of !== null ? tx("{0}/{1} gói", n, of) : tx("{0} gói", n)}</span>
    </div>
  );
}

const TIPS = {
  fixed: "Chọn mức data trước, rồi chọn số ngày dùng ở khung bên dưới. Giá thay đổi theo số ngày.",
  daily:
    "Mỗi ngày có sẵn một lượng data tốc độ cao; sang ngày mới được cấp lại. Dùng hết trong ngày, tuỳ gói mà mạng ngừng truy cập hoặc hạ tốc độ đến hết ngày.",
  unl: "Không giới hạn dung lượng, mạng không bị cắt. Thẻ “X GB/ngày ∞ Y Mbps”: mỗi ngày có X GB tốc độ cao, dùng hết thì giảm còn Y Mbps. Thẻ “∞ Y Mbps”: luôn dùng ở tốc độ Y.",
  combo: "Gồm data tốc độ cao, phút gọi và tin nhắn SMS, kèm số điện thoại riêng — dùng trong số ngày ghi trên thẻ.",
};

/** The fixed-plan dropdown (`#dsel`): days of the chosen size with prices. */
function DaySelect({ p, tier, open, setOpen }: { p: RegionPurchase; tier: Tier; open: boolean; setOpen: (o: boolean) => void }) {
  const tx = useT();
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const cur = p.tier?.key === tier.key ? p.plan : null;
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => {
      // Buttons that lead to the days (buy while days are missing, the days
      // field, "Chọn ngay") open it themselves — not an outside click.
      if (!(e.target as HTMLElement).closest("#dsel,.tier,[data-dgo]")) setOpen(false);
    };
    document.addEventListener("click", off);
    list.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    return () => document.removeEventListener("click", off);
  }, [open, setOpen]);
  const opts = tier.plans;
  const pick = (d: number) => {
    p.selectFixedDays(tier, d);
    setOpen(false);
  };
  return (
    <div className="dsel" id="dsel">
      <button
        className="dsel-btn"
        type="button"
        id="dselBtn"
        aria-controls="dselList"
        aria-expanded={open}
        ref={btn}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="dsel-v" id="dselV">
          {p.need || !cur ? tx("Chọn số ngày") : tx("{0} ngày", cur.durationDays)}
        </span>
        <span className="dsel-p" id="dselP" hidden={p.need || !cur}>
          {cur ? vnd(priceOf(cur, cur.durationDays).price) : ""}
        </span>
        <Ic name="ic-chev-down" w={16} />
      </button>
      <div
        className="dsel-list"
        id="dselList"
        hidden={!open}
        ref={list}
        onKeyDown={(e) => {
          const items = Array.from(list.current?.querySelectorAll<HTMLElement>(".chip") ?? []);
          const i = items.indexOf(document.activeElement as HTMLElement);
          const next = { ArrowDown: items[(i + 1) % items.length], ArrowUp: items[(i - 1 + items.length) % items.length], Home: items[0], End: items[items.length - 1] }[
            e.key as "ArrowDown"
          ];
          if (next) {
            e.preventDefault();
            next.focus();
          } else if (e.key === "Escape") {
            e.stopPropagation();
            setOpen(false);
            btn.current?.focus();
          } else if (e.key === "Tab") setOpen(false);
        }}
      >
        <div className="dsel-tp" role="group" aria-label={tx("Số ngày của gói {0}", tier.gb)}>
          {opts.map((plan) => {
            const { price } = priceOf(plan, plan.durationDays);
            const d = plan.durationDays;
            const checked = !p.need && cur?.durationDays === d;
            const per = d > 1 ? tx("≈ {0}/ngày", vnd(perDay(price, d))) : "";
            const b = badgeFor(plan, false);
            return (
              <span
                key={plan.id}
                className="chip dopt"
                role="radio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                data-days={d}
                onClick={() => pick(d)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    pick(d);
                  }
                }}
              >
                <span className="dopt-k" />
                <span className="dopt-d">{d}{" "}{tx("ngày")}</span>
                <span className="dopt-p">{vnd(price)}</span>
                <span className="dopt-b">
                  <Pbi b={b} />
                </span>
                <span className="dopt-pd">{per}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** What the chosen plan gives (`#planNote`): data rule + apps line. */
export function PlanNote({ p }: { p: RegionPurchase }) {
  const tx = useT();
  if (!p.plan) return null;
  const b = (t: string) => <b>{t}</b>;
  const o = p.opt;
  let icon = "ic-calendar";
  let text: ReactNode;
  if (o?.kind === "unl") {
    icon = "ic-infinity";
    text = o.gb ? (
      <>{tx("Mỗi ngày dùng")}{" "}{b(o.gb)}{" "}{tx("tốc độ cao. Hết")}{" "}{o.gb}{tx(", mạng không bị cắt: tự giảm còn")}{" "}{b(o.throttle)}
        {speedUse(o.throttle, tx)}{" "}{tx("và dùng tiếp không giới hạn.")}</>
    ) : o.throttle ? (
      <>{tx("Không giới hạn dung lượng, luôn dùng ở tốc độ")}{" "}{b(o.throttle)}
        {speedUse(o.throttle, tx)}.
      </>
    ) : (
      <>{tx("Không giới hạn dung lượng, luôn dùng tốc độ cao nhất của mạng 4G/5G — không giảm tốc.")}</>
    );
  } else if (o?.kind === "daily") {
    icon = "ic-clock";
    text = (
      <>
        Data {b(tx("{0}/ngày", o.gb))}{" "}{tx("tốc độ cao — hết dung lượng trong ngày thì")}{" "}
        {o.throttle ? <>{tx("hạ xuống")}{" "}{b(o.throttle)}</> : <>{b(tx("ngừng truy cập"))}{" "}{tx("đến hết ngày")}</>}.
      </>
    );
  } else if (o?.kind === "combo") {
    icon = "ic-phone";
    text = (
      <>
        {b(gbLabel(Number(p.plan.dataMb)))}{" "}{tx("data tốc độ cao")}{p.plan.call ? <> + {b(tx("{0} phút", p.plan.call))}{" "}{tx("gọi")}</> : null}
        {p.plan.sms ? <> + {b(`${p.plan.sms} SMS`)}</> : null}{tx(", dùng trong")}{" "}{p.plan.durationDays}{" "}{tx("ngày — kèm số điện thoại riêng.")}</>
    );
  } else {
    text = (
      <>{tx("Tổng")}{" "}{b(p.tier?.gb ?? gbLabel(Number(p.plan.dataMb)))}{" "}{tx("tốc độ cao, dùng trong")}{" "}{b(tx("{0} ngày", p.plan.durationDays))}{" "}{tx("— hết dung lượng có thể nạp thêm.")}</>
    );
  }
  const apps = p.apps;
  return (
    <div className="plan-note" id="planNote" aria-live="polite" hidden={p.need}>
      <p className="pn-r" id="pnData">
        <Ic name={icon} w={15} />
        <span>{text}</span>
      </p>
      <p className="pn-r">
        <Ic name={apps === "all" || apps === "unknown" ? "ic-check-circle" : "ic-no"} w={15} />
        <span>
          {apps === "notiktok" ? (
            <>{tx("Hỗ trợ sử dụng ChatGPT, Gemini, Claude…")}{" "}<b className="pn-no">{tx("Không dùng được TikTok.")}</b>
            </>
          ) : apps === "none" ? (
            <>{tx("Hỗ trợ sử dụng Google, Gemini, Claude…")}{" "}<b className="pn-no">{tx("Không dùng được TikTok, ChatGPT.")}</b>
            </>
          ) : (
            tx("Hỗ trợ sử dụng TikTok, ChatGPT, Gemini, Claude…")
          )}
          {p.showFilter && apps !== "all" && apps !== "unknown" && (
            <button className="pn-go" type="button" id="pnGo" onClick={() => p.toggleAppFilter(true)}>
              <span className="pn-go-t">{tx("Lọc eSIM dùng được")}</span>
              <Ic name="ic-chev-right" w={12} />
            </button>
          )}
        </span>
      </p>
    </div>
  );
}

const SPEED_USE: Record<number, string> = {
  1: "đủ nhắn tin, xem bản đồ, lướt web nhẹ",
  2: "lướt web, xem video chất lượng thấp",
  3: "lướt web mượt, xem video chất lượng chuẩn",
  5: "xem video HD, gọi video ổn định",
  10: "xem video Full HD, tải file nhanh",
};
function speedUse(throttle: string, tx: (key: string) => string): string {
  const n = parseFloat(throttle) || 0;
  return /mbps/i.test(throttle) && SPEED_USE[n] ? ` (${tx(SPEED_USE[n])})` : "";
}

export function EkycNote({ p, onOpen, oneLine }: { p: RegionPurchase; onOpen: () => void; oneLine?: boolean }) {
  const tx = useT();
  if (!p.needsKyc || p.need) return null;
  return (
    <button className={`ekyc-note${oneLine ? " ekyc-note--1l" : ""}`} type="button" id="ekycNote" aria-haspopup="dialog" onClick={onOpen}>
      <Ic name="ic-passport" w={18} />
      <span className="ekyc-note-c">
        <span className="ekyc-note-t">{tx("eSIM này cần xác thực danh tính")}{p.kycWhere.length ? tx(" tại ") : ""}
          {p.kycWhere.length > 0 && <span className="ekyc-where">{joinVi(p.kycWhere, p.lang)}</span>}
        </span>
        <span className="ekyc-note-l">{tx("Xem hướng dẫn")}<Ic name="ic-chev-right" w={12} />
        </span>
      </span>
    </button>
  );
}

/** Step 2 body: the data pane (fixed / daily / unlimited) and the combo pane. */
export function PlanPanes({
  p,
  dselOpen,
  setDselOpen,
  onEkyc,
  mobile,
  plansRef,
}: {
  p: RegionPurchase;
  dselOpen: boolean;
  setDselOpen: (o: boolean) => void;
  onEkyc: () => void;
  mobile?: boolean;
  plansRef?: React.Ref<HTMLDivElement>;
}) {
  const tx = useT();
  const filtered = p.appFilter && p.showFilter;
  const allCount = (list: Plan[]) => (filtered ? list.length : null);
  const kycHere = p.kycWhere.length > 0;
  const days = p.days;
  const noteIn = (where: "fixed" | "daily" | "unl" | "combo") =>
    (p.sel?.kind === where || (where === "fixed" && p.sel?.kind === "fixed")) ? (
      <>
        <PlanNote p={p} />
        <EkycNote p={p} onOpen={onEkyc} oneLine={mobile} />
      </>
    ) : null;

  const chip = (o: Opt, label: ReactNode) => {
    const plan = planForDays(o, days);
    const selected = p.opt?.key === o.key;
    return (
      <span
        key={o.key}
        className="chip"
        id={o.key}
        role="radio"
        aria-checked={selected}
        tabIndex={selected ? 0 : -1}
        onClick={() => p.selectOpt(o)}
      >
        {label} <Pbi b={badgeFor(plan) ?? badgeFor(o.plans.find((x) => badgeFor(x)))} />
        <KycIcon show={kycHere && o.plans.some((x) => x.isKyc)} />
      </span>
    );
  };

  const pickFromKeys = (el: HTMLElement) => {
    const o = [...p.daily, ...p.unl, ...p.combo].find((x) => x.key === el.id);
    if (o) p.selectOpt(o);
  };

  return (
    <div id="plans" role="radiogroup" aria-labelledby="step1" ref={plansRef} onKeyDown={(e) => radioKeys(e, pickFromKeys)}>
      {" "}
      <div id="paneData" role="tabpanel" aria-labelledby="tab-data" hidden={p.tab !== "data"}>
        {p.tiers.length > 0 && (
          <div className="pg pg--scroll pg--tier" role="group" aria-labelledby="pgd1">
            <PgHead id="pgd1" icon="ic-calendar" title={tx("Gói cố định")} tip={tx(TIPS.fixed)} n={p.plans.dataPlans.length} of={allCount(p.all.dataPlans)} />{" "}
            <div className="tier-grid" id="tierGrid" role="group" aria-label={tx("Chọn dung lượng và số ngày dùng")}>
              {p.tiers.map((t) => {
                const on = p.tier?.key === t.key;
                return (
                  <button
                    key={t.key}
                    className="tier"
                    type="button"
                    id={t.key}
                    aria-controls="dselList"
                    tabIndex={on || (!p.tier && t === p.tiers[0]) ? 0 : -1}
                    aria-pressed={on}
                    onClick={() => {
                      if (on) setDselOpen(!dselOpen);
                      else {
                        p.selectTier(t);
                        setDselOpen(true);
                      }
                    }}
                    onKeyDown={(e) => {
                      const step = ({ ArrowLeft: -1, ArrowRight: 1 } as Record<string, number>)[e.key];
                      if (!step) return;
                      e.preventDefault();
                      const i = p.tiers.indexOf(t);
                      document.getElementById(p.tiers[(i + step + p.tiers.length) % p.tiers.length].key)?.focus();
                    }}
                  >
                    {t.gb}
                    <Pbi b={t.badge} />
                  </button>
                );
              })}{" "}
              {p.tier && (
                <div className={`dock${p.need ? " is-need" : ""}`} id="dock">
                  <div className="dock-l">
                    <p className="dock-q">{tx("Tổng")}{" "}<b id="dockGb">{p.tier.gb}</b>{" "}{tx("dùng trong bao nhiêu ngày?")}</p>
                    <p className="dock-s">
                      <span id="dockS" hidden={p.need}>{tx("Data dùng chung cả gói, không chia theo ngày.")}</span>
                      <span className="dock-need" id="dockNeed" role="status" hidden={!p.need}>{tx("Chọn số ngày để tiếp tục mua hàng")}</span>
                    </p>
                  </div>
                  <DaySelect p={p} tier={p.tier} open={dselOpen} setOpen={setDselOpen} />
                </div>
              )}
            </div>
            {noteIn("fixed")}
          </div>
        )}
        {p.daily.length > 0 && (
          <div className="pg pg--scroll" role="group" aria-labelledby="pgd2">
            <PgHead id="pgd2" icon="ic-clock" title={tx("Gói theo ngày")} tip={tx(TIPS.daily)} n={p.daily.length} of={filtered ? null : null} />{" "}
            <div className="chip-grid">{p.daily.map((o) => chip(o, tx("{0}/ngày", o.gb)))}</div>
            {noteIn("daily")}
          </div>
        )}
        {p.unl.length > 0 && (
          <div className="pg pg--scroll" role="group" aria-labelledby="pgd3">
            <PgHead id="pgd3" icon="ic-infinity" title={tx("Gói không giới hạn")} tip={tx(TIPS.unl)} n={p.unl.length} of={null} />{" "}
            <div className="chip-grid">
              {p.unl.map((o) =>
                chip(
                  o,
                  o.gb ? (
                    <>
                      {o.gb}{tx("/ngày")}{" "}
                      <span className="chip-sub">
                        <Ic name="ic-infinity" w={14} />
                        {o.throttle}
                      </span>
                    </>
                  ) : (
                    <>
                      <Ic name="ic-infinity" w={14} />
                      {o.throttle || tx("Tốc độ cao")}
                    </>
                  ),
                ),
              )}
            </div>
            {noteIn("unl")}
          </div>
        )}
        {p.tiers.length + p.daily.length + p.unl.length === 0 && !p.isLoading && (
          <p className="pg-empty">{p.appFilter ? tx("Không có gói nào dùng được TikTok, ChatGPT ở phạm vi này.") : tx("Phạm vi này hiện chưa có gói nào.")}</p>
        )}
      </div>{" "}
      <div id="paneCombo" role="tabpanel" aria-labelledby="tab-combo" hidden={p.tab !== "combo"}>
        {p.combo.length > 0 && (
          <div className="pg pg--scroll" role="group" aria-labelledby="pgc1">
            <PgHead id="pgc1" icon="ic-phone" title={tx("Gói Data + Gọi + SMS")} tip={tx(TIPS.combo)} n={p.combo.length} of={allCount(p.all.smsCallEsim ?? [])} />{" "}
            <div className="chip-grid">{p.combo.map((o) => chip(o, comboLabel(o.plans[0], p.lang)))}</div>
            {noteIn("combo")}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────── step 3: days ───────────── */

/**
 * Days field mode: the calendar when some duration is not on a chip (or the
 * plan is priced per day), dropdown jump for fixed sizes.
 */
export function daysMode(p: RegionPurchase): "cal" | "go" | "" {
  if (p.perDayKind) return p.opt && chipDaysFor(p.opt, POPULAR_DAYS_MOBILE).more ? "cal" : "";
  return p.tier ? "go" : "";
}

export function DaysField({
  p,
  onCal,
  onGo,
  cls,
}: {
  p: RegionPurchase;
  onCal: () => void;
  onGo: () => void;
  cls: string;
}) {
  const tx = useT();
  const mode = daysMode(p);
  return (
    <button
      className={`${cls}${p.need ? " is-ph" : ""}`}
      type="button"
      id="daysField"
      data-dgo=""
      aria-disabled={!mode}
      data-mode={mode}
      aria-haspopup={mode === "cal" ? "dialog" : undefined}
      onClick={(e) => {
        if (mode === "cal") onCal();
        else if (mode === "go") {
          e.stopPropagation();
          onGo();
        }
      }}
    >
      <span id="daysVal">{p.need ? tx("Chọn số ngày") : tx("{0} ngày{1}", p.days, mode || p.perDayKind ? "" : " (theo gói)")}</span>
      <Ic name={mode === "go" ? "ic-chev-down" : "ic-calendar"} w={16} />
    </button>
  );
}

export function DayChips({ p, mobile, onCal }: { p: RegionPurchase; mobile?: boolean; onCal: () => void }) {
  const tx = useT();
  if (!p.perDayKind) return <div className="day-chips" id="dayChips" hidden />;
  // Durations really on sale, kept to the popular list (vande #034).
  const { days: list, more } = p.opt
    ? chipDaysFor(p.opt, mobile ? POPULAR_DAYS_MOBILE : POPULAR_DAYS_DESKTOP)
    : { days: [], more: false };
  const exact = list.includes(p.days);
  return (
    <div className={`day-chips${mobile ? "" : " day-chips--row"}`} id="dayChips" role="group" aria-labelledby="daysLbl">
      {list.map((d) => (
        <button key={d} className="day-chip" type="button" aria-label={tx("{0} ngày", d)} aria-pressed={p.days === d} data-days={d} onClick={() => p.setDays(d)}>
          {d}
        </button>
      ))}
      {more && (
        <button className="day-chip day-chip--cal" type="button" aria-pressed={!exact} aria-haspopup="dialog" onClick={onCal}>
          <Ic name="ic-calendar" w={14} />
          <span className="day-chip-t">{!exact ? tx("{0} ngày", p.days) : tx("Khác")}</span>
        </button>
      )}
    </div>
  );
}

export function NeedHint({ p, onGo }: { p: RegionPurchase; onGo: () => void }) {
  const tx = useT();
  return (
    <div className="alert alert--sm alert--warning qstock need-hint" id="needHint" role="status" hidden={!p.need}>
      <Ic name="ic-calendar" w={15} />
      <span>{tx("Chọn")}{" "}<b>{tx("số ngày dùng")}</b>{" "}{p.members.length > 1 ? tx("ở bước 2 để tiếp tục mua hàng.") : tx("ở bước 1 để tiếp tục mua hàng.")}</span>
      <button className="need-go" type="button" id="needGo" data-dgo="" onClick={onGo}>{tx("Chọn ngay")}</button>
    </div>
  );
}

/* ───────────── calendar (#calOv) — the design's rangeCalendar ───────────── */

const MONTHS = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
const dmy = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

export function CalendarModal({ p, open, onClose }: { p: RegionPurchase; open: boolean; onClose: () => void }) {
  const tx = useT();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  useEffect(() => {
    if (!open) return;
    setStart(null);
    setEnd(null);
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, [open, today]);
  const same = (a: Date | null, b: Date | null) => !!a && !!b && a.getTime() === b.getTime();
  const days = start && end ? Math.round((end.getTime() - start.getTime()) / 864e5) + 1 : start ? 1 : 0;
  const click = (d: Date) => {
    if (!start || end) {
      setStart(d);
      setEnd(null);
    } else if (d < start) {
      setEnd(start);
      setStart(d);
    } else setEnd(d);
  };
  const opt = p.opt;
  const plan = opt ? planForDays(opt, days || 1) : null;
  const tot = plan && days ? priceOf(plan, days).price * p.quantity : 0;
  const perDayPrice = plan ? priceOf(plan, 1).price : 0;
  const range = start && end && !same(start, end);

  const monthGrid = (n: number) => {
    const first = new Date(month.getFullYear(), month.getMonth() + n, 1);
    const y = first.getFullYear();
    const m = first.getMonth();
    const len = new Date(y, m + 1, 0).getDate();
    const cells: ReactNode[] = [];
    for (let i = 0; i < first.getDay(); i++) cells.push(<span key={`e${i}`} />);
    for (let d = 1; d <= len; d++) {
      const t = new Date(y, m, d);
      const past = t < today;
      let cls = "cday";
      if (!past) {
        if (same(t, today)) cls += " today";
        if (same(t, start)) cls += " sel-s" + (range ? " has-e" : "");
        if (same(t, end)) cls += " sel-e" + (range ? " has-s" : "");
        if (range && t > start! && t < end!) cls += " in-range";
      }
      const pressed = same(t, start) || same(t, end);
      cells.push(
        <button
          key={d}
          type="button"
          className={cls}
          disabled={past}
          aria-label={`${d} ${tx(MONTHS[m])} ${y}`}
          aria-pressed={pressed || undefined}
          onClick={() => click(t)}
        >
          <span>{d}</span>
        </button>,
      );
    }
    return (
      <div className="cal-month" data-idx={n} key={n}>
        <div className="cal-hd">
          <span className="cal-title">
            {tx(MONTHS[m])}{tx("năm") ? ` ${tx("năm")} ` : " "}{y}
          </span>
        </div>
        <div className="cal-dh">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
        <div className="cal-grid">{cells}</div>
      </div>
    );
  };
  const net = (() => {
    if (!tot || !p.voucher) return null;
    const pct = p.voucher.discountPercent;
    const off = Math.min(Math.round((tot * pct) / 100), p.voucherMax ?? Infinity);
    return tot - off;
  })();

  return (
    <Overlay id="calOv" open={open} onClose={onClose}>
      <div className="modal modal--xl" role="dialog" aria-labelledby="calTitle" aria-modal="true">
        <div className="modal-hd">
          <div className="modal-top">
            <div className="modal-title modal-title--sm" id="calTitle">{tx("Chọn ngày đi và ngày về")}</div>
            <button className="btn-close" type="button" aria-label={tx("Đóng")} data-close="">
              <Ic name="ic-x" w={24} />
            </button>
          </div>
          <div className="cal-tip">
            <Ic name="ic-info" w={15} />
            <span>{tx("Số ngày được tính cả ngày đi và ngày về. Gói chỉ bắt đầu tính khi eSIM kết nối mạng tại điểm đến.")}</span>
          </div>
        </div>
        <div className="cal-body" id="cal">
          <button
            className="cal-nav cal-nav--prev"
            type="button"
            aria-label={tx("Tháng trước")}
            disabled={month <= new Date(today.getFullYear(), today.getMonth(), 1)}
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            <Ic name="ic-chev-left" w={18} />
          </button>
          <button
            className="cal-nav cal-nav--next"
            type="button"
            aria-label={tx("Tháng sau")}
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >
            <Ic name="ic-chev-right" w={18} />
          </button>
          {monthGrid(0)}
          <div className="cal-divider" />
          {monthGrid(1)}
        </div>
        <div className="modal-ft modal-ft--row">
          <div className="cal-info">
            <div className="cal-info-plan" id="calPlan">
              {end && start ? (
                <>{tx("Chuyến đi")}{" "}{days}{" "}{tx("ngày")}<span className="cal-dot"> &ensp;·&ensp; </span>
                  <span className="cal-rng">{tx("Từ")}{" "}{dmy(start)} – {dmy(end)}
                  </span>
                </>
              ) : start ? (
                tx("Chọn ngày về")
              ) : (
                tx("Chọn ngày đi")
              )}
            </div>
            <div className="cal-info-price" id="calPrice">
              {end && tot ? (
                <>{tx("Tổng:")}{" "}<b>{vnd(tot)}</b> ({days}{" "}{tx("ngày ×")}{" "}{vnd(perDayPrice)}{tx("/ngày ×")}{" "}{p.quantity} eSIM)
                </>
              ) : null}
            </div>
            <div className="cal-info-net" id="calNet" hidden={!end || net === null || net === tot}>
              <Ic name="ic-ticket" w={13} />{tx("Giá sau voucher:")}{" "}<b>{net !== null ? vnd(net) : ""}</b>
            </div>
          </div>
          <button
            className="btn btn-primary btn-md"
            type="button"
            id="calOk"
            disabled={!end}
            onClick={() => {
              if (end && days) p.setDays(days);
              onClose();
            }}
          >{tx("Xác nhận")}</button>
        </div>
      </div>
    </Overlay>
  );
}

/* ───────────── left column rows ───────────── */

const yes = (t: ReactNode) => (
  <span className="v-yes">
    <Ic name="ic-yes" w={16} />
    {t}
  </span>
);
const no = (t: ReactNode) => (
  <span className="v-no">
    <Ic name="ic-no" w={16} />
    {t}
  </span>
);

/** Networks of the plan, as many as fit on one line, then "+N nhà mạng". */
function Nets({ plan, onMore }: { plan: Plan | null; onMore: () => void }) {
  const tx = useT();
  const nets = (plan?.operatorName ?? "")
    .split(/[,;/]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(2);
  const [long, setLong] = useState(true);
  useEffect(() => {
    // The design tries 2 names with "+N nhà mạng", then 1, then 1 with "+N".
    setShown(2);
    setLong(true);
  }, [plan?.id]);
  useEffect(() => {
    const el = ref.current;
    if (!el || !el.offsetParent) return;
    const kids = Array.from(el.children) as HTMLElement[];
    const row = el.closest(".sr")?.querySelector<HTMLElement>(".sl");
    const lh = row ? parseFloat(getComputedStyle(row).lineHeight) || 20 : 20;
    const fits =
      kids.every((k) => k.offsetTop === kids[0].offsetTop) && (!row || row.offsetHeight < lh * 1.5) && el.scrollWidth <= el.clientWidth + 1;
    if (fits) return;
    if (shown === 2) setShown(1);
    else if (long) setLong(false);
  }, [shown, long, plan?.id]);
  if (!nets.length) return null;
  const rest = nets.length - shown;
  return (
    <div className="sr sr--nets">
      <span className="sl">{tx("Nhà mạng hỗ trợ")}</span>
      <div className="nets" id="specNets" ref={ref}>
        {nets.slice(0, shown).map((n) => (
          <span className="net" key={n}>
            {n}
          </span>
        ))}
        {rest > 0 && (
          <button type="button" className="net net--more" onClick={onMore} aria-label={long ? undefined : tx("Xem thêm {0} nhà mạng", rest)}>
            +{rest}
            {long ? tx(" nhà mạng") : ""}
          </button>
        )}
      </div>
    </div>
  );
}

export function FeatureRows({ p, onEkyc, onCountries }: { p: RegionPurchase; onEkyc: () => void; onCountries: () => void }) {
  const tx = useT();
  const [open, setOpen] = useState(false);
  const plan = p.plan;
  const voice = planVoiceInfo(plan);
  const o = p.opt;
  const hotspot = !plan
    ? ""
    : !plan.hotSpot && !plan.hotSpotAllow
      ? null
      : p.tier
        ? tx("Tổng {0}", p.tier.gb) + (p.need ? "" : tx(" – {0} ngày", plan.durationDays))
        : o?.kind === "combo"
          ? tx("Có")
          : o && !o.gb
            ? tx("Không giới hạn")
            : tx("{0}/ngày", o?.gb);
  return (
    <>
      <Nets plan={plan} onMore={onCountries} />{" "}
      <div className="sr">
        <span className="sl">{tx("Chia sẻ kết nối / Hotspot")}</span>
        {hotspot ? (
          <span className="pill pill--info">
            <Ic name="ic-wifi" w={13} />
            <span id="specHotspot">{hotspot}</span>
          </span>
        ) : (
          <span id="specHotspot">{no(tx("Không"))}</span>
        )}
      </div>{" "}
      <div className="sr">
        <span className="sl">{tx("Gọi & Nhắn tin")}</span>
        <span id="specCalls">
          {voice.hasVoice && plan ? yes([plan.call ? tx("{0} phút gọi", plan.call) : null, plan.sms ? `${plan.sms} SMS` : null].filter(Boolean).join(" · ") || tx("Có")) : no(tx("Không"))}
        </span>
      </div>{" "}
      <div className="sr">
        <span className="sl">{tx("Số điện thoại")}</span>
        <span id="specNumber">{voice.hasVoice ? yes(tx("Có")) : no(tx("Không"))}</span>
      </div>{" "}
      <div className="sr">
        <span className="sl">{tx("Nạp thêm dữ liệu (Topup)")}</span>
        {plan?.topUp === false ? no(tx("Không")) : yes(tx("Có"))}
      </div>{" "}
      <div className="sr">
        <span className="sl">{tx("Xác thực danh tính")}</span>
        <span id="specEkyc">
          {p.needsKyc ? (
            <button type="button" className="pill pill--danger pill--sm" aria-haspopup="dialog" onClick={onEkyc}>
              {p.kycWhere.length ? tx("Bắt buộc tại {0} điểm đến", p.kycWhere.length) : tx("Bắt buộc")}
            </button>
          ) : (
            yes(tx("Không cần"))
          )}
        </span>
      </div>
      {p.needsKyc && !p.need && (
        <div className="ekyc-banner" id="ekycBanner">
          {" "}
          <button className="ekyc-banner-hd" type="button" aria-expanded={open} aria-controls="ekycBannerBody" onClick={() => setOpen(!open)}>
            {" "}
            <span className="ekyc-banner-icon">
              <Ic name="ic-passport" w={16} />
            </span>{" "}
            <span className="ekyc-banner-title">{tx("Gói này cần xác thực danh tính")}{p.kycWhere.length ? tx(" tại ") : ""}
              <span className="ekyc-where">{joinVi(p.kycWhere, p.lang)}</span>
            </span>{" "}
            <span className="ekyc-banner-toggle">
              <Ic name="ic-chev-down" w={14} />
            </span>{" "}
          </button>{" "}
          <div className="ekyc-banner-body" id="ekycBannerBody" hidden={!open}>
            <ol className="ekyc-steps">
              <li className="ekyc-step">
                <span className="ekyc-step-num">1</span>
                <span>{tx("Mua eSIM & nhận mã QR qua email.")}</span>
              </li>
              <li className="ekyc-step">
                <span className="ekyc-step-num">2</span>
                <span>{tx("Quét mã QR để cài đặt vào thiết bị.")}</span>
              </li>
              <li className="ekyc-step">
                <span className="ekyc-step-num">3</span>
                <span>
                  <strong>{tx("Hoàn tất xác thực danh tính")}</strong>{" "}{tx("(Hộ chiếu) → Bắt đầu sử dụng.")}</span>
              </li>
            </ol>
            <button className="btn btn-block btn-danger btn-sm" type="button" onClick={onEkyc}>
              <Ic name="ic-file" w={15} />{tx("Xem hướng dẫn đăng ký chi tiết")}<Ic name="ic-chev-right" w={13} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function DeliveryRows({ plan }: { plan: Plan | null }) {
  const tx = useT();
  const deadline = plan?.activationDeadline ? formatActivationDate(plan.activationDeadline) : null;
  const lang = useDesignLang();
  const reset = dailyResetText(plan, lang);
  const refundable = refundRule(plan) === "fast-if-unactivated";
  return (
    <>
      <div className="sr">
        <span className="sl">{tx("Thời gian nhận eSIM")}</span>
        <span className="pill pill--sm dlv-pill pill--success">
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
          {/* The exact sentence the ticket asks for (vande #033), not a short
              form: when the data comes back is what customers ask about. */}
          <span className="sv-text sv-wrap" id="cycleTxt">
            {reset}
          </span>
        </div>
      )}{" "}
      <div className="sr">
        <span className="sl">{tx("Hướng dẫn hoàn tiền")}</span>
        <span className="sv-2">
          {refundable ? (
            <>
              <b>{tx("Hoàn tiền nhanh")}</b>
              <small>{tx("nếu eSIM chưa kích hoạt")}</small>
            </>
          ) : (
            <>
              <b>{tx("Không hỗ trợ hoàn tiền")}</b>
              <small>{tx("theo chính sách nhà cung cấp")}</small>
            </>
          )}
        </span>
      </div>
    </>
  );
}

/* ───────────── modals ───────────── */

/** "Quốc gia & nhà mạng" (#ctrOv): the chosen variant's countries. */
export function CountriesModal({ p, open, onClose }: { p: RegionPurchase; open: boolean; onClose: () => void }) {
  const tx = useT();
  const [q, setQ] = useState("");
  useEffect(() => {
    if (open) setQ("");
  }, [open]);
  const list: Destination[] = p.member?.destinations ?? [];
  const nets = (p.plan?.operatorName ?? "").trim();
  const shown = list.filter((d) => !q.trim() || fold(nameOf(d, p.lang)).includes(fold(q.trim())));
  return (
    <Overlay id="ctrOv" open={open} onClose={onClose}>
      <div className="modal modal--md" role="dialog" aria-labelledby="ctrTitle" aria-modal="true">
        <div className="modal-hd">
          <div className="modal-top">
            <div>
              <div className="modal-title modal-title--sm" id="ctrTitle">{tx("Quốc gia & nhà mạng")}</div>
              <p className="modal-desc">
                <span id="ctrDesc">{list.length}</span>{" "}{tx("điểm đến tại")}{" "}{p.regionName}{" "}{tx("được hỗ trợ")}</p>
            </div>
            <button className="btn-close" type="button" aria-label={tx("Đóng")} data-close="">
              <Ic name="ic-x" w={24} />
            </button>
          </div>
          <div className="search">
            <Ic name="ic-search" w={16} />
            <input aria-label={tx("Tìm quốc gia")} autoComplete="off" placeholder={tx("Tìm quốc gia…")} type="search" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="search-clr" type="button" aria-label={tx("Xoá tìm kiếm")} hidden={!q} onClick={() => setQ("")}>
              <Ic name="ic-close" w={14} />
            </button>
          </div>
        </div>
        <div className="modal-body" tabIndex={0}>
          <ul className="ctr-list" id="ctrList">
            {shown.map((d) => (
              <li className="ctr-item" key={d.id} data-code={d.countryCode?.toLowerCase()}>
                <Flag code={d.countryCode || ""} url={d.flagUrl} w={32} h={24} />
                <div>
                  <div className="ctr-name">{nameOf(d, p.lang)}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="ctr-empty" id="ctrEmpty" hidden={shown.length > 0}>
            <Ic name="ic-search" w={28} />
            <p>{tx("Không tìm thấy kết quả phù hợp.")}</p>
          </div>
        </div>
        <div className="modal-ft">
          <p className="modal-note">{nets ? tx("Nhà mạng của gói đang chọn: {0}.", nets) : tx("* Gói có icon hộ chiếu đỏ cần xác thực danh tính (ảnh hộ chiếu) khi dùng tại điểm đến tương ứng.")}</p>
        </div>
      </div>
    </Overlay>
  );
}

/** A destination's name in the page language (vande #029). */
function nameOf(d: Destination, lang: string): string {
  return lang === "vi" ? d.titleVi || d.title || d.name : d.title || d.name;
}

const KYC_LINKS: Record<string, { name: string; region: string }> = {
  TW: { name: "Đài Loan", region: "tw" },
  HK: { name: "Hồng Kông", region: "hk" },
  MO: { name: "Macau", region: "hkmo" },
};

/** "Xác thực danh tính để dùng eSIM" (#ekycOv). */
export function EkycModal({ p, open, onClose, lang }: { p: RegionPurchase; open: boolean; onClose: () => void; lang: string }) {
  const tx = useT();
  const guide = (region: string) => `${lang === "vi" ? "" : `/${lang}`}/kyc-guide?region=${region}`;
  return (
    <Overlay id="ekycOv" open={open} onClose={onClose} top>
      <div className="modal modal--kyc" role="dialog" aria-labelledby="ekycTitle" aria-modal="true">
        <div className="modal-hd modal-hd--danger">
          <div className="modal-top">
            <span className="modal-badge">
              <Ic name="ic-passport" w={14} />{tx("Hướng dẫn xác thực danh tính")}</span>
            <button className="btn-close" type="button" aria-label={tx("Đóng")} data-close="">
              <Ic name="ic-x" w={24} />
            </button>
          </div>
          <div className="modal-title" id="ekycTitle">{tx("Xác thực danh tính để dùng eSIM")}</div>
          <ul className="modal-sub">
            <li>
              <Ic name="ic-check-circle" w={15} />
              <span>{tx("Theo quy định tại một số điểm đến, bạn cần xác minh danh tính để kích hoạt eSIM.")}</span>
            </li>
            <li>
              <Ic name="ic-check-circle" w={15} />
              <span>{tx("eSIM phải được cài đặt trên thiết bị trước khi đăng ký tại điểm đến được chỉ định.")}</span>
            </li>
          </ul>
          <div className="modal-stats">
            <div className="modal-stat">
              <b>3–5&apos;</b>
              <span>{tx("Thời gian hoàn tất")}</span>
            </div>
            <div className="modal-stat">
              <b>100%</b>
              <span>{tx("An toàn & bảo mật")}</span>
            </div>
            <div className="modal-stat">
              <b>24/7</b>
              <span>{tx("Hỗ trợ trực tuyến")}</span>
            </div>
          </div>
        </div>
        <div className="modal-body">
          <div className="notice">
            📌 <strong>{tx("Lưu ý:")}</strong>{" "}{tx("Bạn")}{" "}<strong>{tx("không cần xác thực")}</strong>{" "}{tx("nếu không dùng eSIM tại các điểm đến dưới đây. Thủ tục chỉ mất")}{" "}
            <strong>{tx("3–5 phút")}</strong>.
          </div>
          <div className="section-lbl">{tx("Điểm đến bắt buộc xác thực")}</div>
          <div className="opt-grid">
            {Object.entries(KYC_LINKS).map(([code, k]) => (
              <a
                key={code}
                href={guide(k.region)}
                className="opt-card opt-card--link"
                rel="noopener"
                target="_blank"
                data-code={code.toLowerCase()}
                data-out={!p.codes.includes(code) || undefined}
              >
                <span className="opt-ico">
                  <Flag code={code} w={44} h={33} />
                </span>
                <span className="opt-name">{tx(k.name)}</span>
                <span className="opt-link">{tx("Xem hướng dẫn")}{" "}<Ic name="ic-chev-right" w={12} />
                </span>
                <span className="sr-only">{" "}{tx("(mở trang hướng dẫn trong tab mới)")}</span>
              </a>
            ))}
          </div>
          <div className="acc acc--line">
            <div className="acc-title">{tx("Câu hỏi thường gặp")}</div>
            {[
              [
                tx("Thông tin của tôi có được bảo mật không?"),
                tx("Hoàn toàn. Dữ liệu được mã hoá đầu cuối và chỉ dùng để đáp ứng yêu cầu pháp lý. esim.vn không lưu trữ hay chia sẻ thông tin với bên thứ ba."),
              ],
              [tx("Tôi có thể dùng hộ chiếu nước ngoài không?"), tx("Có. Hệ thống chấp nhận hộ chiếu quốc tế còn hiệu lực. Chỉ cần chụp trang thông tin cá nhân rõ nét, đủ ánh sáng.")],
              [
                tx("Nếu xác thực thất bại, tôi phải làm gì?"),
                tx("Bạn có thể thử lại tối đa 3 lần. Nếu vẫn thất bại, liên hệ hỗ trợ 24/7 qua chat trong ứng dụng hoặc email hotro@esim.com.vn."),
              ],
              [
                tx("Xác thực mất bao lâu để được duyệt?"),
                tx("Thông thường hệ thống xử lý trong vài phút. Sau khi được duyệt, bạn sẽ nhận thông báo qua email hoặc SMS và sử dụng eSIM ngay."),
              ],
            ].map(([q, a]) => (
              <AccItem
                key={q}
                q={
                  <>
                    {q}
                    <Ic name="ic-chev-down" w={16} />
                  </>
                }
              >
                {a}
              </AccItem>
            ))}
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-block btn-danger btn-lg" type="button" data-close="">
            <Ic name="ic-check-circle" w={18} />{tx("Đã hiểu, tiếp tục mua eSIM")}</button>
          <p className="modal-note">
            <Ic name="ic-chat" w={14} />{tx("Cần hỗ trợ? Liên hệ qua Chat hoặc email hotro@esim.com.vn")}</p>
        </div>
      </div>
    </Overlay>
  );
}

/* ───────────── cross-sell ───────────── */

/** Country pages of the region's best-known countries (`.cross-card`). */
export function CrossCards({ p, lang, limit = 3 }: { p: RegionPurchase; lang: string; limit?: number }) {
  const tx = useT();
  const list = [...(p.member?.destinations ?? [])]
    .sort((a, b) => Number(b.isPopular) - Number(a.isPopular))
    .slice(0, limit);
  return (
    <>
      {list.map((d) => {
        const slug = localizedSlug(d, lang as "vi");
        return (
          <a key={d.id} href={lang === "vi" ? `/${slug}` : `/${lang}/${slug}`} className="cross-card">
            <span className="cross-logo">
              <Flag code={d.countryCode || ""} url={d.flagUrl} w={59} h={44.2} />
            </span>
            <div className="cross-txt">
              <h3 className="cross-title">eSIM {nameOf(d, lang)}</h3>
              <span className="cross-price">{tx("Xem các gói eSIM riêng cho")}{" "}{nameOf(d, lang)}</span>
            </div>
            <Ic name="ic-chev-right" w={18} cls="ic cross-arrow" />
          </a>
        );
      })}
    </>
  );
}
