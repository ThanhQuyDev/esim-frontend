"use client";

import type { ReactNode } from "react";
import { Clock, Infinity, MessageSquare, Phone } from "lucide-react";
import { clockDate } from "@/lib/clock-date";
import { dayRuleText, hasDailyAllowance, type DayCycle } from "@/lib/plan-daily-reset";

/**
 * Data / time bar shared by the signed-in profile card and the public lookup
 * page (#003). It used to live inside `esim-card-list.tsx`; the public page must
 * read identically without pulling that file's QR and topup machinery into its
 * bundle.
 */
export function DataUsageBar({ label, used, total, unit, isUnlimited, lang, integer = false }: {
  label: string;
  used: number;
  total: number;
  unit: string;
  isUnlimited: boolean;
  lang: string;
  /** Whole units only — days are counted, never "20.0 ngày" (#027). */
  integer?: boolean;
}) {
  const vi = lang === "vi";
  const format = (value: number) =>
    integer ? String(Math.round(value)) : value.toFixed(value < 100 ? 1 : 0);
  if (isUnlimited) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">{label}</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
            <Infinity className="w-3.5 h-3.5" />
            {vi ? "Không giới hạn" : "Unlimited"}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-indigo-100">
          <div className="h-full rounded-full bg-indigo-400 w-full" />
        </div>
      </div>
    );
  }

  const remaining = Math.max(0, total - used);
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const barColor = pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-emerald-500";
  const barBg = pct > 80 ? "bg-red-100" : pct > 50 ? "bg-amber-100" : "bg-emerald-100";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {format(remaining)} {unit} {vi ? "còn lại" : "left"}
        </span>
      </div>
      <div className={`w-full h-2 rounded-full ${barBg}`}>
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-400">
        <span>{vi ? "Đã dùng" : "Used"} {format(used)} {unit}</span>
        <span>{vi ? "Tổng" : "Total"} {format(total)} {unit}</span>
      </div>
    </div>
  );
}

/** Provider status codes are English enum values; customers read Vietnamese. */
export function statusLabel(status: string | undefined, lang: string): string {
  const key = (status ?? "").toUpperCase();
  const labels: Record<string, { vi: string; en: string }> = {
    ACTIVE: { vi: "Đang dùng", en: "Active" },
    NOT_ACTIVE: { vi: "Chưa kích hoạt", en: "Not activated" },
    INACTIVE: { vi: "Chưa kích hoạt", en: "Not activated" },
    EXPIRED: { vi: "Hết hạn", en: "Expired" },
    USED_UP: { vi: "Hết dung lượng", en: "Used up" },
    FINISHED: { vi: "Đã kết thúc", en: "Finished" },
    CANCELLED: { vi: "Đã huỷ", en: "Cancelled" },
    REFUNDED: { vi: "Đã hoàn tiền", en: "Refunded" },
  };
  const known = labels[key];
  if (known) return lang === "vi" ? known.vi : known.en;
  return status || (lang === "vi" ? "Không rõ" : "Unknown");
}

/**
 * The status to show beside the usage figures. A supplier may go on reporting
 * ACTIVE after the plan has ended, so an eSIM whose end has passed reads as
 * expired, as its own card says (vande-0411 #081).
 */
export function shownUsageStatus(
  status: string | undefined,
  expiredAt: string | null | undefined,
  now: number = Date.now(),
): string | undefined {
  if ((status ?? "").toUpperCase() !== "ACTIVE" || !expiredAt) return status;
  const end = new Date(expiredAt).getTime();
  return !Number.isNaN(end) && end <= now ? "EXPIRED" : status;
}

/** Badge colour per status, shared so both pages label states the same way. */
export const USAGE_STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  EXPIRED: "bg-red-100 text-red-700",
  NOT_ACTIVE: "bg-gray-100 text-gray-500",
  REFUNDED: "bg-red-100 text-red-700",
};

