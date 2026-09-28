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
