import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

/**
 * Same-origin drop box for the journey tracking snippet (#040).
 *
 * Same-origin because `navigator.sendBeacon` is what reports the last step of a
 * session, as the visitor leaves the page for the payment screen, and a beacon
 * to another origin is at the mercy of CORS and of tracking blockers.
 *
 * Answers 200 whatever happens downstream: the page must never learn that the
 * reporting failed, let alone wait for it.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ recorded: 0 });
  }

  try {
    await fetch(`${API_BASE_URL}/api/v1/tracking/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forwarded so the backend hashes the visitor's address, not ours.
        ...(request.headers.get("x-forwarded-for")
          ? { "x-forwarded-for": request.headers.get("x-forwarded-for")! }
          : {}),
      },
      cache: "no-store",
      body: JSON.stringify(body),
    });
  } catch {
    // Nothing to do and nothing to say.
  }

  return NextResponse.json({ recorded: 0 });
}
