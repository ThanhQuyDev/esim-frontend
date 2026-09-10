"use client";

import { Check, Coins, Gift, Lock } from "lucide-react";
import { formatVnd, useMembershipTiers } from "@/lib/hooks";
import type { MembershipTier } from "@/lib/hooks";

interface TierLadderProps {
  /** The tier the customer is on right now (may be an admin override). */
  currentTier: MembershipTier;
  lifetimeSpendVnd: number;
  lang: "en" | "vi";
}

const TIER_LABELS: Record<MembershipTier, { vi: string; en: string }> = {
  traveler: { vi: "Du khách", en: "Traveler" },
  silver: { vi: "Du khách bạc", en: "Silver" },
  gold: { vi: "Du khách vàng", en: "Gold" },
  platinum: { vi: "Du khách bạch kim", en: "Platinum" },
};

const TIER_ACCENTS: Record<MembershipTier, string> = {
  traveler: "from-sky-500 to-blue-600",
  silver: "from-slate-400 to-slate-600",
  gold: "from-amber-400 to-amber-600",
  platinum: "from-violet-500 to-purple-700",
};

/**
 * The whole membership ladder: every level, which ones are reached, and what
 * each one gives (#061).
 *
 * The card above this one already says where the customer is now; this shows the
 * levels they have NOT reached yet, which is the part that makes the next tier
 * worth chasing.
 */
export function TierLadder({
  currentTier,
  lifetimeSpendVnd,
  lang,
}: TierLadderProps) {
  const { data: tiers } = useMembershipTiers();
  const vi = lang === "vi";

  if (!tiers?.length) return null;

  const spend = Math.max(0, lifetimeSpendVnd);
  const currentIndex = tiers.findIndex((rung) => rung.tier === currentTier);
  const top = tiers[tiers.length - 1];
  // The track fills against the top rung, so every level sits at a fixed point
  // on it — the customer can see how far the whole ladder goes, not just the
  // next step.
  const trackPercent = top.minimumSpendVnd
    ? Math.min(100, (spend / top.minimumSpendVnd) * 100)
    : 100;

  return (
    <div
      data-testid="tier-ladder"
      className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
    >
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="text-base font-semibold text-gray-900">
          {vi ? "Các hạng thành viên" : "Membership levels"}
        </h3>
        <p className="mt-0.5 text-sm text-gray-500">
          {vi
            ? "Chi tiêu càng nhiều, hoàn tiền và thưởng giới thiệu càng cao."
            : "The more you spend, the more cashback and referral reward you earn."}
        </p>
      </div>

      <div className="px-5 pt-5">
        <div className="relative h-1.5 rounded-full bg-gray-100">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-500 to-violet-600"
            style={{ width: `${trackPercent}%` }}
          />
          {tiers.map((rung) => {
            const position = top.minimumSpendVnd
              ? (rung.minimumSpendVnd / top.minimumSpendVnd) * 100
              : 0;
            const reached = spend >= rung.minimumSpendVnd;
            return (
              <span
                key={rung.tier}
                aria-hidden
                className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                  reached
                    ? "border-violet-600 bg-white"
                    : "border-gray-300 bg-gray-100"
                }`}
                style={{ left: `${position}%` }}
              />
            );
          })}
        </div>
      </div>

      <ul className="divide-y divide-gray-100 p-5 pt-4">
        {tiers.map((rung, index) => {
          const reached = spend >= rung.minimumSpendVnd;
          const isCurrent = index === currentIndex;
          const missing = Math.max(0, rung.minimumSpendVnd - spend);

          return (
            <li
              key={rung.tier}
              data-testid={`tier-rung-${rung.tier}`}
              data-reached={reached ? "true" : "false"}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 first:pt-0 last:pb-0"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  reached
                    ? `bg-gradient-to-br ${TIER_ACCENTS[rung.tier]} text-white`
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {reached ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      reached ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {TIER_LABELS[rung.tier][lang]}
                  </span>
                  {isCurrent && (
                    <span
                      data-testid="tier-current-badge"
                      className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700"
                    >
                      {vi ? "Hạng hiện tại" : "Current"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {rung.minimumSpendVnd === 0
                    ? vi
                      ? "Ngay khi tạo tài khoản"
                      : "As soon as you sign up"
                    : `${vi ? "Chi tiêu từ" : "From"} ${formatVnd(rung.minimumSpendVnd)}`}
                  {!reached && missing > 0 && (
                    <>
                      {" · "}
                      <span className="font-medium text-gray-700">
                        {vi ? "Còn thiếu" : "Still need"} {formatVnd(missing)}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 ${
                    reached
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <Coins className="h-3.5 w-3.5" />
                  {rung.cashbackPercent}% eXU
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 ${
                    reached ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <Gift className="h-3.5 w-3.5" />
                  {formatVnd(rung.referralRewardVnd)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
