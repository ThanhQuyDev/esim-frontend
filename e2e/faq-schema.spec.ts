import { test, expect } from "@playwright/test";
import {
  MAX_SCHEMA_FAQS,
  buildFaqSchema,
  faqSchemaId,
  sanitizeAnswerHtml,
  stripParagraphTags,
} from "../lib/faq-schema";
import { SITE_BASE_URL } from "../lib/hreflang";
import { faqCandidateUrls } from "../lib/faq-urls";

/**
 * #054 — any URL that has FAQ content publishes a FAQPage schema.
 *
 * Google only honours FAQPage when the marked-up questions are the ones visible
 * on the page, so the schema is built from the same records the FAQ block renders
 * (same context URLs, same priority, same `${name}` substitution), and a page
 * with no FAQ record emits nothing at all.
 */

function faq(id: string, question: string, answer: string) {
  return {
    id,
    language: "vi",
    isActive: true,
    sortOrder: 0,
    question,
    answer,
    createdAt: "",
    updatedAt: "",
  };
}

test.describe("FAQPage schema", () => {
  test("marks up each question with its answer", () => {
    const schema = buildFaqSchema([
      faq("1", "eSIM là gì?", "Là SIM điện tử."),
      faq("2", "Cài thế nào?", "Quét mã QR."),
    ])!;
    const entities = schema.mainEntity as Record<string, any>[];

    expect(schema["@type"]).toBe("FAQPage");
    expect(entities).toHaveLength(2);
    expect(entities[0]).toEqual({
      "@type": "Question",
      name: "eSIM là gì?",
      acceptedAnswer: { "@type": "Answer", text: "Là SIM điện tử." },
    });
  });

  test("substitutes the destination name, like the visible block does", () => {
    const schema = buildFaqSchema(
      [faq("1", "eSIM ${name} có gọi được không?", "Có, gói ${name} hỗ trợ gọi.")],
      { name: "Nhật Bản" },
    )!;
    const entity = (schema.mainEntity as Record<string, any>[])[0];

    expect(entity.name).toBe("eSIM Nhật Bản có gọi được không?");
    expect(entity.acceptedAnswer.text).toContain("Nhật Bản");
  });

  test("keeps the formatting Google allows and strips the rest", () => {
    expect(sanitizeAnswerHtml("<p>Xem <a href='/x'>đây</a></p>")).toBe(
      "<p>Xem <a href='/x'>đây</a></p>",
    );
    // A script or an iframe in acceptedAnswer.text invalidates the whole block.
    expect(
      sanitizeAnswerHtml('<p>Ok</p><script>alert(1)</script>'),
    ).toBe("<p>Ok</p>alert(1)");
    expect(sanitizeAnswerHtml('<iframe src="x"></iframe>Nội dung')).toBe(
      "Nội dung",
    );
  });

  test("skips a record with an empty question or answer", () => {
    const schema = buildFaqSchema([
      faq("1", "", "Câu trả lời không có câu hỏi"),
      faq("2", "Câu hỏi không có trả lời", "   "),
      faq("3", "Hợp lệ?", "Có."),
    ])!;

    expect(schema.mainEntity).toHaveLength(1);
  });

  test("emits nothing when the page has no FAQ", () => {
    // An empty FAQPage is a rich-result error, not a neutral no-op.
    expect(buildFaqSchema([])).toBeNull();
    expect(buildFaqSchema(null)).toBeNull();
    expect(buildFaqSchema([faq("1", "", "")])).toBeNull();
  });

  test("publishes @id and inLanguage for the page, like the reference schema (#021)", () => {
    const schema = buildFaqSchema(
      [faq("1", "What is a travel eSIM?", "<p>A travel eSIM is a type of eSIM.</p>")],
      undefined,
      { url: "/esim-han-quoc", lang: "vi" },
    )!;

    expect(schema["@id"]).toBe(`${SITE_BASE_URL}/esim-han-quoc#faq`);
    expect(schema.inLanguage).toBe("vi");
    // Same key order as the sample the SEO team sent.
    expect(Object.keys(schema)).toEqual([
      "@context",
      "@type",
      "@id",
      "inLanguage",
      "mainEntity",
    ]);
  });

  test("uses the English page URL and language on the English site (#021)", () => {
    const schema = buildFaqSchema([faq("1", "Q?", "A.")], undefined, {
      url: "/en/esim-china",
      lang: "en",
    })!;

    expect(schema["@id"]).toBe(`${SITE_BASE_URL}/en/esim-china#faq`);
    expect(schema.inLanguage).toBe("en");
    expect(faqSchemaId("/")).toBe(`${SITE_BASE_URL}/#faq`);
  });

  test("removes <p> tags from the answer text (#021)", () => {
    const schema = buildFaqSchema([
      faq("1", "Cài thế nào?", "<p>Bước 1: quét mã.</p><p>Bước 2: bật dữ liệu.</p>"),
    ])!;
    const text = (schema.mainEntity as Record<string, any>[])[0].acceptedAnswer
      .text as string;

    expect(text).not.toMatch(/<\/?p[\s>]/i);
    // Paragraphs stay apart as lines rather than running together.
    expect(text).toBe("Bước 1: quét mã.\nBước 2: bật dữ liệu.");
    // Other formatting Google accepts is kept.
    expect(stripParagraphTags('<p>Xem <a href="/x">đây</a></p>')).toBe(
      'Xem <a href="/x">đây</a>',
    );
  });

  test("caps how many questions it marks up", () => {
    const many = Array.from({ length: MAX_SCHEMA_FAQS + 5 }, (_, i) =>
      faq(String(i), `Câu hỏi ${i}?`, `Trả lời ${i}`),
    );

    expect(buildFaqSchema(many)!.mainEntity).toHaveLength(MAX_SCHEMA_FAQS);
  });
});

