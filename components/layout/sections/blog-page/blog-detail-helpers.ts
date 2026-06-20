import { getFooters, pickLocalizedTitle, type Blog, type Plan } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function categorySlug(cat: string): string {
  return cat
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function blogDetailHref(blog: { slug: string; category?: string | null; parent?: string | null }, lang: string): string {
  const articleSlug = (blog.slug || "").replace(/^\//, "");
  return lang === 'vi' ? `/blog/${encodeURIComponent(articleSlug)}` : `/${lang}/blog/${encodeURIComponent(articleSlug)}`;
}

export function authorSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function formatTimeRead(timeRead: number | string | null): string {
  if (timeRead === null || timeRead === undefined) return "";
  if (typeof timeRead === "number") return `${timeRead} min read`;
  return timeRead;
}

export function formatDataMb(mb: number): string {
  return mb >= 1024 ? `${Math.round(mb / 1024)} GB` : `${mb} MB`;
}

export function formatPrice(plan: Plan): string {
  return `${plan.vndPrice.toLocaleString('vi-VN')} đ`;
}

export interface SocialLink {
  href: string;
  alt: string;
  src: string;
}

function isFollowUsCategory(category: string | null | undefined): boolean {
  const t = (category ?? "").trim().toLowerCase();
  return (
    t === "follow us" ||
    t === "theo dõi" ||
    t === "theo doi" ||
    t.includes("follow") ||
    t.includes("theo dõi")
  );
}

/**
 * Fetch social links from the footer "Follow us" / "Theo dõi" category.
 * Mirrors the data the footer renders, so blog and footer stay in sync.
 * Only links that have an icon (iconUrl) are returned.
 */
export async function getSocialLinks(lang: Locale = "en"): Promise<SocialLink[]> {
  try {
    const footers = await getFooters({ lang });
    return footers
      .filter((f) => isFollowUsCategory(f.categories) && f.url?.trim() && f.iconUrl?.trim())
      .map((f) => ({
        href: f.url.trim(),
        alt: pickLocalizedTitle(f, lang).trim().toLowerCase() || "social",
        src: (f.iconUrl as string).trim(),
      }));
  } catch {
    return [];
  }
}
