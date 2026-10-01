import type { Plan, PlansByDestinationResponse } from "./api";

/**
 * "nonhkip" plans — eSIM Access ships two variants of many packages: the
 * ordinary one routes traffic out through Hong Kong, the other exits on a local
 * IP and is marked "(nonhkip)" in the provider's package name. Apps that
 * geo-block Hong Kong routing (TikTok, ChatGPT, some banking apps) only work on
 * the local-IP variant, which usually costs more.
 *
 * The flag is captured at sync time (`plan.isNonHkIp`) because our plan name and
 * slug are rebuilt from location + data + duration, which drops the provider's
 * "(nonhkip)" marker. See #041.
 */

/**
 * NOTE (#068): the filtering that used to live here has moved to
 * `lib/plan-tiktok.ts`, which decides support from the uploaded APN table instead
 * of the esimaccess-only `isNonHkIp` flag. Only the toggle's copy is still read
 * from this file.
 */

/**
 * Hard-coded copy, per Thọ's note on #041 ("fix cứng thông tin"). The app names
 * are the reason customers ask for this, so they are spelled out rather than
 * hidden behind a technical label like "non-HK IP".
 */
export function nonHkIpCopy(lang: string) {
  if (lang === "en") {
    return {
      toggle: "Works with TikTok, ChatGPT",
      hint: "Only plans with a local exit IP (no Hong Kong routing). Apps like TikTok and ChatGPT work normally on these. They cost a little more.",
      activeHint:
        "Showing only plans with a local exit IP. Turn this off to see every plan.",
      empty: "No local-IP plan for this destination yet.",
    };
  }
  return {
    toggle: "Dùng được TikTok, ChatGPT",
    hint: "Chỉ hiện các gói có IP nội địa (không đi qua Hong Kong). Các app như TikTok, ChatGPT dùng bình thường. Giá cao hơn một chút.",
    activeHint:
      "Đang chỉ hiện gói có IP nội địa. Tắt để xem lại tất cả các gói.",
    empty: "Điểm đến này chưa có gói IP nội địa.",
  };
}
