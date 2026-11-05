"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { MapPin } from "lucide-react";
import { optimizeCloudinary } from "@/lib/cdn-image";
import type { Locale } from "@/lib/i18n-config";
import { variantCountLabel } from "@/lib/region-groups";
import "./destination-picker.css";

/**
 * The tabs and cards of trang-chu-tab-esim-{desktop,mobile}-v3.html, shared by
 * the home page and the all-destinations page (vande-0411 #071).
 */

export function VietnamFlag() {
  return (
    <svg className="dp-f2" viewBox="0 0 640 480" aria-hidden="true">
      <g transform="translate(80)scale(.9375)">
        <path fill="#da251d" d="M-128 0h768v512h-768z" />
        <path fill="#ff0" d="m350 381-90-67-89 68 33-110-89-68 110-1 34-109 35 109h110l-88 69z" />
      </g>
    </svg>
  );
}

export interface PickerTab<K extends string> {
  key: K;
  label: string;
  testId?: string;
}

export function PickerTabs<K extends string>({
  tabs,
  active,
  onChange,
  label,
}: {
  tabs: PickerTab<K>[];
  active: K;
  onChange: (key: K) => void;
  label: string;
}) {
  const list = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const baseId = useId();

  useEffect(() => {
    const root = list.current;
    if (!root) return;
    const place = () => {
      const on = root.querySelector<HTMLElement>(".dp-tb.dp-on");
      if (!on || !pill.current) return;
      pill.current.style.cssText = `width:${on.offsetWidth}px;height:${on.offsetHeight}px;transform:translate(${on.offsetLeft}px,${on.offsetTop}px)`;
    };
    place();
    const frame = requestAnimationFrame(() => setReady(true));
    const observer = new ResizeObserver(place);
    observer.observe(root);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active, tabs.length]);

  const onKeyDown = (event: KeyboardEvent) => {
    const at = tabs.findIndex((tab) => tab.key === active);
    const moves: Record<string, number> = {
      ArrowRight: at + 1,
      ArrowLeft: at - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = (next + tabs.length) % tabs.length;
    onChange(tabs[target].key);
    list.current?.querySelectorAll<HTMLElement>(".dp-tb")[target]?.focus();
  };

  return (
    <div
      ref={list}
      className={`dp-tabs${ready ? " dp-rd" : ""}`}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      <i ref={pill} className="dp-ind" aria-hidden="true" />
      {tabs.map((tab) => {
        const on = tab.key === active;
        return (
          <button
            key={tab.key}
            id={`${baseId}-${tab.key}`}
            type="button"
            role="tab"
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            data-testid={tab.testId}
            data-is-tab="true"
            data-is-active={on}
            className={`dp-tb${on ? " dp-on" : ""}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.key === "local" && <VietnamFlag />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function Chevron() {
  return (
    <svg className="dp-cv" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m9 18 6-6-6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Globe() {
  return (
    <svg className="dp-gi" viewBox="0 0 24 24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
      </g>
    </svg>
  );
}

/** One row of the grid: the round mark, the name and line under it, the arrow. */
export function PickerCardLink({
  href,
  mark,
  name,
  sub,
  testId,
}: {
  href: string;
  mark: ReactNode;
  name: ReactNode;
  sub: ReactNode;
  testId?: string;
}) {
  return (
    <a className="dp-c" href={href} data-testid={testId}>
      {mark}
      <span className="dp-t">
        <span className="dp-n">{name}</span>
        {sub ? <span className="dp-s">{sub}</span> : null}
      </span>
      <Chevron />
    </a>
  );
}

/** Flag or uploaded icon; a region without one gets the design's globe. */
export function DestinationMark({ item, isRegion }: { item: any; isRegion: boolean }) {
  const src = item.flagUrl || item.iconUrl;
  if (src) {
    return (
      <span className="dp-l">
        <img
          alt=""
          loading="lazy"
          decoding="async"
          width={36}
          height={36}
          src={optimizeCloudinary(src, { width: 72 })}
        />
      </span>
    );
  }
  return isRegion ? (
    <span className="dp-l dp-g">
      <Globe />
    </span>
  ) : (
    <span className="dp-l dp-none">
      <MapPin className="w-4 h-4" />
    </span>
  );
}

/** "Từ 150.000₫ · 18 điểm đến" on a region, "Từ 45.000₫" on a country. */
export function destinationSub(
  item: any,
  isRegion: boolean,
  lang: Locale,
  fromLabel: string,
  format: (price: number) => string,
): string {
  const parts: string[] = [];
  const price = Number(item.fromPrice);
  if (price > 0) parts.push(`${fromLabel} ${format(price)}`);
  if (isRegion) {
    if (item.variantCount > 1) {
      parts.push(variantCountLabel(item.variantCount, lang));
    } else if (item.destinationCount != null) {
      const count = item.destinationCount;
      parts.push(
        lang === "vi" ? `${count} điểm đến` : `${count} destination${count === 1 ? "" : "s"}`,
      );
    }
  }
  return parts.join(" · ");
}
