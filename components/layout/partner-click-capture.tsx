"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

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
/**
 * What the visitor is told when they arrive through a partner's link
 * (doitac-3010 #021, rule 7): that a cookie records which partner sent them,
 * that it costs them nothing, and where the privacy policy is. Shown once, on
 * the page the link opened.
 */
const TRACKING_NOTICE = {
  vi: {
    text: "Bạn đến esim.vn qua liên kết của một đối tác. Chúng tôi lưu một cookie ghi nhận nguồn trong 30 ngày để trả hoa hồng cho đối tác — giá bạn trả không thay đổi.",
    policy: "Chính sách bảo mật",
    ok: "Đã hiểu",
  },
  en: {
    text: "You reached esim.vn through a partner's link. We keep a cookie recording the referral for 30 days so the partner earns a commission — your price does not change.",
    policy: "Privacy policy",
    ok: "Got it",
  },
} as const;

function TrackingNotice({ onClose }: { onClose: () => void }) {
  const locale = useLocale() === "en" ? "en" : "vi";
  const copy = TRACKING_NOTICE[locale];
  const policyHref = `${locale === "en" ? "/en" : ""}/legal/privacy-policy`;

  return (
    <div
      role="status"
      data-testid="partner-tracking-notice"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-lg border bg-background p-4 text-sm shadow-lg sm:left-6 sm:right-auto"
    >
      <p className="text-muted-foreground">
        {copy.text}{" "}
        <a href={policyHref} className="font-medium text-foreground underline">
          {copy.policy}
        </a>
      </p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background"
        >
          {copy.ok}
        </button>
      </div>
    </div>
  );
}

export function PartnerClickCapture() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (!clickPending()) return;
    setShowNotice(true);
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

  return showNotice ? (
    <TrackingNotice onClose={() => setShowNotice(false)} />
  ) : null;
}
