/**
 * Reports the steps of a buying session (#040).
 *
 * A real purchase has a shape: the visitor opens a destination, compares a
 * couple of plans, adds one to the cart, then goes to pay. An order built by a
 * script has none of it — click straight to payment — and a script driving a
 * browser has the opposite tell, twenty plans in ten seconds. Neither is
 * visible unless the steps are recorded, so this sends them.
 *
 * Never blocks, never throws, never awaited: a tracking call that got in the
 * way of a purchase would be far worse than the fraud it watches for.
 */

import { getOrCreateVisitorId } from "@/lib/visitor-id";
import { readPartnerClickId } from "@/lib/partner-click-id";

export type JourneyEvent =
  | "plan_list"
  | "plan_view"
  | "add_to_cart"
  | "checkout_start";

type QueuedEvent = { type: JourneyEvent; ref?: string };

const FLUSH_DELAY_MS = 1200;
/** The same step on the same thing twice in a row says nothing new. */
const DEDUPE_WINDOW_MS = 2000;

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
const lastSent = new Map<string, number>();

function post(body: string): void {
  // `sendBeacon` survives the page being navigated away from, which is exactly
  // when the last step of a journey is reported.
  try {
    if (navigator.sendBeacon?.(
      "/api/track",
      new Blob([body], { type: "application/json" })
    )) {
      return;
    }
  } catch {
    // Fall through to fetch.
  }

  void fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

function flush(): void {
  timer = null;
  const events = queue;
  queue = [];
  if (!events.length) return;

  let visitorId: string | null = null;
  try {
    visitorId = getOrCreateVisitorId();
  } catch {
    // No id to group the session by; the click id below may still carry it.
  }
  const clickId = readPartnerClickId();
  if (!visitorId && !clickId) return;

  post(JSON.stringify({ visitorId, clickId, events }));
}

export function trackJourney(type: JourneyEvent, ref?: string): void {
  if (typeof window === "undefined") return;

  const key = `${type}:${ref ?? ""}`;
  const now = Date.now();
  const previous = lastSent.get(key);
  if (previous && now - previous < DEDUPE_WINDOW_MS) return;
  lastSent.set(key, now);

  queue.push(ref ? { type, ref } : { type });
  // Batched, so a visitor clicking through five plans sends one request.
  if (!timer) timer = setTimeout(flush, FLUSH_DELAY_MS);
}
