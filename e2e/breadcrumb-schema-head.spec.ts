import { test, expect } from "@playwright/test";
import { resolveBreadcrumbTrail, readableSlug } from "../lib/breadcrumb-trail";
import vi from "../messages/vi.json";
import en from "../messages/en.json";

/**
 * #052 — BreadcrumbList must live in <head>, not in <body>.
 *
 * It used to be emitted by the visible Breadcrumb component, which pages render
 * in their body. A head-level component can only work if the trail is derived
 * from the request path (a page body cannot inject into an already-flushed head),
 * so the resolver below is the load-bearing part: get a label wrong and the
 * marked-up trail stops matching the visible one, which is what Google flags.
 */

const DICT_VI = vi as unknown as Record<string, any>;
const DICT_EN = en as unknown as Record<string, any>;

test.describe("Trail resolution", () => {
  test("names a static page from the same dictionary the bar uses", async () => {
    expect(await resolveBreadcrumbTrail("/gio-hang", "vi", DICT_VI)).toEqual([
      { label: vi.breadcrumb.cart, href: "/gio-hang" },
    ]);
    expect(await resolveBreadcrumbTrail("/en/cart", "en", DICT_EN)).toEqual([
      { label: en.breadcrumb.cart, href: "/en/cart" },
    ]);
  });

  test("hangs a nested page under its parent", async () => {
    const trail = await resolveBreadcrumbTrail(
      "/ho-tro/lien-he/thanh-cong",
      "vi",
      DICT_VI,
    );

    expect(trail.map((t) => t.label)).toEqual([
      vi.breadcrumb.helpCenter,
      vi.breadcrumb.helpCenterSupport,
      vi.breadcrumb.helpCenterSupportSuccess,
    ]);
    // Every crumb but the last links somewhere.
    expect(trail[0].href).toBe("/ho-tro");
    expect(trail[1].href).toBe("/ho-tro/lien-he");
  });

  test("uses the locale's own path, not the Vietnamese one", async () => {
    const trail = await resolveBreadcrumbTrail(
      "/en/help-center/support",
      "en",
      DICT_EN,
    );

    expect(trail[0].href).toBe("/en/help-center");
    expect(trail[1].href).toBe("/en/help-center/support");
  });

  test("gives the homepage no trail at all", async () => {
    // A list containing only "Home" describes no path; Google ignores it.
    expect(await resolveBreadcrumbTrail("/", "vi", DICT_VI)).toEqual([]);
    expect(await resolveBreadcrumbTrail("/en", "en", DICT_EN)).toEqual([]);
  });

  test("keeps the test harnesses out of search results", async () => {
    expect(
      await resolveBreadcrumbTrail("/esim-noi-dia/test", "vi", DICT_VI),
    ).toEqual([]);
    expect(
      await resolveBreadcrumbTrail("/ho-so/topup-test", "vi", DICT_VI),
    ).toEqual([]);
  });

  test("builds the help-centre article trail from the slug", async () => {
    const trail = await resolveBreadcrumbTrail(
      "/ho-tro/thanh-toan/hoan-tien",
      "vi",
      DICT_VI,
    );

    expect(trail).toHaveLength(3);
    expect(trail[0].label).toBe(vi.breadcrumb.helpCenter);
    expect(trail[1].href).toBe("/ho-tro/thanh-toan");
  });

  test("labels a legal page and a domestic carrier page", async () => {
    expect(
      (await resolveBreadcrumbTrail("/phap-ly/chinh-sach-hoan-tien", "vi", DICT_VI))
        .map((t) => t.label),
    ).toEqual([vi.breadcrumb.legal, "Chinh sach hoan tien"]);

    expect(
      (await resolveBreadcrumbTrail("/esim-noi-dia/wintel", "vi", DICT_VI)).map(
        (t) => t.label,
      ),
    ).toEqual([vi.breadcrumb.domesticEsim, "Wintel"]);
  });

  test("falls back to a readable slug rather than inventing a name", async () => {
    expect(readableSlug("chinh-sach-hoan-tien")).toBe("Chinh sach hoan tien");
    expect(readableSlug("wintel")).toBe("Wintel");

    // An unknown nested route still produces a usable, linked trail.
    const trail = await resolveBreadcrumbTrail("/mot/hai", "vi", DICT_VI);
    expect(trail).toEqual([
      { label: "Mot", href: "/mot" },
      { label: "Hai", href: undefined },
    ]);
  });
});

/* ── The tag itself ── */

async function headOf(
  request: { get: (url: string) => Promise<{ text: () => Promise<string> }> },
  path: string,
): Promise<string> {
  const res = await request.get(path);
  const html = await res.text();
  return html.split("</head>")[0];
}

function jsonLdBlocks(head: string): Record<string, any>[] {
  const blocks: Record<string, any>[] = [];
  const regex =
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(head)) !== null) {
    try {
      blocks.push(JSON.parse(match[1]));
    } catch {
      // A malformed CMS block is not this test's business.
    }
  }
  return blocks;
}

test.describe("BreadcrumbList placement", () => {
  test("is served inside <head>, exactly once", async ({ request }) => {
    const res = await request.get("/gio-hang");
    const html = await res.text();
    const head = html.split("</head>")[0];
    const body = html.slice(head.length);

    const inHead = jsonLdBlocks(head).filter(
      (b) => b["@type"] === "BreadcrumbList",
    );
    expect(inHead).toHaveLength(1);
    expect(inHead[0].itemListElement[0].name).toBe(vi.breadcrumb.home);

    // The old copy in the body must be gone, not merely duplicated. (The name
    // still appears in Next's streaming payload, which is why this counts
    // rendered JSON-LD scripts rather than searching the raw HTML.)
    const inBody = jsonLdBlocks(body).filter(
      (b) => b["@type"] === "BreadcrumbList",
    );
    expect(inBody).toHaveLength(0);
  });

  test("still renders the visible breadcrumb bar", async ({ page }) => {
    await page.goto("/gio-hang");

    // The schema moved; the navigation the customer sees did not.
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  });
});
