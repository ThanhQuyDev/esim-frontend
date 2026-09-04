"use client";

/**
 * TEST-ONLY harness page for the Topup modal.
 *
 * The real "Top Up" trigger button in `esim-card-list.tsx` is currently
 * commented out, so there is no user-reachable path to open `TopupModal`.
 * This page mounts the *real* modal directly so Playwright can exercise the
 * billion / microesim topup UI against a mocked API.
 *
 * Guard: returns 404 in production builds — it only renders under
 * `next dev` (NODE_ENV !== "production"), so it can never ship to prod.
 *
 * Query params:
 *   ?provider=BILLION|MICRO_ESIM|AIRALO|...   (drives the mocked iccid/provider)
 *   ?iccid=<iccid>                             (defaults per provider)
 *   ?lang=vi|en                                (defaults to the route locale)
 */

import { useState } from "react";
import { notFound } from "next/navigation";
import { useLocale } from "next-intl";
import { TopupModal } from "@/components/layout/sections/profile/topup-modal";
import { profileTranslations } from "@/components/layout/sections/profile/translations";
import type { MyEsim } from "@/lib/hooks";

function buildFakeEsim(iccid: string, provider: string): MyEsim {
  return {
    id: 999001,
    orderItemId: 999001,
    userId: 1,
    iccid,
    smdpAddress: "test.smdp.example.com",
    activationCode: "TEST-ACTIVATION",
    lpa: "LPA:1$test.smdp.example.com$TEST-ACTIVATION",
    matchId: "",
    qrcode: "",
    directAppleInstallationUrl: "",
    apnValue: "internet",
    isRoaming: false,
    status: "available",
    dataUsed: "0",
    dataTotal: "1GB",
    expiresAt: null,
    activatedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    provider,
    phoneNumber: null,
    plan: {
      id: 1,
      name: "Test Source Plan",
      durationDays: 30,
      dataMb: 1024,
      topUp: true,
      type: "fixed",
    },
  };
}

export default function TopupTestPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const locale = useLocale() as "vi" | "en";
  const [open, setOpen] = useState(false);

  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const provider = (params.get("provider") ?? "BILLION").toUpperCase();
  const lang = (params.get("lang") as "vi" | "en" | null) ?? locale;
  const defaultIccid =
    provider === "MICRO_ESIM" ? "89000000000000microesim" : "89000000000000billion0";
  const iccid = params.get("iccid") ?? defaultIccid;

  const esim = buildFakeEsim(iccid, provider.toLowerCase());
  const t = profileTranslations[lang];

  return (
    <main role="main" style={{ padding: 24 }}>
      <h1 data-testid="topup-test-heading">Topup Test Harness</h1>
      <p data-testid="topup-test-meta">
        provider={provider} iccid={iccid} lang={lang}
      </p>
      <button
        type="button"
        data-testid="open-topup"
        onClick={() => setOpen(true)}
        style={{
          padding: "10px 16px",
          background: "#2563eb",
          color: "#fff",
          borderRadius: 8,
          fontWeight: 600,
        }}
      >
        Open Topup Modal
      </button>

      <TopupModal
        esim={esim}
        open={open}
        onClose={() => setOpen(false)}
        t={t}
        lang={lang}
      />
    </main>
  );
}
