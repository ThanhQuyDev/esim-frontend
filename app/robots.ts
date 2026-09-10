import type { MetadataRoute } from "next";
import { EXCLUDED_ROUTES } from "@/lib/sitemap-entries";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://esim.vn";

/**
 * robots.txt (#091).
 *
 * The site had a sitemap but nothing pointing at it, and nothing telling
 * crawlers to leave the cart, checkout and account pages alone. Both languages
 * of each private area are listed, since the English site is prefixed `/en`.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = EXCLUDED_ROUTES.flatMap((route) => [route, `/en${route}`]);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nothing here can rank: a cart is per-visitor, checkout and payment
        // are transactional, and the profile area is behind a login.
        disallow: [...disallow, "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
