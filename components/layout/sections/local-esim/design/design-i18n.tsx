"use client";

import { createContext, useContext, type ReactNode } from "react";
import { tr } from "./design-i18n-core";

export { tr };

/**
 * Language of the ported product-page designs — region group (`rg-*`) and
 * domestic eSIM (`nd-*`) (vande #029).
 *
 * The designs were ported from Vietnamese-only HTML, so the English pages
 * still read Vietnamese. Their copy is now looked up by its Vietnamese text:
 * `t("Chọn gói cước")` is the Vietnamese string itself on /vi and its English
 * entry from {@link DESIGN_EN} on /en. Placeholders are positional —
 * `t("{0} ngày", n)`. A string with no English entry falls back to Vietnamese
 * rather than to an empty slot.
 */
const DesignLangContext = createContext<string>("vi");

export function DesignLangProvider({ lang, children }: { lang: string; children: ReactNode }) {
  return <DesignLangContext.Provider value={lang}>{children}</DesignLangContext.Provider>;
}

/** `t` for the current page language. */
export function useT(): (key: string, ...args: unknown[]) => string {
  const lang = useContext(DesignLangContext);
  return (key, ...args) => tr(lang, key, ...args);
}

export function useDesignLang(): string {
  return useContext(DesignLangContext);
}
