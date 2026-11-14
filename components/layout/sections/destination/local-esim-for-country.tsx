import { LocalCarrierGrid } from "@/components/layout/sections/local-esim/local-carrier-grid";
import type { LocalCarrier } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";

/**
 * "Xem thêm các eSIM khác dùng tại Việt Nam" (vande-1411 #026), under "Đi nhiều
 * nước?": every domestic eSIM that belongs to this country, all of them.
 */
export function LocalEsimForCountry({
  carriers,
  countryName,
  fromLabel,
  lang,
}: {
  carriers: LocalCarrier[];
  countryName: string;
  fromLabel: string;
  lang: Locale;
}) {
  if (carriers.length === 0) return null;
  return (
    <section
      data-section="LocalEsimForCountry"
      data-testid="local-esim-for-country"
      className="px-4 py-10 sm:px-0"
    >
      <h2 className="heading-md mb-1.5 text-text-primary">
        {lang === "vi"
          ? `Xem thêm các eSIM khác dùng tại ${countryName}`
          : `More eSIMs to use in ${countryName}`}
      </h2>
      <p className="body-md mb-5 text-text-secondary">
        {lang === "vi"
          ? "eSIM nội địa có số thuê bao, gọi, nhắn tin và data dùng lâu dài trong nước."
          : "Domestic eSIMs with a local number, calls, texts and data for a longer stay."}
      </p>
      <LocalCarrierGrid lang={lang} fromLabel={fromLabel} emptyLabel="" carriers={carriers} />
    </section>
  );
}

/**
 * The domestic eSIMs of a country (vande-1411 #026): those whose local
 * destination has it as parent, and — in Vietnam — every domestic carrier
 * without a local destination yet, since all of them are Vietnamese.
 */
export function localEsimsOf(
  carriers: LocalCarrier[],
  destination: { id: number | string; countryCode?: string | null },
): LocalCarrier[] {
  const isVietnam = (destination.countryCode || "").toUpperCase() === "VN";
  return carriers.filter((c) =>
    c.destination
      ? Number(c.destination.parentId) === Number(destination.id)
      : isVietnam
  );
}
