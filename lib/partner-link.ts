import { createHash } from "crypto";

/**
 * Shared plumbing for KOL marketing-link attribution (#095).
 *
 * Two routes attribute a visit: `/go/<code>`, the link a partner hands out, and
 * `/api/ref/<code>`, used when a partner has built their link as
 * `esim.vn/<page>?ref=<code>` instead. They must set the same cookies with the
 * same lifetime — the 30-day window and the checkout both depend on it — so the
 * details live here rather than being written twice and drifting apart.
 */

export const PARTNER_LINK_COOKIE_NAME = "esim_partner_link";

/**
 * When the visit happened, so the API can enforce the 30-day rule itself
 * instead of trusting that the cookie above really did expire.
 */
export const PARTNER_LINK_CLICKED_AT_COOKIE_NAME = "esim_partner_link_at";

export const PARTNER_LINK_ATTRIBUTION_DAYS = 30;

/** Rewritten on every visit, so the window runs from the most recent one. */
export const PARTNER_LINK_COOKIE_OPTIONS = {
  maxAge: PARTNER_LINK_ATTRIBUTION_DAYS * 24 * 60 * 60,
  path: "/",
  sameSite: "lax" as const,
};

/**
 * Never forward a raw IP — hash it so the backend can dedupe and rate-limit
 * clicks without storing anything identifying.
 */
export function hashClientIp(
  forwardedFor: string | null,
  realIp: string | null
): string | undefined {
  const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || "";
  if (!clientIp) return undefined;
  return createHash("sha256").update(clientIp).digest("hex");
}

/** What the backend answers for a code that matches an active partner link. */
export interface PartnerLinkClickResult {
  targetPath: string | null;
}

/**
 * Record the click against the partner link.
 *
 * Returns `null` when the code is not an active partner link — the backend
 * answers 200 with a `null` body for that — and also when the API cannot be
 * reached, so a caller never attributes a visit it could not confirm.
 */
export async function recordPartnerLinkClick(
  apiBaseUrl: string,
  code: string,
  meta: { userAgent?: string; referrer?: string; ipHash?: string }
): Promise<PartnerLinkClickResult | null> {
  try {
    const res = await fetch(
      `${apiBaseUrl}/api/v1/partner-links/${encodeURIComponent(code)}/click`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Must reach the backend on every visit; a cached response would stop
        // the partner being credited with clicks.
        cache: "no-store",
        body: JSON.stringify(meta),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as
      | PartnerLinkClickResult
      | null;
    return data ?? null;
  } catch {
    return null;
  }
}
