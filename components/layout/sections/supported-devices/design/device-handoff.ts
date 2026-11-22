"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDeviceInfo, verdictFor, type Verdict } from "./device-detect";

/**
 * The QR hand-off of the supported-devices page (vande-2011 #031), reused by
 * the product pages (#032, spec A8 / B9.8): a computer shows a QR code that
 * opens THIS page on the phone; the phone checks itself and sends the verdict
 * back, and the computer shows it. Single-use tokens, ten minutes, nothing
 * that identifies the visitor (backend `device-check`).
 */

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Takes `?k=` off the address once, so a reload or a shared link does not reuse it. */
function takeToken(): string | null {
  const url = new URL(window.location.href);
  const k = url.searchParams.get("k");
  if (!k) return null;
  url.searchParams.delete("k");
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  return k;
}

/**
 * The device this page runs on, against the supported list — `null` until
 * the list has loaded, and on a computer. A phone that came from a QR code
 * also hands its verdict to the computer that showed it.
 */
export function useOwnDevice(names: string[], phoneLabel: string): Verdict | null {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const done = useRef(false);
  const token = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    // Read before the list arrives: another effect may rewrite the address.
    if (token.current === undefined) token.current = takeToken();
  }, []);
  useEffect(() => {
    if (done.current || !names.length) return;
    done.current = true;
    (async () => {
      const info = await getDeviceInfo();
      const v = verdictFor(info, names, phoneLabel);
      if (v.state === "pc") return;
      setVerdict(v);
      const k = token.current;
      if (k) {
        await fetch(`${API}/api/v1/device-check/sessions/${encodeURIComponent(k)}/result`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: v.state, name: v.name, model: v.model ?? null }),
        }).catch(() => null);
      }
    })();
  }, [names, phoneLabel]);
  return verdict;
}

/**
 * A computer's QR code and the phone's answer. `enabled` false (a phone, or
 * the tab not shown yet) makes no session. `again()` starts a new code.
 */
export function useQrHandoff(enabled: boolean): { qrUrl: string; result: Verdict | null; again: () => void } {
  const [token, setToken] = useState<string | null>(null);
  const [result, setResult] = useState<Verdict | null>(null);
  const started = useRef(false);

  const newSession = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/v1/device-check/sessions`, { method: "POST" });
      if (!res.ok) return;
      setToken(((await res.json()) as { token: string }).token);
    } catch {
      /* no code; the manual check still works */
    }
  }, []);

  // Once per page view, even when React runs effects twice in development.
  useEffect(() => {
    if (!enabled || started.current) return;
    started.current = true;
    newSession();
  }, [enabled, newSession]);

  useEffect(() => {
    if (!token || result) return;
    let stop = false;
    let timer = 0;
    const poll = async () => {
      if (stop) return;
      try {
        const res = await fetch(`${API}/api/v1/device-check/sessions/${encodeURIComponent(token)}`, { cache: "no-store" });
        const body = (await res.json()) as { status: string; result?: Verdict };
        if (stop) return;
        if (body.status === "done" && body.result) {
          setResult(body.result);
          setToken(null);
          return;
        }
        if (body.status === "expired") {
          newSession();
          return;
        }
      } catch {
        /* try again */
      }
      timer = window.setTimeout(poll, 2500);
    };
    timer = window.setTimeout(poll, 2500);
    return () => {
      stop = true;
      window.clearTimeout(timer);
    };
  }, [token, result, newSession]);

  const again = useCallback(() => {
    setResult(null);
    newSession();
  }, [newSession]);

  const qrUrl =
    token && typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}?k=${encodeURIComponent(token)}`
      : "";
  return { qrUrl, result, again };
}
