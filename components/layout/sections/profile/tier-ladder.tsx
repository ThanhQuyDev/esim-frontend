"use client";

import { Check, Coins, Crown, Gem, Gift, Lock, Medal, Plane, Star } from "lucide-react";
import { formatExu, formatVnd, useMembershipTiers } from "@/lib/hooks";
import type { MembershipTier } from "@/lib/hooks";
import { tierAccent, tierIconKey, tierName } from "./tier-names";

const TIER_ICONS = { plane: Plane, medal: Medal, crown: Crown, gem: Gem, star: Star };

interface TierLadderProps {
  /** The tier the customer is on right now (may be an admin override). */
  currentTier: MembershipTier;
  lifetimeSpendVnd: number;
  lang: "en" | "vi";
}

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
  // The levels sit evenly along the track, so their icons never overlap (the
  // first steps are small next to the top one), and the fill moves through
  // each gap in proportion to the spend between those two levels
  // (vande-1411 #040).
  const step = tiers.length > 1 ? 100 / (tiers.length - 1) : 100;
  const passed = tiers.filter((rung) => spend >= rung.minimumSpendVnd).length;
  const nextRung = tiers[passed];
  const lastReached = tiers[passed - 1];
  const trackPercent =
    !nextRung || !lastReached
      ? passed ? 100 : 0
      : Math.min(
          100,
          (passed - 1) * step +
            (step * (spend - lastReached.minimumSpendVnd)) /
              Math.max(1, nextRung.minimumSpendVnd - lastReached.minimumSpendVnd)
        );

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

      {/* Each level's milestone shows its picture, and its goal on hover or
          tap (vande-1411 #040). Extra room at the sides and above keeps the
          edge icons inside the card; the bubbles open downward, over the list. */}
      <div className="px-7 pt-6 pb-3">
        <div className="relative h-1.5 rounded-full bg-gray-100">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-500 to-violet-600"
            style={{ width: `${trackPercent}%` }}
          />
          {tiers.map((rung, index) => {
            const position = index * step;
            const reached = spend >= rung.minimumSpendVnd;
            const missing = Math.max(0, rung.minimumSpendVnd - spend);
            const Icon = TIER_ICONS[tierIconKey(rung.tier)];
            const name = tierName(rung.tier, lang, tiers);
            // The first and last bubbles open inward so they stay on screen.
            const bubbleSide =
              index === 0
                ? "left-0"
                : index === tiers.length - 1
                  ? "right-0"
                  : "left-1/2 -translate-x-1/2";
            return (
              <span
                key={rung.tier}
                tabIndex={0}
                role="img"
                aria-label={name}
                data-testid={`tier-milestone-${rung.tier}`}
                data-reached={reached ? "true" : "false"}
                className="group absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 outline-none"
                style={{ left: `${position}%` }}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-110 group-focus-visible:scale-110 ${
                    reached
                      ? `bg-gradient-to-br ${tierAccent(rung.tier)} text-white`
                      : "bg-gray-200 text-gray-400"
                  } ${index === currentIndex ? "ring-2 ring-violet-300 ring-offset-1" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span
                  role="tooltip"
                  data-testid={`tier-milestone-tip-${rung.tier}`}
                  className={`pointer-events-none invisible absolute top-full mt-2 w-56 rounded-xl bg-gray-900 px-3 py-2.5 text-left text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100 ${bubbleSide}`}
                >
                  <span className="block text-sm font-semibold">{name}</span>
                  <span className="block text-gray-300">
                    {rung.minimumSpendVnd === 0
                      ? vi
                        ? "Ngay khi tạo tài khoản"
                        : "As soon as you sign up"
                      : `${vi ? "Mục tiêu: chi tiêu từ" : "Goal: spend from"} ${formatVnd(rung.minimumSpendVnd)}`}
                  </span>
                  <span className="mt-1 block">
                    {vi ? "Hoàn" : "Cashback"} {rung.cashbackPercent}% eXU ·{" "}
                    {vi ? "Thưởng giới thiệu" : "Referral reward"} {formatExu(rung.referralRewardVnd, lang)}
                  </span>
                  <span className={`mt-1 block font-medium ${reached ? "text-emerald-300" : "text-amber-300"}`}>
                    {reached
                      ? vi
                        ? "Đã đạt"
                        : "Reached"
                      : `${vi ? "Còn thiếu" : "Still need"} ${formatVnd(missing)}`}
                  </span>
                </span>
              </span>
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
                    ? `bg-gradient-to-br ${tierAccent(rung.tier)} text-white`
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {reached ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
              </span>

              {/* A basis, so on a phone the badges wrap below instead of squeezing the name to one word a line. */}
              <div className="min-w-0 flex-1 basis-40">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      reached ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {tierName(rung.tier, lang, tiers)}
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
                  {formatExu(rung.referralRewardVnd, lang)}
                </span>
                {/* What a friend gets off their first order (vande-0411 #056). */}
                <span
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 ${
                    reached ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-400"
                  }`}
                  data-testid="tier-referee-discount"
                >
                  {lang === "vi" ? "Bạn bè giảm" : "Friend gets"}{" "}
                  {Number(rung.refereeDiscountVnd ?? 0).toLocaleString(lang === "vi" ? "vi-VN" : "en-US")}₫
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
