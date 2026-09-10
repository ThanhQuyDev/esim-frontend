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

export const dynamic = "force-dynamic";

/**
 * Attribution for a link built as `esim.vn/<page>?ref=<code>` (#095).
 *
 * The brief lists that shape as one a partner may create, and asks whether it
 * counts. It did not: `?ref=` is read by `ReferralCapture` and stored as the
 * CUSTOMER referral code — a different programme entirely (it discounts the
 * buyer and rewards a referring user). A partner who built their link that way
 * earned nothing at all, with nothing to indicate it.
 *
 * Unlike `/go/<code>` this does NOT redirect — the visitor is already on the
 * page they wanted — and it attributes only when the backend confirms the code
 * really is an active partner link. That matters here in a way it does not for
 * `/go`: `?ref=` also carries ordinary customer referral codes, and those must
 * never create partner attribution.
 *
 * The customer-referral handling is left exactly as it was; nothing here
 * decides which programme "wins", because both already coexist on an order.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const result = await recordPartnerLinkClick(API_BASE_URL, code, {
    userAgent: request.headers.get("user-agent") || undefined,
    referrer: request.headers.get("referer") || undefined,
    ipHash:
      hashClientIp(
        request.headers.get("x-forwarded-for"),
        request.headers.get("x-real-ip")
      ) || undefined,
  });

  // `null` means "not an active partner link" (or the API was unreachable):
  // leave the visit alone rather than crediting a partner on a guess.
  if (!result) {
    return NextResponse.json({ attributed: false });
  }

  const response = NextResponse.json({ attributed: true });
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
