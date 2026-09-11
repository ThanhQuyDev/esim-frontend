import type { LocalCarrier } from "@/lib/api";

/**
 * Presentation metadata for a domestic (local-inventory) carrier.
 *
 * Carriers are DATA-DRIVEN — the backend returns whichever providers have
 * active `isLocalInventory` plans (see `useLocalCarriers`). This map only holds
 * *display* details (brand colour, label casing, network infrastructure, phone
 * prefix), keyed by the lowercase provider slug.
 *
 * A provider with no entry here still renders via {@link getCarrierMeta}'s
 * fallback (uppercase label, neutral colour), so adding a new carrier upstream
 * never breaks the page — you only extend this map to brand it nicely.
 */
export interface CarrierMeta {
  /** Human-facing brand label, e.g. "Wintel", "iTEL", "VNSKY". */
  label: string;
  /** Logo circle background (brand colour). */
  logoBg: string;
  /** Network the carrier rides on, e.g. "VinaPhone". Rendered per locale by {@link carrierInfra}. */
  network: string;
  /** Subscriber number prefix shown as a pill, e.g. "055". */
  phonePrefix?: string;
  /** Render the logo label in italic (iTEL's wordmark is italic). */
  italic?: boolean;
}

const CARRIER_META: Record<string, CarrierMeta> = {
  wintel: {
    label: "Wintel",
    logoBg: "#E4232B",
    network: "VinaPhone",
    phonePrefix: "055",
  },
  itel: {
    label: "iTEL",
    logoBg: "#D91E2A",
    network: "VinaPhone",
    phonePrefix: "087",
    italic: true,
  },
  vnsky: {
    label: "VNSKY",
    logoBg: "#0A6CFF",
    network: "MobiFone",
    phonePrefix: "079",
  },
  viettel: {
    label: "Viettel",
    logoBg: "#EE0033",
    network: "Viettel",
    // No phonePrefix: Viettel sells several ranges (086/096–098/032–039) and
    // we don't know which one this inventory draws from — the row is optional,
    // so it stays hidden until someone fills in the real prefix.
  },
};

/**
 * Resolve display metadata for a provider slug. Falls back to a neutral,
 * still-usable presentation for carriers not yet in {@link CARRIER_META}.
 */
export function getCarrierMeta(provider: string): CarrierMeta {
  const key = (provider || "").toLowerCase();
  return (
    CARRIER_META[key] ?? {
      label: (provider || "eSIM").toUpperCase(),
      logoBg: "#6B7280",
      network: "",
    }
  );
}

/**
 * Localised infrastructure line: "Hạ tầng VinaPhone" / "VinaPhone network".
 * Empty when the carrier has no known network, so callers can skip the row.
 */
export function carrierInfra(meta: CarrierMeta, lang: string): string {
  if (!meta.network) return "";
  return lang === "vi" ? `Hạ tầng ${meta.network}` : `${meta.network} network`;
}

/** Short first letter(s) for the round logo badge when no image is used. */
export function carrierInitial(meta: CarrierMeta): string {
  return meta.label.trim().charAt(0).toUpperCase() || "e";
}

export type { LocalCarrier };
