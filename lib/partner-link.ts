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
  /** The id the server minted for this click (#039). */
  clickId?: string | null;
  /** The same click, signed by the server with a key id (doitac-1410 #026). */
  clickToken?: string | null;
}

/**
 * The signed click token (doitac-1410 #026) — the ONLY attribution cookie now.
 *
 * HttpOnly, so no script on the page (an extension, a third-party tag, an XSS)
 * can read or rewrite it; Secure on the live site; and its value is signed by
 * the API, so a hand-edited cookie simply stops attributing. Set by our own
 * server in a redirect, it is a first-party cookie that Safari does not trim to
 * 7 days the way it trims script-written ones (#039).
 */
export const PARTNER_CLICK_TOKEN_COOKIE_NAME = "esim_partner_ct";

export const PARTNER_CLICK_TOKEN_COOKIE_OPTIONS = {
  ...PARTNER_LINK_COOKIE_OPTIONS,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

/** The plain cookies this replaces; cleared on every new click. */
const LEGACY_COOKIES = [
  PARTNER_LINK_COOKIE_NAME,
  PARTNER_LINK_CLICKED_AT_COOKIE_NAME,
  "esim_partner_click",
];

/**
 * Store a recorded click on the response: the signed token in its HttpOnly
 * cookie, and the old readable cookies removed so they cannot be reused.
 */
export function applyPartnerClick(
  response: { cookies: { set: Function; delete: Function } },
  result: PartnerLinkClickResult | null
): void {
  if (!result?.clickToken) return;
  response.cookies.set(
    PARTNER_CLICK_TOKEN_COOKIE_NAME,
    result.clickToken,
    PARTNER_CLICK_TOKEN_COOKIE_OPTIONS
  );
  for (const name of LEGACY_COOKIES) response.cookies.delete(name);
}

/**
 * Link-preview fetchers and crawlers (doitac-1410 #026): they open the link to
 * draw a card in a chat or feed, which is not somebody visiting. Their request
 * is redirected like anyone's but never counted as a click.
 */
const PREVIEW_BOTS =
  /facebookexternalhit|facebookcatalog|meta-externalagent|twitterbot|slackbot|slack-imgproxy|discordbot|telegrambot|whatsapp|skypeuripreview|linkedinbot|embedly|redditbot|applebot|googlebot|bingbot|yandex|baiduspider|duckduckbot|petalbot|bytespider|ahrefsbot|semrushbot|mj12bot|headlesschrome|lighthouse|uptimerobot|pingdom|statuscake|curl\/|wget\/|python-requests|go-http-client|axios\/|node-fetch|okhttp|\bbot\b|crawler|spider|preview/i;

export function isLinkPreviewBot(userAgent: string | null | undefined): boolean {
  if (!userAgent?.trim()) return true;
  return PREVIEW_BOTS.test(userAgent);
}

/** Where a link points, without counting a click (doitac-1410 #026). */
export async function fetchPartnerLinkTarget(
  apiBaseUrl: string,
  code: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `${apiBaseUrl}/api/v1/partner-links/${encodeURIComponent(code)}/target`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as {
      targetPath?: string | null;
    } | null;
    return data?.targetPath ?? null;
  } catch {
    return null;
  }
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
