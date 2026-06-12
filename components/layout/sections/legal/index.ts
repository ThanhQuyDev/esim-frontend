import type { Locale } from "@/lib/i18n-config";
import type { LegalPolicy } from "./legal-types";
import { refundPolicy } from "./content/refund-policy";
import { deliveryPolicy } from "./content/delivery-policy";
import { termsConditions } from "./content/terms-conditions";
import { privacyPolicy } from "./content/privacy-policy";

/** All legal policies, in sidebar display order. */
export const LEGAL_POLICIES: LegalPolicy[] = [
  refundPolicy,
  deliveryPolicy,
  termsConditions,
  privacyPolicy,
];

/**
 * Resolve a policy from a public URL slug for the given locale.
 * Matches the locale-specific `urlSlug` first, then falls back to the
 * canonical `slug` (so old/shared slugs still resolve).
 */
export function findPolicyBySlug(
  slug: string,
  locale: Locale
): LegalPolicy | undefined {
  return (
    LEGAL_POLICIES.find((p) => p.urlSlug[locale] === slug) ??
    LEGAL_POLICIES.find((p) => p.slug === slug)
  );
}

/**
 * Build the public href for a policy in the given locale.
 * vi → `/phap-ly/{vi-slug}`, en → `/en/legal/{en-slug}`.
 */
export function getPolicyHref(policy: LegalPolicy, locale: Locale): string {
  return locale === "en"
    ? `/en/legal/${policy.urlSlug.en}`
    : `/phap-ly/${policy.urlSlug.vi}`;
}

export { LegalPage } from "./legal-page";
export type { LegalPolicy, LegalPolicyContent } from "./legal-types";
