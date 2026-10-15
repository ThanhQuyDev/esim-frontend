import { NextRequest, NextResponse } from "next/server";

import { PARTNER_CLICK_TOKEN_COOKIE_NAME } from "@/lib/partner-link";

export const dynamic = "force-dynamic";

/**
 * The signed click token from the HttpOnly cookie (doitac-1410 #026).
 *
 * The order is placed from the browser straight to the API, which cannot see
 * a cookie of this site, so the checkout asks for the token here and sends it
 * with the order. The token is signed: reading it changes nothing, and any
 * edit makes the API ignore it.
 */
export async function GET(request: NextRequest) {
  const clickToken =
    request.cookies.get(PARTNER_CLICK_TOKEN_COOKIE_NAME)?.value ?? null;
  return NextResponse.json(
    { clickToken },
    { headers: { "Cache-Control": "no-store, private" } }
  );
}
