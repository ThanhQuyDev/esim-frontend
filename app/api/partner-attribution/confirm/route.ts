import { NextRequest, NextResponse } from "next/server";

import {
  PARTNER_CLICK_PENDING_COOKIE_NAME,
  PARTNER_CLICK_TOKEN_COOKIE_NAME,
} from "@/lib/partner-link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

export const dynamic = "force-dynamic";

/**
 * The landing page confirming its click (doitac-3010 #018, rule 2).
 *
 * Called by the page once it has really been shown in a browser, so a click
 * becomes valid only then — a HEAD, a bot or a prefetch never runs the page.
 * The click is the one in this browser's own HttpOnly token, never anything
 * the page sends.
 */
export async function POST(request: NextRequest) {
  const clickToken =
    request.cookies.get(PARTNER_CLICK_TOKEN_COOKIE_NAME)?.value ?? null;

  let confirmed = false;
  if (clickToken) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/partner-links/clicks/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clickToken,
            userAgent: request.headers.get("user-agent") || undefined,
          }),
          cache: "no-store",
        }
      );
      const data = res.ok
        ? ((await res.json().catch(() => null)) as { confirmed?: boolean } | null)
        : null;
      confirmed = Boolean(data?.confirmed);
    } catch {
      // The visit still happened; only the counter misses it.
    }
  }

  const response = NextResponse.json(
    { confirmed },
    { headers: { "Cache-Control": "no-store, private" } }
  );
  response.cookies.delete(PARTNER_CLICK_PENDING_COOKIE_NAME);
  return response;
}
