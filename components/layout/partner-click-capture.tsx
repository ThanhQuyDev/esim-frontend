"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { PARTNER_CLICK_ID_PARAM } from "@/lib/partner-click-id";

/**
 * Clears a click id from the address bar (#039, doitac-1410 #026).
 *
 * `/go/<code>` no longer puts the click on the landing URL — it lives in a
 * signed HttpOnly cookie — so a `?pcid=` that still turns up is from a link
 * somebody shared. It is dropped, never stored: a pasted URL must not hand the
 * visitor's click to whoever opens it.
 */
export function PartnerClickCapture() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

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
