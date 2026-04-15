import type { Locale } from "./i18n-config";

const dictionaries = {
  en: () => import("../dictionaries/en.json").then((m) => m.default),
  vi: () => import("../dictionaries/vi.json").then((m) => m.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]?.() ?? dictionaries.en();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
