"use client";

import { useEffect } from "react";
import { getOrCreateVisitorId } from "@/lib/visitor-id";

/** Remembers the Vietnamese day this browser was last reported. */
const STORAGE_KEY = "esim_visit_day";

/** Today in Vietnam, `2026-10-25`. */
function vietnamDay(): string {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * Reports a visit once per browser per day (vande #059), for the audience
 * charts on the CMS overview: device, system and city of who comes to the
 * site, and how many come back. The server keeps one row per day whatever is
 * sent; the day stored here only saves the request.
 *
 * Never blocks, never throws, never awaited.
 */
export function VisitBeacon() {
  useEffect(() => {
    try {
      const today = vietnamDay();
      if (window.localStorage.getItem(STORAGE_KEY) === today) return;
      const visitorId = getOrCreateVisitorId();
      if (!visitorId) return;
      // Marked before sending: the next page of the same visit must not
      // send it again while this request is still on its way.
      window.localStorage.setItem(STORAGE_KEY, today);
      void fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
        keepalive: true,
      }).catch(() => {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Nothing more to do.
        }
      });
    } catch {
      // No storage or no cookies: this visit simply is not counted.
    }
  }, []);
  return null;
}
