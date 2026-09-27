"use client";

import { useEffect } from "react";

import { useAuth } from "@/lib/auth";
import { PARTNER_LINK_COOKIE_NAME } from "@/lib/partner-link";

/**
 * Ties a KOL's marketing link to the signed-in customer's account (#034).
 *
 * The attribution cookie only covers the device it was set on. Somebody who
 * opens the link on a laptop while signed in and then buys on their phone is
 * the same customer, and the brief says the partner still earns — so once we
 * know who the visitor is, the attribution is stored against the account and
 * the next order finds it from any device.
 *
 * Fire and forget: nothing on the page depends on the answer, and the backend
 * re-checks the attribution window at order time anyway.
 */
const BOUND_KEY = "esim_partner_link_bound";

function readCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]!) : null;
}

export function PartnerLinkBind() {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const code = readCookie(PARTNER_LINK_COOKIE_NAME);
    if (!code) return;

    // Bind each code once per browser; re-opening the same link on every page
    // view would be a request per navigation for no new information.
    let alreadyBound: string | null = null;
    try {
      alreadyBound = localStorage.getItem(BOUND_KEY);
    } catch {
      // Private mode: binding again is harmless, the row is upserted.
    }
    if (alreadyBound === code) return;

    void fetch(`/api/partner-links/${encodeURIComponent(code)}/bind`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) return;
        try {
          localStorage.setItem(BOUND_KEY, code);
        } catch {
          // Nothing to do; the next page view simply binds again.
        }
      })
      .catch(() => {});
  }, [token]);

  return null;
}
