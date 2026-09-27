/**
 * A stable id for this browser (#036).
 *
 * Used only to notice that several affiliate orders came from one device. It
 * is a first-party cookie so the `/go/[code]` redirect — which runs on the
 * server — can read the same value the checkout sends.
 */
export const VISITOR_ID_COOKIE_NAME = "esim_visitor_id";

/** A year: long enough to be useful, short enough not to be permanent. */
const MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

/** Read the browser's id, creating one on first use. */
export function getOrCreateVisitorId(): string | null {
  if (typeof document === "undefined") return null;

  const existing = readCookie(VISITOR_ID_COOKIE_NAME);
  if (existing) return existing;

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  document.cookie = `${VISITOR_ID_COOKIE_NAME}=${encodeURIComponent(id)}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax`;
  return id;
}
