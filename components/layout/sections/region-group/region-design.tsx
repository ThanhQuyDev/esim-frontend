"use client";

import "./design/rg-desktop.css";
import "./design/rg-mobile.css";
import "./design/rg-switch.css";
import type { Region } from "@/lib/api";
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
export function RegionDesign({ members, label, lang, initialSlug }: RegionDesignProps) {
  const p = useRegionPurchase(members, lang, initialSlug);
  const variant = useDeviceVariant();
  const breadcrumb = {
    home: lang === "vi" ? "/" : `/${lang}`,
    destinations: localizedHref(lang, "destinations"),
  };
  return (
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
        itemName={`eSIM ${label} · ${p.codes.length} nước · ${planText(p)}`}
        totalLabel={vnd(p.total)}
      />
    </div>
  );
}
