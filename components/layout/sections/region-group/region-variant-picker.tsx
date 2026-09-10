import { MapPin } from "lucide-react";
import { localizedSlug } from "@/lib/slug";
import type { RegionGroup } from "@/lib/region-groups";
import { regionDisplayTitle } from "@/lib/region-groups";
import type { Locale } from "@/lib/i18n-config";

interface RegionVariantPickerProps {
  group: RegionGroup;
  lang: Locale;
  /** Slug of the variant currently being viewed, if any. */
  activeSlug?: string;
  /** Localized "Từ" / "From" label. */
  fromLabel: string;
}

function href(lang: Locale, slug: string): string {
  return lang === "vi" ? `/${slug}` : `/${lang}/${slug}`;
}

/**
 * Lets the customer choose between same-named regions that differ only by how
 * many countries they cover ("eSIM Châu Á" 13 vs 20 countries).
 *
 * Rendered twice: as the body of the group landing page (`/esim-chau-a`) and
 * as a strip on top of a variant page, so someone who lands directly on
 * `/esim-chau-a-13-quoc-gia` can still see the other packs.
 */
export function RegionVariantPicker({
  group,
  lang,
  activeSlug,
  fromLabel,
}: RegionVariantPickerProps) {
  if (group.members.length < 2) return null;

  return (
    <div
      data-testid="region-variant-picker"
      className="grid gap-3 lg:gap-4 w-full md:grid-cols-2 lg:grid-cols-3"
    >
      {group.members.map((member) => {
        const slug = localizedSlug(member, lang);
        const isActive = activeSlug === slug;
        const count = member.destinationCount ?? 0;
        const price = Number(member.fromPrice);
        const countLabel =
          lang === "vi"
            ? `${count} quốc gia`
            : `${count} ${count === 1 ? "country" : "countries"}`;

        return (
          <a
            key={member.id}
            href={href(lang, slug)}
            aria-current={isActive ? "page" : undefined}
            data-testid={`region-variant-${slug}`}
            className={`block h-full rounded-sm border p-4 transition-colors ${
              isActive
                ? "border-bg-dark bg-bg-secondary"
                : "border-border-secondary bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-[36px] h-[36px] relative overflow-hidden shrink-0 rounded-full bg-bg-secondary">
                {member.avatarUrl || member.iconUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    alt={regionDisplayTitle(member, lang)}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover absolute inset-0"
                    src={member.avatarUrl || member.iconUrl}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-text-tertiary" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="body-lg-medium truncate">{countLabel}</p>
                <p className="body-md text-text-tertiary truncate">
                  {Number.isFinite(price) && price > 0
                    ? `${fromLabel} ${price.toLocaleString("vi-VN")}đ`
                    : regionDisplayTitle(member, lang)}
                </p>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
