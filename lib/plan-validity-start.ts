/**
 * "Thời điểm bắt đầu tính gói" (vande-0411 #026): when a plan's days start
 * counting, worked out per supplier by the API. Nothing is shown when the
 * supplier has not said yet.
 */
export type PlanValidityStart = "first_connection" | "installation" | "purchase" | "pre_arrival";

const VALUES: Record<"vi" | "en", Record<PlanValidityStart, string>> = {
  vi: {
    first_connection: "Khi đến nơi và kết nối mạng lần đầu",
    installation: "Khi cài đặt eSIM",
    purchase: "Ngay khi mua hàng",
    pre_arrival: "Bắt buộc cài đặt eSIM trước khi đến nơi",
  },
  en: {
    first_connection: "On arrival, at the first network connection",
    installation: "When the eSIM is installed",
    purchase: "Right after purchase",
    pre_arrival: "The eSIM must be installed before you arrive",
  },
};

const TITLE = { vi: "Thời điểm bắt đầu tính gói", en: "Plan validity starts" };
const NOTE = {
  vi: "Vui lòng cài đặt eSIM vào thiết bị trước khi lên máy bay 2 - 3h.",
  en: "Please install the eSIM on your device 2-3 hours before your flight.",
};

export function validityStartText(
  plan: { validityStart?: PlanValidityStart | null } | null | undefined,
  lang: string,
): { title: string; value: string; note: string } | null {
  const key = lang === "vi" ? "vi" : "en";
  if (!plan?.validityStart) return null;
  const value = VALUES[key][plan.validityStart];
  return value ? { title: TITLE[key], value, note: NOTE[key] } : null;
}
