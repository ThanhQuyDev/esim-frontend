import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

/**
 * Same-origin drop box for the daily visit report (vande #059). Relays the
 * visitor's address and browser so the backend sees them rather than ours.
 * Answers 200 whatever happens downstream.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ recorded: false });
  }

  const forwardedFor =
    request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
  const userAgent = request.headers.get("user-agent");
  try {
    await fetch(`${API_BASE_URL}/api/v1/tracking/visit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
        ...(userAgent ? { "user-agent": userAgent } : {}),
      },
      cache: "no-store",
      body: JSON.stringify(body),
    });
  } catch {
    // Nothing to do and nothing to say.
  }

  return NextResponse.json({ recorded: true });
}