/** "5 giờ 12 phút", "12 phút". */
function spanText(ms: number, vi: boolean): string {
  const minutes = Math.max(1, Math.round(ms / 60_000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (vi) return hours > 0 ? `${hours} giờ${rest ? ` ${rest} phút` : ""}` : `${rest} phút`;
  return hours > 0 ? `${hours} h${rest ? ` ${rest} min` : ""}` : `${rest} min`;
}

/**
 * Which day the eSIM is on and when it ends (vande #075), in the customer's
 * own clock — the reset of a daily allowance is what they keep asking about,
 * and "used 1 of 7 days" an hour after connecting read like a day was lost.
 */
export function CurrentDayNote({
  cycle,
  policy,
  utcOffset,
  planType,
  lang,
}: {
  cycle: DayCycle | null;
  policy: string | null | undefined;
  utcOffset: number | null | undefined;
  planType: string | null | undefined;
  lang: string;
}) {
  if (!cycle || cycle.finished || !cycle.ruleKnown || !cycle.dayEndsAt) return null;
  const vi = lang !== "en";
  const daily = hasDailyAllowance(planType ? { type: planType } : null);
  const end = cycle.dayEndsAt;
  const at = clockDate(end);
  const left = spanText(end.getTime() - Date.now(), vi);
  // The way this eSIM's days really run, which the sentence above follows.
  const rule = dayRuleText(cycle.policy ?? policy, utcOffset, lang);
  const lastDay = cycle.dayIndex >= cycle.totalDays;
  return (
    <div
      // Squared off: it runs to several lines, and rounded-lg is 40px on this site.
      className="rounded-[10px] border border-sky-100 bg-sky-50 px-3 py-2.5 text-sm text-sky-900 space-y-1"
      data-testid="current-day"
    >
      <p className="flex items-start gap-1.5 font-medium">
        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          {vi
            ? `Đang dùng ngày thứ ${cycle.dayIndex}/${cycle.totalDays}.`
            : `On day ${cycle.dayIndex} of ${cycle.totalDays}.`}{" "}
          {lastDay
            ? vi
              ? `Gói hết hạn lúc ${at} (giờ trên máy bạn) — còn ${left}.`
              : `The plan ends at ${at} (your device time) — ${left} left.`
            : daily
              ? vi
                ? `Data trong ngày được làm mới lúc ${at} (giờ trên máy bạn) — còn ${left}.`
                : `Today's data resets at ${at} (your device time) — in ${left}.`
              : vi
                ? `Ngày này kết thúc lúc ${at} (giờ trên máy bạn) — còn ${left}.`
                : `This day ends at ${at} (your device time) — in ${left}.`}
        </span>
      </p>
      {rule && <p className="text-xs text-sky-800/80">{rule}</p>}
    </div>
  );
}

/** GB or days left: the icon on the value's line, squared off (vande-0411 #076). */
export function RemainingTile({
  icon,
  value,
  label,
  tone,
  labelTestId,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
  tone: "blue" | "emerald";
  labelTestId?: string;
}) {
  const colors =
    tone === "blue"
      ? { box: "bg-blue-50", value: "text-blue-700", label: "text-blue-500" }
      : { box: "bg-emerald-50", value: "text-emerald-700", label: "text-emerald-500" };
  return (
    <div className={`rounded-[10px] p-3 text-center ${colors.box}`}>
      <p className={`flex items-center justify-center gap-1.5 text-lg font-medium ${colors.value}`}>
        {icon}
        {value}
      </p>
      <p className={`text-sm ${colors.label}`} data-testid={labelTestId}>
        {label}
      </p>
    </div>
  );
}

/** Minutes and SMS as on the order-success page (vande-0411 #076). */
export function VoiceSmsChips({
  calls,
  sms,
  lang,
  testId,
}: {
  calls?: number | null;
  sms?: number | null;
  lang: string;
  testId?: string;
}) {
  if (!calls && !sms) return null;
  return (
    <div className="flex flex-wrap gap-2" data-testid={testId}>
      {!!calls && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700">
          <Phone className="h-3.5 w-3.5" />
          {lang === "vi" ? `${calls} phút gọi` : `${calls} min calls`}
        </span>
      )}
      {!!sms && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
          <MessageSquare className="h-3.5 w-3.5" />
          {sms} SMS
        </span>
      )}
    </div>
  );
}
