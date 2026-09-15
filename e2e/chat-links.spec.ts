import { test, expect } from "@playwright/test";
import { splitChatLinks } from "../lib/chat-links";

/**
 * #050 — support staff send a destination link into the chat; the customer
 * must be able to tap it.
 */
test.describe("chat message links", () => {
  test("turns the destination link staff send into a link", () => {
    expect(splitChatLinks("eSIM Nhật Bản: https://esim.vn/esim-nhat-ban")).toEqual([
      { type: "text", value: "eSIM Nhật Bản: " },
      { type: "link", value: "https://esim.vn/esim-nhat-ban" },
    ]);
  });

  test("keeps sentence punctuation out of the link", () => {
    expect(splitChatLinks("Xem ở https://esim.vn/en/esim-han-quoc. Cảm ơn!")).toEqual([
      { type: "text", value: "Xem ở " },
      { type: "link", value: "https://esim.vn/en/esim-han-quoc" },
      { type: "text", value: ". Cảm ơn!" },
    ]);
  });

  test("handles several links and plain text", () => {
    const parts = splitChatLinks("A https://a.vn/x và http://b.vn/y");
    expect(parts.filter((p) => p.type === "link").map((p) => p.value)).toEqual([
      "https://a.vn/x",
      "http://b.vn/y",
    ]);
    expect(splitChatLinks("Chào bạn")).toEqual([{ type: "text", value: "Chào bạn" }]);
  });

  test("does not link a bare scheme or javascript: text", () => {
    expect(splitChatLinks("https://").every((p) => p.type === "text")).toBe(true);
    expect(splitChatLinks("javascript:alert(1)").every((p) => p.type === "text")).toBe(true);
  });
});
