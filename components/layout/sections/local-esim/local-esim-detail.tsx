"use client";

import "./design/nd-desktop.css";
import "./design/nd-mobile.css";
import "./design/nd-switch.css";
import type { PlansByDestinationResponse } from "@/lib/api";
import { useLocalPlansByCarrier, useLocalCarriers } from "@/lib/hooks";
import { localizedHref } from "@/lib/route-mapping";
import { getCarrierMeta } from "./carrier-meta";
import { CartConfirmDialog } from "../destination/cart-confirm-dialog";
import type { DestinationDict } from "../destination/types";
import type { Locale } from "@/lib/i18n-config";
import { DesignLangProvider } from "./design/design-i18n";
import { useDeviceVariant } from "@/lib/device-variant-context";
import type { DomesticCountry } from "./design/nd-parts";
import { NdSprite } from "./design/nd-icons";
import { NdDesktop } from "./design/nd-desktop";
import { NdMobile } from "./design/nd-mobile";
import { useDomesticPurchase, vnd } from "./design/nd-state";

interface LocalEsimDetailProps {
  carrier: string;
  dict: DestinationDict;
  lang: Locale;
  initialPlans?: PlansByDestinationResponse | null;
  /** Vietnam's picture and flag from the CMS (vande #029). */
  country?: DomesticCountry | null;
}

const EMPTY: PlansByDestinationResponse = {
  dataPlans: [],
  slowUnlimited: [],
  fastUnlimited: [],
  dailyUnlimited: [],
  smsCallEsim: [],
  localEsim: [],
};

/**
 * Domestic-eSIM carrier page body (`/esim-noi-dia/[carrier]`).
 *
 * Rebuilt from the final design files "esim-noi-dia-desktop-v60" and
 * "esim-noi-dia-mobile-v45" (#066, test round 4): the markup, class names and
 * CSS are the design's own (scoped under `.ndd` / `.ndm`), filled with the
 * carrier's real plans. Both layouts share one purchase state, so switching
 * width keeps the chosen plan, cycle and quantity.
 */
export function LocalEsimDetail({ carrier, lang, initialPlans, country }: LocalEsimDetailProps) {
  const meta = getCarrierMeta(carrier);
  const { data: grouped = EMPTY } = useLocalPlansByCarrier(carrier, lang, initialPlans ?? undefined);
  const { data: allCarriers = [] } = useLocalCarriers();
  const plans = grouped.localEsim ?? [];
  // The design's own breakpoint: the desktop grid needs 900px (nd-switch.css).
  const variant = useDeviceVariant("(min-width: 56.3125rem)");
  const p = useDomesticPurchase(plans, carrier, lang, `eSIM ${meta.label}`);

  const otherCarriers = allCarriers.filter((c) => c.provider !== carrier);
  const crossHref = (provider: string) =>
    lang === "vi" ? `/esim-noi-dia/${provider}` : `/${lang}/domestic-esim/${provider}`;
  const breadcrumb = {
    home: lang === "vi" ? "/" : `/${lang}`,
    destinations: localizedHref(lang, "destinations"),
    vietnam: lang === "vi" ? "/esim-viet-nam" : `/${lang}/esim-viet-nam`,
  };

  // The design's copy follows the page language (vande #029).
  return (
    <DesignLangProvider lang={lang}>
    <div className="nd-page" data-testid="local-esim-detail">
      <NdSprite />
      {/* One layout only, like the region page (vande #030): both were
          rendered and one hidden with CSS, so every heading appeared twice. */}
      {variant === "desktop" ? (
      <NdDesktop
        p={p}
        meta={meta}
        carrier={carrier}
        lang={lang}
        otherCarriers={otherCarriers}
        crossHref={crossHref}
        breadcrumb={breadcrumb}
        allPlans={plans}
        country={country ?? null}
      />
      ) : (
      <NdMobile
        p={p}
        meta={meta}
        lang={lang}
        otherCarriers={otherCarriers}
        crossHref={crossHref}
        breadcrumb={breadcrumb}
        country={country ?? null}
      />
      )}
      <CartConfirmDialog
        open={p.cartOpen}
        onClose={() => p.setCartOpen(false)}
        lang={lang}
        itemName={p.plan?.name || `eSIM ${meta.label}`}
        totalLabel={vnd(p.total)}
      />
    </div>
    </DesignLangProvider>
  );
}
