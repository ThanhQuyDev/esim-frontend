import type { Destination, Plan, PlansByDestinationResponse, Region } from "./api";

/**
 * Showing which eSIMs really work with TikTok and ChatGPT (#068).
 *
 * China blocks both, so for a China trip this is the question that decides the
 * purchase. The verdict per plan is decided by the API from the uploaded APN table
 * (#065, #067) — nothing here guesses at it.
 *
 * Confirmed 1/10/2026: the filter shows only plans that work on BOTH iPhone and
 * Android. TikTok differs by platform (APN `cmhk` works on iPhone, not on Android)
 * and the page does not know what the visitor is holding, so "works on one of
 * them" is not something it can put behind a checkbox.
 */

/** Mainland China. Hong Kong and Macao do not block these apps. */
const CHINA_COUNTRY_CODE = "CN";

/** Every plan list on a destination / region page, in render order. */
const PLAN_GROUPS = [
  "localEsim",
  "dataPlans",
  "fastUnlimited",
  "slowUnlimited",
  "dailyUnlimited",
  "smsCallEsim",
] as const;

/**
 * Whether this product page is one where the filter means anything: mainland
 * China, or a region pack that covers it.
 *
 * Gated rather than shown everywhere because outside China nothing is blocked —
 * a "works with TikTok" checkbox on the Japan page would suggest a problem that
 * does not exist there.
 */
export function isChinaProductPage(input: {
  destination?: Pick<Destination, "countryCode"> | null;
  region?: Pick<Region, "destinations"> | null;
}): boolean {
  const isChina = (code?: string | null) =>
    code?.trim().toUpperCase() === CHINA_COUNTRY_CODE;

  if (isChina(input.destination?.countryCode)) return true;

  return (input.region?.destinations ?? []).some((d) => isChina(d.countryCode));
}

/** A plan the page can promise works with both apps. */
export function worksWithTiktokAndChatGpt(plan: Pick<Plan, "appSupport">): boolean {
  const support = plan.appSupport;
  return support?.tiktokAllDevices === true && support.chatGpt === true;
}

/** Whether there is anything for the filter to show. */
export function hasTiktokPlans(plans: PlansByDestinationResponse): boolean {
  if ((plans.tiktokHiddenByPrice ?? []).some(worksWithTiktokAndChatGpt)) {
    return true;
  }
  return PLAN_GROUPS.some((group) =>
    (plans[group] ?? []).some(worksWithTiktokAndChatGpt),
  );
}

/**
 * Keep only the plans that work with both apps — and add back the ones the price
 * de-duplication had removed.
 *
 * That last part is the point of the ticket's capitalised note: a TikTok-capable
 * plan is usually the dearer of two identical configurations, so `markCheapestPlans`
 * dropped it and the storefront never saw it. The API now returns those separately
 * (#067) and they belong in the fixed-data group, which is the one they were
 * removed from.
 */
export function filterTiktokPlans(
  plans: PlansByDestinationResponse,
): PlansByDestinationResponse {
  const filtered = { ...plans };

  for (const group of PLAN_GROUPS) {
    const list = plans[group];
    if (list) filtered[group] = list.filter(worksWithTiktokAndChatGpt);
  }

  const recovered = (plans.tiktokHiddenByPrice ?? []).filter(
    worksWithTiktokAndChatGpt,
  );

  if (recovered.length) {
    const seen = new Set(filtered.dataPlans.map((p) => p.id));
    filtered.dataPlans = [
      ...filtered.dataPlans,
      ...recovered.filter((p) => !seen.has(p.id)),
    ].sort((a, b) => Number(a.vndPrice ?? 0) - Number(b.vndPrice ?? 0));
  }

  return filtered;
}

/**
 * The apps line in the green box — the second line, which used to claim
 * "Hỗ trợ truy cập TikTok, Chat GPT, Zalo, Facebook, YouTube…" for every plan in
 * the catalogue, China included (#068).
 *
 * Returns null when the APN table has nothing to say about this plan, and the
 * caller then keeps the existing wording. That is deliberate: the table describes
 * getting around China's blocking, so a Japan plan is simply absent from it — and
 * reading that absence as "TikTok does not work" would be false, because in Japan
 * it does.
 */
export function appsLine(
  plan: Pick<Plan, "appSupport"> | null | undefined,
  lang: string,
): string | null {
  const support = plan?.appSupport;
  if (!support?.known) return null;

  const en = lang === "en";
  const others = en ? "ChatGPT, Gemini, Claude…" : "ChatGPT, Gemini, Claude…";

  if (support.tiktokAllDevices) {
    return en
      ? `Works with TikTok, ${others}`
      : `Hỗ trợ sử dụng Tiktok, ${others}`;
  }

  if (support.chatGpt) {
    return en
      ? `Works with ${others} TikTok does not work.`
      : `Hỗ trợ sử dụng ${others} Không dùng được Tiktok.`;
  }

  return en
    ? "TikTok and ChatGPT do not work on this plan."
    : "Không dùng được Tiktok và ChatGPT.";
}
