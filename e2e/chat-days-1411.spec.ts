import { test, expect } from "@playwright/test";
import { chatDayLabel, chatTime, startsNewDay } from "../lib/chat-days";

/**
 * vande-1411 #036 — chat dates as Zalo shows them: a header per day ("Hôm nay",
 * "Hôm qua", or the time and date of an older day's first message) and the
 * time alone on each message.
 */
const NOW = new Date(2026, 10, 14, 15, 0);

test("should head today, yesterday and older days", () => {
  expect(chatDayLabel(new Date(2026, 10, 14, 9, 5).toISOString(), NOW)).toBe("Hôm nay");
  expect(chatDayLabel(new Date(2026, 10, 13, 22, 40).toISOString(), NOW)).toBe("Hôm qua");
  expect(chatDayLabel(new Date(2026, 10, 2, 8, 7).toISOString(), NOW)).toBe("08:07 02/11/2026");
});

test("should start a header only when the day changes", () => {
  const a = new Date(2026, 10, 13, 23, 59).toISOString();
  const b = new Date(2026, 10, 14, 0, 1).toISOString();
  const c = new Date(2026, 10, 14, 9, 0).toISOString();
  expect(startsNewDay(a, null)).toBe(true);
  expect(startsNewDay(b, a)).toBe(true);
  expect(startsNewDay(c, b)).toBe(false);
});

test("should show the time alone on a message", () => {
  expect(chatTime(new Date(2026, 10, 14, 7, 3).toISOString())).toBe("07:03");
});
