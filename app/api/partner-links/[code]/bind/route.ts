import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

export const dynamic = "force-dynamic";

/**
 * Bind a KOL's marketing link to the signed-in customer's account (#034).
 *
 * The browser holds the session in localStorage, so the token arrives in the
 * Authorization header and is passed straight through — this route exists only
 * to keep the API base URL and error handling in one place.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json({ bound: false }, { status: 401 });
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/partners/links/${encodeURIComponent(code)}/bind`,
      {
        method: "POST",
        headers: { Authorization: authorization },
        cache: "no-store",
      }
    );

    if (!res.ok) return NextResponse.json({ bound: false }, { status: res.status });
    return NextResponse.json(await res.json().catch(() => ({ bound: true })));
  } catch {
    // An unreachable API must not break the page the visitor is reading.
    return NextResponse.json({ bound: false }, { status: 200 });
  }
}
