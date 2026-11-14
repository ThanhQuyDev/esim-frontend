import type { Locale } from "@/lib/i18n-config";

/**
 * Card name in the destination lists: "eSIM Nhật Bản" / "Japan eSIM", as in
 * the list design trang-chu-tab-esim v3 (vande #089). Names that already say
 * eSIM (most regions) stay as they are.
 */
/**
 * A destination button's name without "eSIM" (vande-1411 #021): "Việt Nam",
 * not "eSIM Việt Nam"; "Châu Á", not "eSIM Châu Á". The product page keeps
 * {@link esimName}.
 */
export function placeName(name: string): string {
  if (!name) return name;
  const bare = name.replace(/\s*\besim\b\s*/gi, " ").trim();
  return bare || name;
}

export function esimName(name: string, lang: Locale) {
  if (!name || /esim/i.test(name)) return name;
  return lang === "vi" ? `eSIM ${name}` : `${name} eSIM`;
}
