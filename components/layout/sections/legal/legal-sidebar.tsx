import Link from "next/link";
import type { Locale } from "@/lib/i18n-config";
import { LEGAL_POLICIES, getPolicyHref } from "./index";

export function LegalSidebar({
  activeSlug,
  locale,
}: {
  activeSlug: string;
  locale: Locale;
}) {
  return (
    <nav
      aria-label={locale === "en" ? "Legal policies" : "Chính sách pháp lý"}
    >
      <p className="body-sm-medium text-text-tertiary uppercase tracking-wide mb-3">
        {locale === "en" ? "Legal" : "Pháp lý"}
      </p>
      <ul className="flex flex-col gap-1">
        {LEGAL_POLICIES.map((policy) => {
          const isActive = policy.slug === activeSlug;
          return (
            <li key={policy.slug}>
              <Link
                href={getPolicyHref(policy, locale)}
                aria-current={isActive ? "page" : undefined}
                className={`block rounded-lg px-3 py-2 body-md transition-colors ${
                  isActive
                    ? "bg-bg-secondary text-text-primary font-medium"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                }`}
              >
                {policy.navLabel[locale]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
