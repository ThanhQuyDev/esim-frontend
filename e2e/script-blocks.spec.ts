import { test, expect } from "@playwright/test";
import {
  JSON_LD_TYPE,
  isJsonLd,
  parseScriptBlocks,
} from "../lib/script-blocks";

/**
 * #049 — the CMS "Schema / Script" field must run more than JSON-LD.
 *
 * Every script used to be stamped `type="application/ld+json"`, so pasted
 * JavaScript was parsed as data and never ran; and a loader tag has no inner
 * content, which the old parser treated as "empty" and dropped — so
 * `<script async src=".../gtag/js?id=G-…">` never reached the page at all.
 *
 * The fixture below is the exact shape Thọ pastes: two gtag loaders, their inline
 * config snippets, a conversion event, and a schema, with HTML comments between.
 */

const PASTED = `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-52FRJQL6SK"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-52FRJQL6SK');
</script>
<!-- Event snippet for Lượt xem trang conversion page -->
<script>
gtag('event', 'conversion', {
'send_to': 'AW-1006366827/_Y-fCPX10KMbEOvg798D',
'value': 1.0,
'currency': 'VND'
});
</script>
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Organization", "name": "esim.vn" }
</script>
`;

test.describe("Pasted script blocks", () => {
  test("keeps the gtag loader, which used to be dropped for having no body", () => {
    const blocks = parseScriptBlocks(PASTED);
    const loader = blocks.find((b) => b.props.src);

    expect(loader).toBeDefined();
    expect(loader!.props.src).toBe(
      "https://www.googletagmanager.com/gtag/js?id=G-52FRJQL6SK",
    );
    // `async` must survive, or the loader blocks rendering.
    expect(loader!.props.async).toBe(true);
    expect(loader!.content).toBe("");
    // And it must NOT be labelled as data.
    expect(loader!.props.type).toBeUndefined();
  });

  test("leaves inline JavaScript untyped so the browser executes it", () => {
    const blocks = parseScriptBlocks(PASTED);
    const inline = blocks.filter((b) => b.content.includes("gtag("));

    expect(inline).toHaveLength(2);
    for (const block of inline) {
      expect(block.props.type).toBeUndefined();
      expect(isJsonLd(block)).toBe(false);
    }
  });

  test("still types a real schema as JSON-LD", () => {
    const blocks = parseScriptBlocks(PASTED);
    const schema = blocks.filter(isJsonLd);

    expect(schema).toHaveLength(1);
    expect(schema[0].props.type).toBe(JSON_LD_TYPE);
    expect(JSON.parse(schema[0].content).name).toBe("esim.vn");
  });

  test("keeps everything, in the pasted order", () => {
    const blocks = parseScriptBlocks(PASTED);

    // loader → config → conversion → schema. A config snippet reordered ahead of
    // its loader would still work, but a reordered conversion event would not.
    expect(blocks).toHaveLength(4);
    expect(blocks[0].props.src).toBeTruthy();
    expect(blocks[1].content).toContain("window.dataLayer");
    expect(blocks[2].content).toContain("'event', 'conversion'");
    expect(isJsonLd(blocks[3])).toBe(true);
  });

  test("infers JSON-LD from the content when no type was given", () => {
    const blocks = parseScriptBlocks(
      '<script>{"@context":"https://schema.org","@type":"FAQPage"}</script>',
    );

    expect(blocks).toHaveLength(1);
    expect(blocks[0].props.type).toBe(JSON_LD_TYPE);
  });

  test("treats a bare schema with no script tag as JSON-LD", () => {
    const blocks = parseScriptBlocks('{"@type":"Organization"}');

    expect(blocks).toHaveLength(1);
    expect(blocks[0].props.type).toBe(JSON_LD_TYPE);
  });

  test("honours an explicit type instead of guessing", () => {
    const blocks = parseScriptBlocks(
      '<script type="text/partytown">console.log(1)</script>',
    );

    expect(blocks[0].props.type).toBe("text/partytown");
  });

  test("drops an empty inline script and unknown attributes", () => {
    const blocks = parseScriptBlocks(
      '<script></script><script onload="alert(1)" defer>console.log(2)</script>',
    );

    expect(blocks).toHaveLength(1);
    // `defer` is carried over; an inline event handler is not forwarded.
    expect(blocks[0].props.defer).toBe(true);
    expect(blocks[0].props.onLoad).toBeUndefined();
    expect(blocks[0].props.onload).toBeUndefined();
  });

  test("carries over the attributes a tag manager needs", () => {
    const blocks = parseScriptBlocks(
      '<script src="https://x.test/a.js" id="gtm" crossorigin="anonymous" data-cfasync="false"></script>',
    );

    expect(blocks[0].props).toMatchObject({
      src: "https://x.test/a.js",
      id: "gtm",
      crossOrigin: "anonymous",
      "data-cfasync": "false",
    });
  });

  test("returns nothing for an empty field", () => {
    expect(parseScriptBlocks("")).toEqual([]);
    expect(parseScriptBlocks("   \n ")).toEqual([]);
  });
});
