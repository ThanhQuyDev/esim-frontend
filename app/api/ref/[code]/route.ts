import { NextRequest, NextResponse } from "next/server";

import {
  applyPartnerClick,
  hashClientIp,
  isLinkPreviewBot,
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
  const userAgent = request.headers.get("user-agent");

  // A crawler rendering the page is not a visit (doitac-1410 #026).
  if (isLinkPreviewBot(userAgent)) {
    return NextResponse.json({ attributed: false });
  }

  const result = await recordPartnerLinkClick(API_BASE_URL, code, {
    userAgent: userAgent || undefined,
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

  // The click stays in the signed HttpOnly cookie; nothing of it goes back to
  // the page (doitac-1410 #026).
  const response = NextResponse.json({ attributed: true });
  applyPartnerClick(response, result);
  return response;
}
