import { NextRequest, NextResponse } from "next/server";

import {
  PARTNER_LINK_CLICKED_AT_COOKIE_NAME,
  PARTNER_LINK_COOKIE_NAME,
  PARTNER_LINK_COOKIE_OPTIONS,
  hashClientIp,
  recordPartnerLinkClick,
} from "@/lib/partner-link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

/**
 * Never cached: this is a click counter as much as a redirect, and a cached
 * response silently stops recording clicks for the KOL.
 */
export const dynamic = "force-dynamic";

/**
 * KOL marketing-link redirect: /go/[code] → records a click against the
 * partner link, sets a 30-day attribution cookie, then redirects the visitor
 * to the link's target page (or the homepage). The order-creation flow later
 * reads this cookie to attribute the resulting order to the KOL for
 * commission crediting — independent of `referralCode`/`couponCode`.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const origin = request.nextUrl.origin;

  const result = await recordPartnerLinkClick(API_BASE_URL, code, {
    userAgent: request.headers.get("user-agent") || undefined,
    referrer: request.headers.get("referer") || undefined,
    ipHash:
      hashClientIp(
        request.headers.get("x-forwarded-for"),
        request.headers.get("x-real-ip")
      ) || undefined,
  });

  const redirectUrl = result?.targetPath
    ? new URL(result.targetPath, origin)
    : new URL("/", origin);

  const response = NextResponse.redirect(redirectUrl);
  // Set even when the click could not be recorded: an unreachable API must not
  // cost the partner an attribution the visitor genuinely earned them, and the
  // backend re-checks the 30-day window at order time anyway.
  response.cookies.set(
    PARTNER_LINK_COOKIE_NAME,
    code,
    PARTNER_LINK_COOKIE_OPTIONS
  );
  response.cookies.set(
    PARTNER_LINK_CLICKED_AT_COOKIE_NAME,
    new Date().toISOString(),
    PARTNER_LINK_COOKIE_OPTIONS
  );

  return response;
}
