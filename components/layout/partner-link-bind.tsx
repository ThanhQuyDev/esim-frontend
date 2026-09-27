"use client";

import { useEffect } from "react";

import { useAuth } from "@/lib/auth";
import {
  PARTNER_LINK_CLICKED_AT_COOKIE_NAME,
  PARTNER_LINK_COOKIE_NAME,
} from "@/lib/partner-link";

/**
 * Ties a KOL's marketing link to the signed-in customer's account (#034).
 *
 * The attribution cookie only covers the device it was set on. Somebody who
 * opens the link on a laptop while signed in and then buys on their phone is
 * the same customer, and the brief says the partner still earns — so once we
 * know who the visitor is, the attribution is stored against the account and
 * the next order finds it from any device.
 *
 * Every fresh click binds again, even to the same link (#037, #038): the later
 * link has to replace the earlier one, and re-opening the same link restarts
 * that partner's window — neither happens if the browser decides it has
 * already bound this code once.
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
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token) return;

    const code = readCookie(PARTNER_LINK_COOKIE_NAME);
    if (!code) return;

    // One bind per click per account — not per code. The account is in the key
    // because two people sharing a browser are two customers, and the click
    // timestamp is in it because a second click on the same link is a new
    // click, which has to push the partner's window forward (#037, #038).
    const clickedAt = readCookie(PARTNER_LINK_CLICKED_AT_COOKIE_NAME) ?? "";
    const visit = `${user?.id ?? "?"}:${code}@${clickedAt}`;

    let alreadyBound: string | null = null;
    try {
      alreadyBound = localStorage.getItem(BOUND_KEY);
    } catch {
      // Private mode: binding again is harmless, the row is upserted.
    }
    if (alreadyBound === visit) return;

    void fetch(`/api/partner-links/${encodeURIComponent(code)}/bind`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) return;
        try {
          localStorage.setItem(BOUND_KEY, visit);
        } catch {
          // Nothing to do; the next page view simply binds again.
        }
      })
      .catch(() => {});
  }, [token, user?.id]);

  return null;
}
