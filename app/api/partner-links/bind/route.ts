import { NextRequest, NextResponse } from "next/server";

import { PARTNER_CLICK_TOKEN_COOKIE_NAME } from "@/lib/partner-link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

export const dynamic = "force-dynamic";

/**
 * Bind the visitor's signed click to the signed-in account (#034,
 * doitac-1410 #026). The token is read here, on the server, from the HttpOnly
 * cookie; a bare link code no longer binds anything.
 */
export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json({ bound: false }, { status: 401 });
  }
  const clickToken = request.cookies.get(PARTNER_CLICK_TOKEN_COOKIE_NAME)?.value;
  if (!clickToken) return NextResponse.json({ bound: false });

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/partners/links/bind-click`, {
      method: "POST",
      headers: { Authorization: authorization, "Content-Type": "application/json" },
      body: JSON.stringify({ clickToken }),
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ bound: false }, { status: res.status });
    return NextResponse.json(await res.json().catch(() => ({ bound: true })));
  } catch {
    // An unreachable API must not break the page the visitor is reading.
    return NextResponse.json({ bound: false }, { status: 200 });
  }
}
