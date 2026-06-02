"use client";

import type { Plan } from "@/lib/api";

/**
 * Plan tag badge — renders the chip-style label for each marketing tag.
 * Tag styles match the HTML reference (popular = black, best-seller = amber, new = orange, hot-deal = pink).
 */
export type PlanBadgeKind = "popular" | "best-seller" | "new" | "hot-deal";

const TAG_STYLES: Record<PlanBadgeKind, string> = {
  popular: "bg-[#111] text-white",
  "best-seller": "bg-[#D97706] text-white",
  "new": "bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74]",
  "hot-deal": "bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]",
};

const TAG_LABELS_VI: Record<PlanBadgeKind, string> = {
  popular: "Phổ biến",
  "best-seller": "Best Seller",
  "new": "Mới",
  "hot-deal": "Hot deal",
};

const TAG_LABELS_EN: Record<PlanBadgeKind, string> = {
  popular: "Popular",
  "best-seller": "Best Seller",
  "new": "New",
  "hot-deal": "Hot deal",
};

function normalizeTag(raw: string): PlanBadgeKind | null {
  const s = String(raw).toLowerCase().trim().replace(/\s+/g, "-").replace(/_/g, "-");
  if (s === "popular") return "popular";
  if (s === "best-seller" || s === "bestseller" || s === "best") return "best-seller";
  if (s === "new") return "new";
  if (s === "hot-deal" || s === "hot" || s === "hotdeal") return "hot-deal";
  return null;
}

interface PlanTagBadgesProps {
  tags?: string[] | null;
  lang?: string;
  className?: string;
}

/** Render a list of small chip badges from a plan's `tags` array. */
export function PlanTagBadges({ tags, lang = "vi", className = "" }: PlanTagBadgesProps) {
  if (!tags || tags.length === 0) return null;
  const labels = lang === "en" ? TAG_LABELS_EN : TAG_LABELS_VI;
  const normalized = tags.map(normalizeTag).filter((t): t is PlanBadgeKind => t !== null);
  if (normalized.length === 0) return null;
  return (
    <>
      {normalized.map((tag) => (
        <span
          key={tag}
          className={`text-[11px] font-bold tracking-wide px-[5px] py-[2px] rounded leading-tight shrink-0 whitespace-nowrap ${TAG_STYLES[tag]} ${className}`}
        >
          {labels[tag]}
        </span>
      ))}
    </>
  );
}

/**
 * Provider badge for local inventory plans — shows the provider name in a red label.
 * Shows for plans marked as isLocalInventory or with provider 'viettel'.
 */
export function ProviderBadge({ plan }: { plan: Plan }) {
  if (!plan.isLocalInventory && plan.provider !== 'viettel') return null;
  const provider = (plan.provider || "").toUpperCase();
  if (!provider) return null;
  return (
    <span
      className="text-[8.5px] font-bold tracking-[0.04em] uppercase px-[6px] py-[2px] rounded-[3px] leading-tight shrink-0 whitespace-nowrap text-white shadow-[0_1px_3px_rgba(192,0,0,0.3)]"
      style={{ backgroundColor: "#C00000" }}
    >
      {provider}
    </span>
  );
}

/** True when at least one of the plan's tags is a recognized marketing tag. */
export function hasMarketingTags(plan: Plan): boolean {
  if (!plan.tags || plan.tags.length === 0) return false;
  return plan.tags.some((t) => normalizeTag(String(t)) !== null);
}
