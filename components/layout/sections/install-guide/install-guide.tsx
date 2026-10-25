"use client";

import "./design/ig-desktop.css";
import "./design/ig-mobile.css";
import "./design/ig-switch.css";
import { useEffect, useMemo, useRef } from "react";
import { localizedHref } from "@/lib/route-mapping";
import type { Locale } from "@/lib/i18n-config";

/**
 * "Hướng dẫn cài đặt eSIM" (`/huong-dan-cai-dat-esim`, #065).
 *
 * Ported verbatim from the design files "huong-dan-cai-dat-esim.html" and
 * "-mobile.html": the markup and CSS are the design's own (scoped under
 * `.igd` / `.igm`) and its script drives the device tabs, steps, progress,
 * accordions and modals. Both layouts are rendered; `ig-switch.css` shows
 * one of them by width. The design's header, footer and chat bubble are left
 * out — the site has its own.
 *
 * English (vande #036) is a generated twin of the design (`*.en.ts`, see
 * `design/gen-en.mjs`). The page hands over the markup for its language, and
 * only that language's script is loaded.
 */
export function InstallGuide({
  lang,
  desktopHtml,
  mobileHtml,
}: {
  lang: Locale;
  desktopHtml: string;
  mobileHtml: string;
}) {
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
    return [fill(desktopHtml), fill(mobileHtml)];
  }, [lang, desktopHtml, mobileHtml]);

  useEffect(() => {
    const d = desktop.current;
    const m = mobile.current;
    if (!d || !m) return;
    let stops: Array<() => void> = [];
    let cancelled = false;
    void Promise.all(
      lang === "en"
        ? [import("./design/ig-desktop-script.en"), import("./design/ig-mobile-script.en")]
        : [import("./design/ig-desktop-script"), import("./design/ig-mobile-script")],
    ).then(([desk, mob]) => {
      if (cancelled) return;
      // Fresh nodes on every run, so a re-run (React strict mode, a locale
      // change) never stacks the design's click handlers twice.
      d.innerHTML = dHtml;
      m.innerHTML = mHtml;
      stops = [desk.runDesktop(d), mob.runMobile(m)];
      // Marks the guide interactive (the tests wait for it).
      d.parentElement?.setAttribute("data-ready", "1");
    });
    return () => {
      cancelled = true;
      stops.forEach((stop) => stop());
    };
  }, [lang, dHtml, mHtml]);

  // "Chat với chuyên viên" opens the site's own chat, not Zalo (vande #036).
  // Caught on the way down: the design's script handles `href="#"` links
  // itself. The phone layout has the button in its contents drawer, which
  // would sit over the chat, so the drawer is closed first.
  const page = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = page.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest("[data-open-chat]");
      if (!link) return;
      e.preventDefault();
      e.stopPropagation();
      (link.closest(".igm")?.querySelector(".drawer.open [data-drawer-close]") as HTMLElement | null)?.click();
      // The chat widget loads lazily, so wait a moment for it on an early click.
      let tries = 0;
      const open = () => {
        const toggle = document.getElementById("chat-bubble-toggle");
        if (toggle) {
          if (toggle.getAttribute("aria-label") !== "Close chat") toggle.click();
        } else if (tries++ < 20) timer = window.setTimeout(open, 150);
      };
      open();
    };
    let timer = 0;
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("click", onClick, true);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={page} className="ig-page" data-testid="install-guide">
      <div ref={desktop} className="igd" dangerouslySetInnerHTML={{ __html: dHtml }} />
      <div ref={mobile} className="igm" dangerouslySetInnerHTML={{ __html: mHtml }} />
    </div>
  );
}
