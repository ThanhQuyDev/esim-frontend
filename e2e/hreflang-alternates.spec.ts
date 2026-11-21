import { test, expect } from "@playwright/test";
import { buildLanguageAlternates, canonicalOnly, SITE_BASE_URL as S } from "../lib/hreflang";

/** vande-2011 #045 — the hreflang fixes listed in hreflang-html-fix.csv (Drive row 52). */
test.describe("hreflang alternates", () => {
  test("home: /en without a trailing slash, also as the English canonical", () => {
    const vi = buildLanguageAlternates("/");
    const en = buildLanguageAlternates("/en");
    expect(vi.languages).toEqual({ vi: S, en: `${S}/en`, "x-default": S });
    expect(en.canonical).toBe(`${S}/en`);
  });

  test("legal pages pair /phap-ly/<vi> with /en/legal/<en>, from either side", () => {
    const want = {
      vi: `${S}/phap-ly/chinh-sach-hoan-tien`,
      en: `${S}/en/legal/refund-policy`,
      "x-default": `${S}/phap-ly/chinh-sach-hoan-tien`,
    };
    expect(buildLanguageAlternates("/phap-ly/chinh-sach-hoan-tien").languages).toEqual(want);
    const en = buildLanguageAlternates("/en/legal/refund-policy");
    expect(en.languages).toEqual(want);
    expect(en.canonical).toBe(`${S}/en/legal/refund-policy`);
  });

  test("a help article's English address is /en/help-center/<slug>, not /en/ho-tro", () => {
    expect(buildLanguageAlternates("/ho-tro/khai-niem-ve-esim").languages).toEqual({
      vi: `${S}/ho-tro/khai-niem-ve-esim`,
      en: `${S}/en/help-center/khai-niem-ve-esim`,
      "x-default": `${S}/ho-tro/khai-niem-ve-esim`,
    });
    expect(buildLanguageAlternates("/en/help-center/khai-niem-ve-esim").languages.vi).toBe(
      `${S}/ho-tro/khai-niem-ve-esim`
    );
  });

  test("static pages keep their own words per language", () => {
    expect(buildLanguageAlternates("/gioi-thieu").languages.en).toBe(`${S}/en/about-us`);
    expect(buildLanguageAlternates("/phap-ly").languages.en).toBe(`${S}/en/legal`);
  });

  test("a Vietnamese-only page names no translation", () => {
    expect(canonicalOnly("/blog/author/duc-tho")).toEqual({
      canonical: `${S}/blog/author/duc-tho`,
      languages: {},
    });
  });
});
