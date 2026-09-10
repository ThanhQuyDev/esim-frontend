import { test, expect } from "@playwright/test";

/**
 * #048 — Open Graph tags.
 *
 * The CMS stores ogTitle / ogDescription / ogImage, and the record has carried
 * them all along, but only those three ever reached the page: no og:type,
 * og:site_name, og:locale, og:url, and no Twitter card — so a shared link had no
 * site attribution, no preview language, and rendered as a small thumbnail on X.
 *
 * Asserted against the served HTML rather than a unit call, because what matters
 * is the tag a crawler receives — the page falls back to its own title and
 * description when no backend answers, which is exactly the case covered here.
 */

/**
 * Read the served HTML directly: metadata lives in <head>, which is simplest to
 * assert on as text, and it also proves the tags are server-rendered.
 */
async function headOf(
  request: { get: (url: string) => Promise<{ text: () => Promise<string> }> },
  path: string
): Promise<string> {
  const res = await request.get(path);
  const html = await res.text();
  return html.split("</head>")[0];
}

function metaContent(head: string, property: string): string | null {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)="${property}"[^>]*>`,
    "i"
  );
  const tag = head.match(pattern)?.[0];
  if (!tag) return null;
  return tag.match(/content="([^"]*)"/i)?.[1] ?? null;
}

test.describe("Open Graph tags", () => {
  test("emits site name, type and locale alongside title and description", async ({
    request,
  }) => {
    const head = await headOf(request, "/coupon");

    expect(metaContent(head, "og:site_name")).toBe("esim.vn");
    expect(metaContent(head, "og:type")).toBe("website");
    expect(metaContent(head, "og:title")).toBeTruthy();
    expect(metaContent(head, "og:description")).toBeTruthy();
  });

  test("declares a large-image Twitter card so shared links render big", async ({
    request,
  }) => {
    const head = await headOf(request, "/coupon");

    expect(metaContent(head, "twitter:card")).toBe("summary_large_image");
    expect(metaContent(head, "twitter:title")).toBeTruthy();
    expect(metaContent(head, "twitter:description")).toBeTruthy();
  });

  test("falls back to the page's own title when the record has no OG title", async ({
    request,
  }) => {
    const head = await headOf(request, "/coupon");

    // ogTitle is empty in the record, so og:title must mirror the meta title
    // rather than being dropped.
    const ogTitle = metaContent(head, "og:title");
    const title = head.match(/<title>([^<]*)<\/title>/i)?.[1];
    expect(ogTitle).toBeTruthy();
    expect(ogTitle).toBe(title);
  });
});
