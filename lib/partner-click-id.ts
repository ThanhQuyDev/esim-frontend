/**
 * The server-minted click id (#039).
 *
 * The attribution cookie is the weakest link in the chain: Safari and iOS cap
 * script-written cookies well below the window a partner is promised, so a
 * customer who comes back a week later can cost the partner the commission
 * through nothing either of them did. The server therefore mints an id at the
 * moment of the click and puts it in the redirect URL. The browser only has to
 * hand it back at checkout, and `localStorage` — which those browsers do not
 * trim the same way — is where it waits.
 *
 * Deliberately free of any Node import so both the redirect route and the page
 * can use these names.
 */

/** Carries the id from `/go/<code>` to the landing page. */
export const PARTNER_CLICK_ID_PARAM = "pcid";

/**
 * A cookie as well, for the visitor who checks out before any of our
 * JavaScript ran. It is the fallback, not the mechanism.
 */
export const PARTNER_CLICK_ID_COOKIE_NAME = "esim_partner_click";

const STORAGE_KEY = "esim_partner_click_id";

/** 32 hex characters, as `randomBytes(16).toString('hex')` produces. */
function isWellFormed(id: string): boolean {
  return /^[0-9a-f]{16,64}$/.test(id);
}

export function rememberPartnerClickId(id: string | null | undefined): void {
  const value = id?.trim().toLowerCase();
  if (!value || !isWellFormed(value)) return;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Private mode: the cookie set alongside it still carries the visit.
  }
}

/** The id to send with an order, from storage first and the cookie second. */
export function readPartnerClickId(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isWellFormed(stored)) return stored;
  } catch {
    // Fall through to the cookie.
  }

  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${PARTNER_CLICK_ID_COOKIE_NAME}=([^;]*)`)
  );
  const fromCookie = match ? decodeURIComponent(match[1]!) : null;
  return fromCookie && isWellFormed(fromCookie) ? fromCookie : null;
}

let tokenRequest: Promise<string | null> | null = null;

/**
 * The signed click token kept in the HttpOnly cookie (doitac-1410 #026), asked
 * of our own server — the page cannot read that cookie itself. Asked once per
 * page; `refresh` asks again (after a new link was opened in this tab).
 */
export function fetchPartnerClickToken(refresh = false): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!tokenRequest || refresh) {
    tokenRequest = fetch("/api/partner-attribution", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { clickToken?: string | null } | null) => body?.clickToken ?? null)
      .catch(() => null);
  }
  return tokenRequest;
}

/** What to send as the click: the signed token, else a pre-token bare id. */
export async function partnerClickForOrder(): Promise<string | null> {
  return (await fetchPartnerClickToken(true)) ?? readPartnerClickId();
}