test.describe("FAQ context URLs", () => {
  test("asks for the page's own FAQs before any shared ones", () => {
    const urls = faqCandidateUrls({
      pathname: "/esim-nhat-ban",
      locale: "vi",
      entityType: "destination",
    });

    expect(urls[0]).toBe("/esim-nhat-ban");
    // The blanket record comes last, so it only wins when the page has nothing.
    expect(urls[urls.length - 1]).toBe("/destination");
    expect(urls).toContain("/destination");
  });

  test("maps the homepage to the record the CMS actually stores", () => {
    expect(faqCandidateUrls({ pathname: "/", locale: "vi" })).toContain("/home");
    expect(faqCandidateUrls({ pathname: "/en", locale: "en" })).toContain(
      "/en/home",
    );
  });

  test("also tries the English route key some records use", () => {
    // The supported-devices page stores its FAQs under `/vi/esim-supported-devices`
    // even in Vietnamese, so that spelling has to be among the candidates.
    const urls = faqCandidateUrls({
      pathname: "/thiet-bi-ho-tro-esim",
      locale: "vi",
    });

    expect(urls[0]).toBe("/thiet-bi-ho-tro-esim");
    expect(urls).toContain("/vi/esim-supported-devices");
  });

  test("prefixes the blanket record for a non-default locale", () => {
    const urls = faqCandidateUrls({
      pathname: "/en/esim-japan",
      locale: "en",
      entityType: "region",
    });

    expect(urls[0]).toBe("/en/esim-japan");
    expect(urls).toContain("/en/region");
    expect(urls).toContain("/region");
  });

  test("finds an English page's own FAQs under its Vietnamese slug (#019)", () => {
    // The CMS keys FAQs by the Vietnamese path; `language` selects English.
    const urls = faqCandidateUrls({
      pathname: "/en/esim-china",
      locale: "en",
      entityType: "destination",
      entitySlugs: ["esim-trung-quoc", "esim-china"],
    });

    expect(urls[0]).toBe("/en/esim-china");
    const own = urls.indexOf("/esim-trung-quoc");
    expect(own).toBeGreaterThan(-1);
    // Own FAQs are asked for before either blanket record.
    expect(own).toBeLessThan(urls.indexOf("/en/destination"));
    expect(own).toBeLessThan(urls.indexOf("/destination"));
    expect(urls[urls.length - 1]).toBe("/destination");
  });

  test("adds nothing new for a Vietnamese page already asked by its own slug", () => {
    const urls = faqCandidateUrls({
      pathname: "/esim-nhat-ban",
      locale: "vi",
      entityType: "destination",
      entitySlugs: [null, "esim-nhat-ban"],
    });

    expect(urls).toEqual(["/esim-nhat-ban", "/destination"]);
  });

  test("never repeats a candidate", () => {
    const urls = faqCandidateUrls({ pathname: "/ma-giam-gia", locale: "vi" });

    expect(new Set(urls).size).toBe(urls.length);
  });
});

test.describe("Placement", () => {
  test("publishes no FAQPage when the API has nothing to give", async ({
    request,
  }) => {
    // No backend in this suite: the graceful path must be an absent block, not an
    // empty or half-built one.
    const res = await request.get("/ma-giam-gia");
    const head = (await res.text()).split("</head>")[0];

    expect(head).not.toContain("FAQPage");
  });
});
