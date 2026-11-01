"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { PARTNER_CLICK_ID_PARAM } from "@/lib/partner-click-id";

/** Same name as `PARTNER_CLICK_PENDING_COOKIE_NAME` (lib/partner-link, server-only). */
const PENDING_COOKIE = "esim_pc_pending";

function clickPending(): boolean {
  return document.cookie
    .split("; ")
    .some((pair) => pair.startsWith(`${PENDING_COOKIE}=`));
}

/**
 * Confirm the click once this page has really been shown (doitac-3010 #018,
 * rule 2): the tab is visible, the page has loaded and painted. A prerendered
 * or background tab waits until it is looked at; a bot that never runs the
 * page never confirms at all.
 */
function confirmWhenShown(): () => void {
  let done = false;
  const send = () => {
    if (done || document.visibilityState !== "visible") return;
    done = true;
    // Cleared here too, so a second page view does not ask again.
    document.cookie = `${PENDING_COOKIE}=; Max-Age=0; path=/`;
    void fetch("/api/partner-attribution/confirm", {
      method: "POST",
      cache: "no-store",
      keepalive: true,
    }).catch(() => undefined);
  };
  const afterPaint = () =>
    requestAnimationFrame(() => requestAnimationFrame(send));

  const onLoad = () => afterPaint();
  const onVisible = () => {
    if (document.readyState === "complete") afterPaint();
  };
  if (document.readyState === "complete") afterPaint();
  else window.addEventListener("load", onLoad, { once: true });
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    window.removeEventListener("load", onLoad);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

/**
 * Clears a click id from the address bar (#039, doitac-1410 #026).
 *
 * `/go/<code>` no longer puts the click on the landing URL — it lives in a
 * signed HttpOnly cookie — so a `?pcid=` that still turns up is from a link
 * somebody shared. It is dropped, never stored: a pasted URL must not hand the
 * visitor's click to whoever opens it.
 *
 * It also confirms a fresh click once the landing page has really been shown
 * (doitac-3010 #018), which is what makes the click valid.
 */
export function PartnerClickCapture() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (!clickPending()) return;
    return confirmWhenShown();
  }, []);

  useEffect(() => {
    if (!searchParams.get(PARTNER_CLICK_ID_PARAM)) return;

    const remaining = new URLSearchParams(searchParams.toString());
    remaining.delete(PARTNER_CLICK_ID_PARAM);
    const query = remaining.toString();
    window.history.replaceState(
      window.history.state,
      "",
      query ? `${pathname}?${query}` : pathname
    );
  }, [searchParams, pathname]);

  return null;
}
