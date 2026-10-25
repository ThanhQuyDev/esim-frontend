"use client";


import { DesignLangProvider, tr } from "../local-esim/design/design-i18n";
import "./design/rg-desktop.css";
import "./design/rg-mobile.css";
import "./design/rg-switch.css";
import type { Destination, PlansByDestinationResponse, Region } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";
import { localizedHref } from "@/lib/route-mapping";
import { useDeviceVariant } from "@/lib/device-variant-context";
import { CartConfirmDialog } from "../destination/cart-confirm-dialog";
import { vnd } from "../local-esim/design/nd-state";
import { RgSprite } from "./design/rg-icons";
import { RgDesktop } from "./design/rg-desktop";
import { RgMobile } from "./design/rg-mobile";
import { planText } from "./design/rg-parts";
import { useRegionPurchase } from "./design/rg-state";

interface RegionDesignProps {
  /** Country page on the same design (vande #032). */
  country?: Destination | null;
  initialPlans?: PlansByDestinationResponse | null;
  /** Country page: the CMS note, shown in the design's own note bar. */
  noticeHtml?: string | null;
  /** The packs of one region (one for a plain region page). */
  members: Region[];
  /** "Châu Á" — the region's name without its country count. */
  label: string;
  lang: Locale;
  /** The pack to open first (a pack page's own slug). */
  initialSlug?: string;
}

/**
 * Region product page body (`/esim-chau-a`, `/esim-chau-au`…), rebuilt from
 * the final design files "esim-chau-a-desktop-v41" and "-mobile-v36" (#067,
 * test round 4): the markup, class names and CSS are the design's own
 * (scoped under `.rgd` / `.rgm`), filled with the region's real packs and
 * plans. Only the layout for the device is rendered — one <h1> per page
 * (#001); both share one purchase state, so a resize keeps the choices.
 */
export function RegionDesign({ members, label, lang, initialSlug, country, initialPlans, noticeHtml }: RegionDesignProps) {
  const p = useRegionPurchase(members, lang, initialSlug, country, initialPlans, noticeHtml);
  const variant = useDeviceVariant();
  const breadcrumb = {
    home: lang === "vi" ? "/" : `/${lang}`,
    destinations: localizedHref(lang, "destinations"),
  };
  // The design's copy follows the page language (vande #029).
  return (
    <DesignLangProvider lang={lang}>
    <div className="rg-page" data-testid="region-design">
      <RgSprite />
      {variant === "desktop" ? (
        <RgDesktop p={p} label={label} lang={lang} breadcrumb={breadcrumb} />
      ) : (
        <RgMobile p={p} label={label} lang={lang} breadcrumb={breadcrumb} />
      )}
      <CartConfirmDialog
        open={p.cartOpen}
        onClose={() => p.setCartOpen(false)}
        lang={lang}
        itemName={
          country
            ? tr(lang, "eSIM {0} · {1}", label, planText(p, lang))
            : tr(lang, "eSIM {0} · {1} nước · {2}", label, p.codes.length, planText(p, lang))
        }
        totalLabel={vnd(p.total)}
      />
    </div>
    </DesignLangProvider>
  );
}

/**
 * A country page on the region design (vande #032): the country is the one
 * "pack", so the design drops its coverage step and reads like the country
 * design file (esim-trung-quoc-desktop/mobile).
 */
export function CountryDesign({
  destination,
  label,
  lang,
  initialPlans,
  noticeHtml,
}: {
  destination: Destination;
  label: string;
  lang: Locale;
  initialPlans?: PlansByDestinationResponse | null;
  noticeHtml?: string | null;
}) {
  const member = {
    ...(destination as unknown as Region),
    destinations: [destination],
    destinationCount: 1,
  } as Region;
  return (
    <RegionDesign
      members={[member]}
      label={label}
      lang={lang}
      country={destination}
      initialPlans={initialPlans}
      noticeHtml={noticeHtml}
    />
  );
}
