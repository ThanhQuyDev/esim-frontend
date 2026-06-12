import type { Locale } from "@/lib/i18n-config";
import type { LegalPolicy } from "./legal-types";
import { LegalContent } from "./legal-content";
import { LegalSidebar } from "./legal-sidebar";

export function LegalPage({
  policy,
  locale,
}: {
  policy: LegalPolicy;
  locale: Locale;
}) {
  return (
    <div className="max-w-[1168px] mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
        <aside className="min-w-0 lg:sticky lg:top-24 self-start">
          <LegalSidebar activeSlug={policy.slug} locale={locale} />
        </aside>
        <LegalContent content={policy.content[locale]} />
      </div>
    </div>
  );
}
