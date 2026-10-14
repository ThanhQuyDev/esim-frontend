"use client";

import "./design/ig-desktop.css";
import "./design/ig-mobile.css";
import "./design/ig-switch.css";
import { useEffect, useMemo, useRef } from "react";
import { localizedHref } from "@/lib/route-mapping";
import type { Locale } from "@/lib/i18n-config";
import { IG_DESKTOP_HTML } from "./design/ig-desktop-html";
import { IG_MOBILE_HTML } from "./design/ig-mobile-html";
import { runDesktop } from "./design/ig-desktop-script";
import { runMobile } from "./design/ig-mobile-script";

/**
 * "Hướng dẫn cài đặt eSIM" (`/huong-dan-cai-dat-esim`, #065).
 *
 * Ported verbatim from the design files "huong-dan-cai-dat-esim.html" and
 * "-mobile.html": the markup and CSS are the design's own (scoped under
 * `.igd` / `.igm`) and its script drives the device tabs, steps, progress,
 * accordions and modals. Both layouts are rendered; `ig-switch.css` shows
 * one of them by width. The design's header, footer and chat bubble are left
 * out — the site has its own.
 */
export function InstallGuide({ lang }: { lang: Locale }) {
  const desktop = useRef<HTMLDivElement>(null);
  const mobile = useRef<HTMLDivElement>(null);

  const [dHtml, mHtml] = useMemo(() => {
    const links: Record<string, string> = {
      home: lang === "vi" ? "/" : `/${lang}`,
      help: localizedHref(lang, "help-center"),
      destinations: localizedHref(lang, "destinations"),
      calc: localizedHref(lang, "data-calculator"),
      devices: localizedHref(lang, "esim-supported-devices"),
    };
    const fill = (html: string) => html.replace(/\{\{(\w+)\}\}/g, (_, k: string) => links[k] ?? "#");
    return [fill(IG_DESKTOP_HTML), fill(IG_MOBILE_HTML)];
  }, [lang]);

  useEffect(() => {
    const d = desktop.current;
    const m = mobile.current;
    if (!d || !m) return;
    // Fresh nodes on every run, so a re-run (React strict mode, a locale
    // change) never stacks the design's click handlers twice.
    d.innerHTML = dHtml;
    m.innerHTML = mHtml;
    const stops = [runDesktop(d), runMobile(m)];
    // Marks the guide interactive (the tests wait for it).
    d.parentElement?.setAttribute("data-ready", "1");
    return () => stops.forEach((stop) => stop());
  }, [dHtml, mHtml]);

  return (
    <div className="ig-page" data-testid="install-guide">
      <div ref={desktop} className="igd" dangerouslySetInnerHTML={{ __html: dHtml }} />
      <div ref={mobile} className="igm" dangerouslySetInnerHTML={{ __html: mHtml }} />
    </div>
  );
}
