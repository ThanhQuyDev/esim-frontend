import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
