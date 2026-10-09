import { test, expect } from "@playwright/test";
import { readdirSync } from "node:fs";
import path from "node:path";
import {
  STATIC_TOP_LEVEL_ROUTES,
  MOBILE_VARIANT_SEGMENT,
  isDirectVariantRequest,
  isMobileUserAgent,
  mobileVariantPath,
} from "../i18n/device-variant";

/**
 * One product-page layout per device (#001, test round 4): phones are served
 * the mobile-only render, everyone else the desktop-only render, so the HTML
 * never holds two <h1> tags. Pure routing rules — no backend needed.
 */

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const ANDROID_PHONE =
  "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36";
const GOOGLEBOT_SMARTPHONE =
  "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const ANDROID_TABLET =
  "Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const DESKTOP =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

test.describe("Product page device variant", () => {
  test("phones (and Google's smartphone crawler) get the mobile render", () => {
    expect(isMobileUserAgent(IPHONE)).toBe(true);
    expect(isMobileUserAgent(ANDROID_PHONE)).toBe(true);
    expect(isMobileUserAgent(GOOGLEBOT_SMARTPHONE)).toBe(true);
  });

  test("desktops, tablets and unknown clients get the desktop render", () => {
    expect(isMobileUserAgent(DESKTOP)).toBe(false);
    expect(isMobileUserAgent(ANDROID_TABLET)).toBe(false);
    expect(isMobileUserAgent(null)).toBe(false);
  });

  test("only product slugs are rewritten", () => {
    expect(mobileVariantPath("/vi/esim-dai-loan")).toBe(`/vi/esim-dai-loan/${MOBILE_VARIANT_SEGMENT}`);
    expect(mobileVariantPath("/en/esim-taiwan/")).toBe(`/en/esim-taiwan/${MOBILE_VARIANT_SEGMENT}`);
    expect(mobileVariantPath("/vi/cart")).toBeNull();
    expect(mobileVariantPath("/vi/blog/abc")).toBeNull();
    expect(mobileVariantPath("/vi")).toBeNull();
  });

  test("the variant route is never a public URL", () => {
    expect(isDirectVariantRequest(`/esim-dai-loan/${MOBILE_VARIANT_SEGMENT}`)).toBe(true);
    expect(isDirectVariantRequest(`/en/esim-taiwan/${MOBILE_VARIANT_SEGMENT}/`)).toBe(true);
    expect(isDirectVariantRequest("/esim-dai-loan")).toBe(false);
  });

  test("the static-route list matches the app/[locale] folders", () => {
    const dir = path.join(__dirname, "..", "app", "[locale]");
    const folders = readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("[") && !d.name.startsWith("("))
      .map((d) => d.name)
      .sort();
    expect(Array.from(STATIC_TOP_LEVEL_ROUTES).sort()).toEqual(folders);
  });

});
