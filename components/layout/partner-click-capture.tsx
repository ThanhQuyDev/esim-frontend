"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  PARTNER_CLICK_ID_PARAM,
  rememberPartnerClickId,
} from "@/lib/partner-click-id";

/**
 * Takes the server-minted click id out of the landing URL (#039).
 *
 * `/go/<code>` redirects here with `?pcid=<id>`. Moving it into storage right
 * away means the attribution no longer rides on a cookie that iOS will trim,
 * and clearing it from the address bar means the visitor cannot hand their own
 * attribution to somebody else by pasting the link they landed on.
 */
export function PartnerClickCapture() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const clickId = searchParams.get(PARTNER_CLICK_ID_PARAM);
    if (!clickId) return;

    rememberPartnerClickId(clickId);

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
