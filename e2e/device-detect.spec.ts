import { test, expect } from "@playwright/test";
import { eidValid, norm, verdictFor, type DeviceInfo } from "../components/layout/sections/supported-devices/design/device-detect";

/** vande-2011 #031 — the device check on the supported-devices page (spec 8, 9, 11). */

const list = ["Google Pixel 9", "Google Pixel 8 Pro", "Samsung Galaxy S24 Ultra", "Apple iPhone 16"];
const info = (over: Partial<DeviceInfo>): DeviceInfo => ({ type: "phone", name: "", model: "", os: "", osVersion: "", ...over });

test("a computer is asked to scan with the phone", () => {
  expect(verdictFor(info({ type: "desktop", os: "Windows" }), list, "Điện thoại Android").state).toBe("pc");
});

test("an iPhone is named 'iPhone' only, never a guessed model", () => {
  expect(verdictFor(info({ name: "iPhone", os: "iOS", osVersion: "18" }), list, "x")).toEqual({ state: "ok", name: "iPhone" });
  expect(verdictFor(info({ name: "iPhone", os: "iOS", osVersion: "16" }), list, "x").state).toBe("unk");
});

test("an Android model found on the list is supported, a hardware code is unsure", () => {
  const pixel = verdictFor(info({ os: "Android", osVersion: "15", model: "Pixel 9" }), list, "Điện thoại Android");
  expect(pixel.state).toBe("ok");
  expect(pixel.name).toBe("Google Pixel 9 · Android 15");
  const code = verdictFor(info({ os: "Android", osVersion: "16", model: "SM-S928B" }), list, "Điện thoại Android");
  expect(code).toEqual({ state: "unk", name: "Điện thoại Android · Android 16", model: "SM-S928B" });
  expect(verdictFor(info({ os: "Android" }), list, "Điện thoại Android")).toEqual({ state: "unk", name: "Điện thoại Android" });
});

test("search text ignores marks and case", () => {
  expect(norm("  Điện  THOẠI ")).toBe("dien thoai");
});

test("EID: 32 digits, mod 97 = 1 (GSMA)", () => {
  expect(eidValid("89049032000001000000013208484836")).toBe(true);
  expect(eidValid("89049032000001000000013208484837")).toBe(false);
  expect(eidValid("8904903200000100000001320848485")).toBe(false);
});
