import { test, expect } from "@playwright/test";
import { formatExu } from "../lib/hooks";
import viMessages from "../messages/vi.json";
import enMessages from "../messages/en.json";
import { walletTranslations } from "../components/layout/sections/wallet/translations";
import { termsConditions } from "../components/layout/sections/legal/content/terms-conditions";

/**
 * #052 — eXU must read as reward points, never as money in an e-wallet, and
 * the Terms must say what eXU is not.
 */

function flatten(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (value && typeof value === "object") return Object.values(value).flatMap(flatten);
  return [];
}

test.describe("eXU shown as points", () => {
  test("formats a balance as points in each language", () => {
    expect(formatExu(10_000)).toBe("10.000 điểm eXU");
    expect(formatExu(10_000, "vi")).toBe("10.000 điểm eXU");
    expect(formatExu(10_000, "en")).toBe("10,000 eXU points");
    expect(formatExu(12_345.6, "vi")).toBe("12.346 điểm eXU");
  });

  test("no customer copy calls eXU money in a wallet", () => {
    const moneyWording = [/đ eXU/, /vào ví eXU/i, /ví eXU/i, /VND in (your )?eXU/i, /eXU wallet/i, /hoàn tiền vào/i];
    const copy = [
      ...flatten(viMessages),
      ...flatten(enMessages),
      ...flatten(walletTranslations),
    ];

    for (const pattern of moneyWording) {
      const offending = copy.filter((text) => pattern.test(text));
      expect(offending, `copy matching ${pattern}`).toEqual([]);
    }
  });
});

test.describe("eXU in the Terms & Conditions", () => {
  const read = (lang: "vi" | "en") =>
    termsConditions.content[lang].blocks
      .flatMap((block) => [block.heading ?? "", ...flatten(block.lines)])
      .join(" ");

  test("states what eXU is not, in Vietnamese", () => {
    const vi = read("vi");
    for (const clause of [
      "eXU không phải là tiền",
      "không rút được ra tiền mặt",
      "không chuyển nhượng",
      "không thể nạp eXU bằng tiền mặt",
      "chỉ được sử dụng nội bộ trên esim.vn",
      "có thời hạn sử dụng 365 ngày",
    ]) {
      expect(vi).toContain(clause);
    }
  });

  test("states the same in English", () => {
    const en = read("en");
    for (const clause of [
      "eXU are not money",
      "cannot be withdrawn as cash",
      "cannot be transferred",
      "cannot top up eXU with cash",
      "can only be used internally on esim.vn",
      "expire 365 days",
    ]) {
      expect(en).toContain(clause);
    }
  });
});
