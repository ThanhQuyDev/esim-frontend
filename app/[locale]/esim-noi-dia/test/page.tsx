"use client";

/**
 * TEST-ONLY harness for the domestic-eSIM feature.
 *
 * Two real components are mounted client-side so Playwright's `page.route`
 * (which only intercepts BROWSER requests) can drive them against a mocked
 * network layer. The real pages can't be used directly:
 *   - `/` (homepage) and `/esim-noi-dia/[carrier]` are SERVER components whose
 *     SSR fetches hit the backend and throw / notFound when it's unreachable.
 *
 * Views (query param `?view=`):
 *   - `detail` (default) → mounts {@link LocalEsimDetail} WITHOUT initialPlans,
 *     so its client hook fetches plans from the mock.
 *   - `tab` → mounts the real {@link DestinationsSection} so the "eSIM nội địa"
 *     tab + {@link LocalCarrierGrid} card grid can be exercised.
 *
 * Guard: 404 in production — only renders under `next dev`.
 *
 * Query params:
 *   ?view=detail|tab
 *   ?carrier=wintel|itel|vnsky|...   (detail view; default wintel)
 *   ?lang=vi|en                       (defaults to the route locale)
 */

import { notFound } from "next/navigation";
import { useLocale, useMessages } from "next-intl";
import { LocalEsimDetail } from "@/components/layout/sections/local-esim/local-esim-detail";
import { DestinationsSection } from "@/components/layout/sections/destinations";
import type { DestinationDict } from "@/components/layout/sections/destination/types";
import type { Locale } from "@/lib/i18n-config";

export default function LocalEsimTestPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const locale = useLocale() as Locale;
  const messages = useMessages() as Record<string, unknown>;

  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const view = params.get("view") ?? "detail";
  const carrier = (params.get("carrier") ?? "wintel").toLowerCase();
  const lang = (params.get("lang") as Locale | null) ?? locale;

  if (view === "tab") {
    const destDict = messages.destinations as Record<string, unknown>;
    return (
      <main role="main">
        <p data-testid="local-test-meta">view=tab lang={lang}</p>
        <DestinationsSection dict={destDict} lang={lang} />
      </main>
    );
  }

  const dict = messages.destinationPage as DestinationDict;
  return (
    <main role="main" style={{ padding: 12 }}>
      <p data-testid="local-test-meta">carrier={carrier} lang={lang}</p>
      <LocalEsimDetail carrier={carrier} dict={dict} lang={lang} />
    </main>
  );
}
