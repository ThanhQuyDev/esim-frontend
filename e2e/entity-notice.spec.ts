import { test, expect } from "@playwright/test";
import { entityNoticeHtml, firstEntityNoticeHtml, sanitizeNoticeHtml } from "../lib/entity-notice";

/** doitac-1410 #078 — the admin's note at the top of a destination / region page. */
test.describe("entity notice", () => {
  const rich =
    '<p><strong>B</strong> <em>I</em> <u>U</u> <a href="https://esim.vn/huong-dan">link</a></p>';

  test("keeps bold, italic, underline and links", () => {
    expect(entityNoticeHtml({ noticeVi: rich }, "vi")).toBe(rich);
  });

  test("takes out what can run", () => {
    expect(
      sanitizeNoticeHtml('<p onclick="x()">Hi<script>alert(1)</script><a href="javascript:alert(1)">x</a></p>'),
    ).toBe("<p>Hi<a>x</a></p>");
  });

  test("picks the page's language, English falling back to Vietnamese", () => {
    const both = { notice: "<p>EN</p>", noticeVi: "<p>VI</p>" };
    expect(entityNoticeHtml(both, "vi")).toBe("<p>VI</p>");
    expect(entityNoticeHtml(both, "en")).toBe("<p>EN</p>");
    expect(entityNoticeHtml({ noticeVi: "<p>VI</p>" }, "en")).toBe("<p>VI</p>");
    // Vietnamese pages never show the English note.
    expect(entityNoticeHtml({ notice: "<p>EN</p>" }, "vi")).toBeNull();
  });

  test("shows nothing for an empty editor or no note", () => {
    expect(entityNoticeHtml({ noticeVi: "<p></p>" }, "vi")).toBeNull();
    expect(entityNoticeHtml({ noticeVi: "<p>&nbsp;</p>" }, "vi")).toBeNull();
    expect(entityNoticeHtml({}, "vi")).toBeNull();
    expect(entityNoticeHtml(null, "vi")).toBeNull();
  });

  test("a page of several regions shows the first note", () => {
    expect(firstEntityNoticeHtml([{}, { noticeVi: "<p>A</p>" }, { noticeVi: "<p>B</p>" }], "vi")).toBe("<p>A</p>");
    expect(firstEntityNoticeHtml([{}, null], "vi")).toBeNull();
  });
});
