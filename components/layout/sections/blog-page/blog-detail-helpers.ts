import type { Blog, Plan } from "@/lib/api";

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
  return `/${lang}/blog/${encodeURIComponent(articleSlug)}`;
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

export const SOCIAL_LINKS = [
  { href: "https://www.tiktok.com/@sailyworld", alt: "original tiktok svg", src: "https://sb.nordcdn.com/m/440c12ed5253587d/original/original-tiktok-svg.svg", w: 24, h: 24 },
  { href: "https://x.com/sailyworld", alt: "original x svg", src: "https://sb.nordcdn.com/m/300bf91369291564/original/original-x-svg.svg", w: 24, h: 19 },
  { href: "https://www.facebook.com/sailyservice", alt: "original facebook svg", src: "https://sb.nordcdn.com/m/28723c26cd3497c4/original/original-facebook-svg.svg", w: 19, h: 24 },
  { href: "https://www.instagram.com/sailyworld", alt: "original instagram svg", src: "https://sb.nordcdn.com/m/2e4efabe94c552c4/original/original-instagram-svg.svg", w: 20, h: 24 },
  { href: "https://www.youtube.com/@esim_service", alt: "original youtube svg", src: "https://sb.nordcdn.com/m/7eb40efe0d874018/original/original-youtube-svg.svg", w: 24, h: 24 },
];
