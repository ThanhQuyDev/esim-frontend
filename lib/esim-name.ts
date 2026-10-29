import type { Locale } from "@/lib/i18n-config";

/**
 * Card name in the destination lists: "eSIM Nhật Bản" / "Japan eSIM", as in
 * the list design trang-chu-tab-esim v3 (vande #089). Names that already say
 * eSIM (most regions) stay as they are.
 */
export function esimName(name: string, lang: Locale) {
  if (!name || /esim/i.test(name)) return name;
  return lang === "vi" ? `eSIM ${name}` : `${name} eSIM`;
}
