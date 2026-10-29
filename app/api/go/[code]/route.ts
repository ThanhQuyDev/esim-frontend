import { NextRequest, NextResponse } from "next/server";

import {
  applyPartnerClick,
  fetchPartnerLinkTarget,
  hashClientIp,
  isLinkPreviewBot,
  publicOrigin,
  recordPartnerLinkClick,
} from "@/lib/partner-link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

/**
 * Never cached: this is a click counter as much as a redirect, and a cached
 * response silently stops recording clicks for the KOL.
 */
export const dynamic = "force-dynamic";

function redirectTo(request: NextRequest, targetPath: string | null) {
  const origin = publicOrigin(request);
  const url = targetPath ? new URL(targetPath, origin) : new URL("/", origin);
  // The partner's channel label is read from the link itself; on the landing
  // URL it would only leak through Referer, history and shared screenshots
  // (doitac-1410 #026).
  url.searchParams.delete("subid");
  url.searchParams.delete("pcid");
  return NextResponse.redirect(url);
}

/**
 * KOL marketing-link redirect: /go/[code] → records a click against the
 * partner link and redirects the visitor to the link's target page.
 *
 * doitac-1410 #026:
 * - the click is kept as a server-signed token in an HttpOnly (Secure on the
 *   live site) cookie — nothing readable or editable by the page, and nothing
 *   on the landing URL, so a shared or screenshotted URL carries no click;
 * - a HEAD request or a link-preview bot (Threads, Facebook, Zalo, Slack…) is
 *   sent to the same page but is not recorded as a click.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const userAgent = request.headers.get("user-agent");

  if (isLinkPreviewBot(userAgent)) {
    return redirectTo(request, await fetchPartnerLinkTarget(API_BASE_URL, code));
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

  const response = redirectTo(request, result?.targetPath ?? null);
  applyPartnerClick(response, result);
  return response;
}

/** A HEAD only checks the link; it is not a visit (doitac-1410 #026). */
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  return redirectTo(request, await fetchPartnerLinkTarget(API_BASE_URL, code));
}
