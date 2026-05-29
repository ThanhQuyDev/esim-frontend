import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Replace `${key}` placeholders in a template string using values from `vars`.
 * Unknown keys and missing values are left untouched.
 *
 * @example
 *   interpolate("Hello ${name}", { name: "Vietnam" }) // → "Hello Vietnam"
 */
export function interpolate(
  template: string,
  vars?: Record<string, string | number | null | undefined>
): string {
  if (!template || !vars) return template ?? "";
  return template.replace(/\$\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    if (value === undefined || value === null || value === "") return match;
    return String(value);
  });
}

/**
 * Round a VND amount to the nearest thousand dong.
 */
export function roundVndToThousands(amount: number): number {
  return Math.round(amount / 1000) * 1000;
}

/**
 * Format data amount from MB to a human-readable string.
 * - ≥ 1024 MB → display as GB (e.g. 1024 → "1 GB", 2048 → "2 GB", 1536 → "1.5 GB")
 * - < 1024 MB → display as MB (e.g. 500 → "500 MB")
 */
export function formatData(mb: number): string {
  if (mb >= 1024) {
    const gb = mb / 1024;
    // Show integer if whole number, otherwise 1 decimal
    return Number.isInteger(gb) ? `${gb} GB` : `${parseFloat(gb.toFixed(1))} GB`;
  }
  return `${mb} MB`;
}

/**
 * Format data amount from MB to a compact string (no space).
 * - ≥ 1024 MB → "1GB", "1.5GB"
 * - < 1024 MB → "500MB"
 */
export function formatDataCompact(mb: number): string {
  if (mb >= 1024) {
    const gb = mb / 1024;
    return Number.isInteger(gb) ? `${gb}GB` : `${parseFloat(gb.toFixed(1))}GB`;
  }
  return `${mb}MB`;
}
