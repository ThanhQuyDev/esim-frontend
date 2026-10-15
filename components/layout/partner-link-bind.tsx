"use client";

import { useEffect } from "react";

import { useAuth } from "@/lib/auth";
import { fetchPartnerClickToken } from "@/lib/partner-click-id";

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
 * that partner's window.
 *
 * doitac-1410 #026: what is bound is the visitor's own signed click, read by
 * our server from its HttpOnly cookie — not a link code the page could be
 * told to send.
 *
 * Fire and forget: nothing on the page depends on the answer, and the backend
 * re-checks the attribution window at order time anyway.
 */
const BOUND_KEY = "esim_partner_link_bound";

export function PartnerLinkBind() {
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    void fetchPartnerClickToken().then((clickToken) => {
      if (cancelled || !clickToken) return;

      // One bind per click per account: two people sharing a browser are two
      // customers, and a new click is a new token.
      const visit = `${user?.id ?? "?"}:${clickToken.slice(-16)}`;
      let alreadyBound: string | null = null;
      try {
        alreadyBound = localStorage.getItem(BOUND_KEY);
      } catch {
        // Private mode: binding again is harmless, the row is upserted.
      }
      if (alreadyBound === visit) return;

      void fetch("/api/partner-links/bind", {
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
    });

    return () => {
      cancelled = true;
    };
  }, [token, user?.id]);

  return null;
}
