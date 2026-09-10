import type { Plan } from "./api";

/**
 * Calls / SMS allowances on a plan (#045).
 *
 * `plan.call` is call MINUTES and `plan.sms` is a COUNT of messages (that is how
 * the backend documents both columns, and how the Airalo sync fills them from
 * `voice` / `text`). The feature panel used to collapse both into one Yes/No
 * row, which threw the numbers away — a buyer comparing two voice plans could
 * not tell 50 minutes from 500.
 */

export interface PlanVoiceInfo {
  callMinutes: number;
  smsCount: number;
  /**
   * True when the plan includes calls or SMS. Such a plan necessarily has a
   * phone number — you cannot be called or texted without one — so this also
   * answers the "local phone number" row, which was hardcoded to "no".
   */
  hasVoice: boolean;
}

export interface PlanVoiceDict {
  /** Unit for call minutes, e.g. "phút gọi" / "call minutes". */
  minutesUnit: string;
  /** Unit for the SMS count, e.g. "tin nhắn SMS" / "SMS". */
  smsUnit: string;
}

export function planVoiceInfo(
  plan: Pick<Plan, "call" | "sms"> | null | undefined
): PlanVoiceInfo {
  const callMinutes = Math.max(0, Number(plan?.call ?? 0) || 0);
  const smsCount = Math.max(0, Number(plan?.sms ?? 0) || 0);
  return {
    callMinutes,
    smsCount,
    hasVoice: callMinutes > 0 || smsCount > 0,
  };
}

/**
 * "50 phút gọi · 100 tin nhắn SMS", or just the half the plan actually has.
 *
 * Null when there is no number worth printing — either the plan has no calls or
 * SMS at all, or the only value is a bare `1`. A `1` is not a real allowance: the
 * domestic-eSIM Excel import stores yes/no as `1`/`null`
 * (`esims-import.service.ts`), so "1 phút gọi" would be an invented number.
 * Callers fall back to a plain yes in that case — see `PlanVoiceInfo.hasVoice`.
 */
export function planVoiceLabel(
  info: PlanVoiceInfo,
  dict: PlanVoiceDict
): string | null {
  const parts: string[] = [];
  if (info.callMinutes > 1) {
    parts.push(`${info.callMinutes.toLocaleString("vi-VN")} ${dict.minutesUnit}`);
  }
  if (info.smsCount > 1) {
    parts.push(`${info.smsCount.toLocaleString("vi-VN")} ${dict.smsUnit}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}
