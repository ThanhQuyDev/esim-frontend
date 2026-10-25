import type { MembershipTier, MembershipTierRung } from "@/lib/hooks";

/**
 * The built-in tiers' names, used until the ladder has loaded and for a tier
 * the backend no longer lists. An admin can rename them and add more in the
 * CMS (vande #066), so the ladder's own name comes first.
 */
const BUILT_IN_NAMES: Record<string, { vi: string; en: string }> = {
  traveler: { vi: "Du khách", en: "Traveler" },
  silver: { vi: "Du khách bạc", en: "Silver Traveler" },
  gold: { vi: "Du khách vàng", en: "Gold Traveler" },
  platinum: { vi: "Du khách bạch kim", en: "Platinum Traveler" },
};

const BUILT_IN_ACCENTS: Record<string, string> = {
  traveler: "from-sky-500 to-blue-600",
  silver: "from-slate-400 to-slate-600",
  gold: "from-amber-400 to-orange-500",
  platinum: "from-violet-500 to-indigo-700",
};

/** A tier an admin added has no colour of its own. */
const ADDED_TIER_ACCENT = "from-emerald-500 to-teal-700";

export function tierName(
  tier: MembershipTier | null | undefined,
  lang: "en" | "vi",
  tiers: MembershipTierRung[] | undefined
): string {
  if (!tier) return BUILT_IN_NAMES.traveler[lang];
  const rung = tiers?.find((r) => r.tier === tier);
  // An older backend sends no names; the built-in one is better than a code.
  const named = lang === "en" ? rung?.nameEn || rung?.name : rung?.name;
  return named || BUILT_IN_NAMES[tier]?.[lang] || tier;
}

export function tierAccent(tier: MembershipTier | null | undefined): string {
  if (!tier) return BUILT_IN_ACCENTS.traveler;
  return BUILT_IN_ACCENTS[tier] ?? ADDED_TIER_ACCENT;
}
