/**
 * "Nguồn truy cập" (vande-0411 #052): the signals of the first page of a browsing
 * session, kept for the order. Only short facts leave the browser: the referring
 * site's name, the UTM words, which click ids were there (not their values), and
 * whether Google quoted a passage (not the passage). Never a whole address, which
 * can carry a person's details. The API names the source from these.
 */

const SESSION_KEY = "esim_traffic_signals";
/** A new tab opened from our own pages keeps the source of the visit. */
const RECENT_KEY = "esim_traffic_recent";
const RECENT_MS = 30 * 60 * 1000;
/** Written by the middleware on every page opened (`middleware.ts`). */
const FETCH_SITE_COOKIE = "esim_sfs";
/** Same name as `PARTNER_CLICK_PENDING_COOKIE_NAME` (lib/partner-link, server-only). */
const PARTNER_PENDING_COOKIE = "esim_pc_pending";

const CLICK_IDS = [
  "gclid",
  "gbraid",
  "wbraid",
  "dclid",
  "srsltid",
  "fbclid",
  "igshid",
  "ttclid",
  "msclkid",
  "twclid",
  "li_fat_id",
];

export type TrafficSignals = {
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  clickIds?: string[];
  secFetchSite?: string;
  textFragment?: boolean;
  partnerLink?: boolean;
};

function cookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((pair) => pair.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

/** The site's name or `android-app://<package>`; nothing of the path. */
function referrerName(): { name?: string; internal: boolean } {
  const raw = document.referrer;
  if (!raw) return { internal: false };
  try {
    const url = new URL(raw);
    if (url.protocol === "android-app:") {
      return { name: `android-app://${url.hostname || url.pathname.replace(/^\/+/, "")}`, internal: false };
    }
    if (url.hostname === window.location.hostname) return { internal: true };
    return { name: url.hostname, internal: false };
  } catch {
    return { internal: false };
  }
}

/** Browsers hide `#:~:text=` from the address bar, not from this entry. */
function hasTextFragment(): boolean {
  try {
    const [entry] = performance.getEntriesByType("navigation");
    return !!entry?.name.includes(":~:text=");
  } catch {
    return false;
  }
}

function currentSignals(): { signals: TrafficSignals; internal: boolean } {
  const params = new URLSearchParams(window.location.search);
  const { name, internal } = referrerName();
  const clickIds = CLICK_IDS.filter((id) => params.has(id));
  const signals: TrafficSignals = {
    ...(name ? { referrer: name } : {}),
    ...(params.get("utm_source") ? { utmSource: params.get("utm_source")!.slice(0, 200) } : {}),
    ...(params.get("utm_medium") ? { utmMedium: params.get("utm_medium")!.slice(0, 200) } : {}),
    ...(params.get("utm_campaign") ? { utmCampaign: params.get("utm_campaign")!.slice(0, 200) } : {}),
    ...(clickIds.length ? { clickIds } : {}),
    ...(cookie(FETCH_SITE_COOKIE) ? { secFetchSite: cookie(FETCH_SITE_COOKIE) } : {}),
    ...(hasTextFragment() ? { textFragment: true } : {}),
    ...(cookie(PARTNER_PENDING_COOKIE) ? { partnerLink: true } : {}),
  };
  return { signals, internal };
}

function recentSignals(): TrafficSignals | null {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "null");
    return saved && Date.now() - saved.at < RECENT_MS ? saved.signals : null;
  } catch {
    return null;
  }
}

/** The first page of the session decides; later pages change nothing. */
export function captureTrafficSignals(): TrafficSignals | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) return JSON.parse(saved);
    const { signals, internal } = currentSignals();
    const chosen = internal ? (recentSignals() ?? signals) : signals;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(chosen));
    localStorage.setItem(RECENT_KEY, JSON.stringify({ signals: chosen, at: Date.now() }));
    return chosen;
  } catch {
    // Storage can be blocked; the order goes through regardless.
    return null;
  }
}
