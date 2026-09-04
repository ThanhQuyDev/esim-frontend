import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

const PARTNER_LINK_COOKIE_NAME = "esim_partner_link";
const PARTNER_LINK_ATTRIBUTION_DAYS = 30;

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

  let targetPath: string | null = null;
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "";
    // Never forward the raw IP — hash it so the backend can dedupe/rate-limit
    // clicks without storing PII.
    const ipHash = clientIp
      ? createHash("sha256").update(clientIp).digest("hex")
      : undefined;

    const res = await fetch(
      `${API_BASE_URL}/api/v1/partner-links/${encodeURIComponent(code)}/click`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAgent: request.headers.get("user-agent") || undefined,
          referrer: request.headers.get("referer") || undefined,
          ipHash,
        }),
      }
    );

    if (res.ok) {
      const data = await res.json().catch(() => null);
      targetPath = data?.targetPath || null;
    }
  } catch {
    // Best-effort: an unreachable API must not block the redirect.
  }

  const redirectUrl = targetPath
    ? new URL(targetPath, origin)
    : new URL("/", origin);

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(PARTNER_LINK_COOKIE_NAME, code, {
    maxAge: PARTNER_LINK_ATTRIBUTION_DAYS * 24 * 60 * 60,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
