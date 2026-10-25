import { DESIGN_EN } from "./design-i18n.en";

/**
 * Translation of the ported product-page designs (vande #029), without React:
 * usable from server code and plain helpers. The hooks live in design-i18n.tsx.
 */
export function tr(lang: string | undefined, key: string, ...args: unknown[]): string {
  const template = lang && lang !== "vi" ? (DESIGN_EN[key] ?? key) : key;
  if (!args.length) return template;
  const text = template.replace(/\{(\d+)\}/g, (m, i) => {
    const value = args[Number(i)];
    return value === undefined || value === null ? "" : String(value);
  });
  // "1 days" / "1 months" / "1 countries" read wrong in English.
  if (!lang || lang === "vi") return text;
  return text
    .replace(/(^|[^\d.,])1 (day|month|plan|carrier|destination)s\b/g, (_m, before: string, unit: string) => `${before}1 ${unit}`)
    .replace(/(^|[^\d.,])1 countries\b/g, (_m, before: string) => `${before}1 country`);
}
