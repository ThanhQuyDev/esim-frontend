"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Captures ?ref=CODE from the URL and stores it in localStorage.
 * The cart and checkout pages will read this value to auto-fill the referral code.
 *
 * The same parameter also carries KOL marketing links built as
 * `esim.vn/<page>?ref=<code>` (#095) — a shape the brief lists as one partners
 * may create. Those used to be captured as a CUSTOMER referral code and nothing
 * else, so the partner earned nothing. `/api/ref/<code>` now checks whether the
 * code is an active partner link and, only then, writes the attribution cookies
 * — the customer-referral behaviour below is untouched, and a code that is only
 * a customer referral creates no partner attribution.
 */
export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref || !ref.trim()) return;
    const code = ref.trim().toUpperCase();

    try {
      localStorage.setItem("esim_referral_code", code);
    } catch {
      // Private mode or blocked storage: the partner check below still runs.
    }

    // Fire and forget: nothing on the page depends on the answer, and a failure
    // must never interrupt the visit.
    void fetch(`/api/ref/${encodeURIComponent(code)}`, {
      cache: "no-store",
    }).catch(() => {});
  }, [searchParams]);

  return null;
}
