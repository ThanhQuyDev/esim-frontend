import { routing } from "@/i18n/routing";
import type { Locale } from "./i18n-config";

const dictionaries = {
  en: () => import("../messages/en.json").then((m) => m.default),
  vi: () => import("../messages/vi.json").then((m) => m.default),
};

export const getDictionary = async (locale: Locale | string) => {
  const key = (locale as Locale) in dictionaries
    ? (locale as Locale)
    : routing.defaultLocale;
  return dictionaries[key]();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
