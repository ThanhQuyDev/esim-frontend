"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Search, ShoppingCart, X, Infinity as InfinityIcon } from "lucide-react";
import { useDebounce } from "@/lib/use-debounce";
import {
  formatVnd,
  useCart,
  useExchangeRate,
  usePlansBySlug,
  useSearchDestinations,
} from "@/lib/hooks";
import { formatSalePrice } from "@/lib/price-locale";
import { formatDataSize } from "@/lib/blog-plan-data";
import { CartConfirmDialog } from "@/components/layout/sections/destination/cart-confirm-dialog";
import { planCartItem } from "@/components/layout/sections/destination/cart-item";
import { localizedSlug } from "@/lib/slug";
import { DATA_RATES } from "./calculator-data";
import {
  buildDonutSegments,
  formatData,
  totalDailyMb,
} from "@/lib/data-calculator-chart";
import {
  collectCandidates,
  groupSuggestions,
  MONTH_DAYS,
  tripPriceVnd,
  type PlanKind,
  type PlanSuggestion,
} from "@/lib/plan-suggestions";
import type { Destination } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";

interface PlanSuggestionsProps {
  /** Hours per activity, straight from the calculator. */
  values: Record<string, number>;
  dict: Record<string, any>;
  lang: Locale;
}

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) =>
    key in vars ? String(vars[key]) : "",
  );
}

function destinationName(destination: Destination, lang: string): string {
  const localized = lang === "vi" ? destination.titleVi : destination.title;
  return localized || destination.name;
}

/**
 * "Which plan should I buy?" — answered right under the estimate (#078, #035).
 *
 * Type a destination and the plans sold there are listed in three groups, each
 * matched the way that kind of plan is sold: fixed 30-day-plus packages holding
 * a month of the estimate, daily plans whose per-day allowance covers a day of
 * it, and the cheapest unlimited plans.
 */
export function PlanSuggestions({ values, dict, lang }: PlanSuggestionsProps) {
  const t = (dict.suggestions ?? {}) as Record<string, string>;

  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState<Destination | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  /** Trip length, so the plans match it rather than a guessed month (v3 #013). */
  const [daysInput, setDaysInput] = useState("");
  const tripDays = Math.min(365, Math.max(0, parseInt(daysInput, 10) || 0));
  const { addItem } = useCart();
  const [added, setAdded] = useState<{ name: string; totalVnd: number } | null>(null);

  const dailyMb = useMemo(
    () =>
      totalDailyMb(
        buildDonutSegments(values, { rates: DATA_RATES, colors: {} }),
      ),
    [values],
  );

  const hasQuery = debouncedQuery.trim().length > 0 && !destination;
  const { data: matches = [], isFetching: isSearching } = useSearchDestinations(
    debouncedQuery,
    hasQuery,
  );

  const slug = destination ? localizedSlug(destination, lang) : "";
  const { data: plans, isFetching: isLoadingPlans } = usePlansBySlug(slug, lang);
  const { data: usdVndRate } = useExchangeRate();

  const groups = useMemo(
    () => groupSuggestions(collectCandidates(plans), { dailyMb, tripDays }),
    [plans, dailyMb, tripDays],
  );
  const covered = groups.fixed.length + groups.daily.length;
  const hasAnything = covered + groups.unlimited.length + groups.fallback.length > 0;

  const price = (vnd: number) => formatSalePrice(vnd, lang, usdVndRate);
  const destinationHref = destination
    ? lang === "vi"
      ? `/${slug}`
      : `/${lang}/${slug}`
    : "";

  const days = (count: number) =>
    interpolate(t.durationDays ?? "{{days}}", { days: count });

  const headline = (suggestion: PlanSuggestion) => {
    if (suggestion.kind === "unlimited") {
      return (
        <>
          <InfinityIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t.unlimited}
        </>
      );
    }
    // A plan's size is in binary units like everywhere else on the site; the
    // calculator's decimal formatter turned 15 GB (15360 MB) into "15.4 GB".
    if (suggestion.kind === "daily") {
      return interpolate(t.dataPerDay ?? "{{data}}", {
        data: formatDataSize(suggestion.plan.dataMb),
      });
    }
    return formatDataSize(suggestion.plan.dataMb);
  };

  const detail = (suggestion: PlanSuggestion) => {
    if (suggestion.kind === "fixed") {
      return interpolate(t.coversDays ?? "{{days}}", { days: suggestion.coversDays });
    }
    if (suggestion.kind === "daily") {
      return interpolate(t.coversDaily ?? "", { day: formatData(dailyMb) });
    }
    return t.unlimitedDetail ?? "";
  };

  /**
   * Tapping a plan puts it in the cart and offers "pay now / keep shopping",
   * instead of opening the destination page where the plan had to be found
   * and picked all over again (v3 #013).
   */
  const addToCart = async (suggestion: PlanSuggestion) => {
    const plan = suggestion.plan;
    const days = plan.isAbleMultidate ? tripDays || plan.durationDays || 1 : plan.durationDays;
    const item = planCartItem(plan, {
      days,
      isFixed: !plan.isAbleMultidate,
      destination: destination ? destinationName(destination, lang) : undefined,
    });
    await addItem(item);
    setAdded({ name: item.name, totalVnd: item.vndPrice ?? 0 });
  };

  const renderSuggestion = (suggestion: PlanSuggestion) => (
    <li key={suggestion.plan.id}>
      <button
        type="button"
        onClick={() => void addToCart(suggestion)}
        data-testid={`plan-suggestion-${suggestion.plan.id}`}
        aria-label={`${t.addToCart ?? ""}: ${suggestion.plan.name ?? ""}`}
        className="flex w-full items-center gap-3 rounded-sm border border-border-secondary bg-bg-primary p-3 text-left transition-colors hover:border-border-focus cursor-pointer"
      >
        <span className="flex flex-col flex-1 min-w-0">
          <span className="body-md-medium text-text-primary flex items-center gap-1.5">
            {headline(suggestion)}
            <span className="body-sm text-text-tertiary">
              ·{" "}
              {days(
                suggestion.plan.isAbleMultidate && tripDays
                  ? tripDays
                  : suggestion.plan.durationDays,
              )}
            </span>
          </span>
          <span className="body-2xs text-text-tertiary truncate">{detail(suggestion)}</span>
        </span>
        <span className="flex flex-col items-end shrink-0">
          <span className="body-md-medium text-text-primary">
            {price(tripDays ? tripPriceVnd(suggestion.plan, tripDays) : suggestion.plan.vndPrice)}
          </span>
          <span className="body-2xs text-text-tertiary">
            {interpolate(t.perDay ?? "{{price}}", {
              price: price(suggestion.vndPerDay),
            })}
          </span>
        </span>
        <ShoppingCart className="h-4 w-4 shrink-0 text-text-tertiary" aria-hidden="true" />
      </button>
    </li>
  );

  const renderGroup = (kind: PlanKind, title: string | undefined, list: PlanSuggestion[]) =>
    list.length > 0 ? (
      <div className="flex flex-col gap-2" data-testid={`plan-suggestions-group-${kind}`}>
        <p className="body-sm-medium text-text-secondary m-0">{title}</p>
        <ul className="flex flex-col gap-2 list-none p-0 m-0">{list.map(renderSuggestion)}</ul>
      </div>
    ) : null;

  return (
    <section className="flex flex-col gap-3 w-full" data-testid="plan-suggestions">
      <div>
        <p className="body-lg-medium text-text-primary">{t.title}</p>
        <p className="body-2xs text-text-tertiary mt-1">{t.subtitle}</p>
      </div>

      {destination ? (
        <div className="flex items-center gap-2 rounded-sm border border-border-secondary bg-bg-secondary px-3 py-2">
          <MapPin className="h-4 w-4 shrink-0 text-text-tertiary" aria-hidden="true" />
          <span
            className="body-md-medium text-text-primary flex-1 truncate"
            data-testid="plan-suggestions-destination"
          >
            {destinationName(destination, lang)}
          </span>
          <button
            type="button"
            onClick={() => {
              setDestination(null);
              setQuery("");
            }}
            data-testid="plan-suggestions-change"
            className="text-text-tertiary hover:text-text-primary shrink-0 rounded-full p-1 transition-colors"
            aria-label={t.change}
            title={t.change}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            data-testid="plan-suggestions-input"
            className="w-full rounded-sm border-md border-border-secondary bg-bg-primary py-[11px] pl-9 pr-9 body-md text-text-primary placeholder-text-tertiary outline-hidden hover:border-border-focus focus:border-border-focus"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              data-testid="plan-suggestions-clear"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-tertiary transition-colors hover:text-text-primary"
              aria-label={t.clear}
              title={t.clear}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {hasQuery && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-sm border border-border-secondary bg-bg-primary shadow-lg">
              {matches.length > 0 ? (
                <ul className="list-none p-0 m-0">
                  {matches.slice(0, 8).map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setDestination(item)}
                        data-testid={`plan-suggestions-option-${item.slug}`}
                        className="w-full px-3 py-2 text-left body-md text-text-primary transition-colors hover:bg-bg-secondary"
                      >
                        {destinationName(item, lang)}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="body-2xs text-text-tertiary m-0 px-3 py-2">
                  {isSearching ? t.searching : t.noDestinations}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <CalendarDays
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={365}
          value={daysInput}
          onChange={(e) => setDaysInput(e.target.value.replace(/\D/g, "").slice(0, 3))}
          placeholder={t.tripDaysPlaceholder}
          aria-label={t.tripDaysPlaceholder}
          data-testid="plan-suggestions-days"
          className="w-full rounded-sm border-md border-border-secondary bg-bg-primary py-[11px] pl-9 pr-9 body-md text-text-primary placeholder-text-tertiary outline-hidden hover:border-border-focus focus:border-border-focus [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {daysInput && (
          <button
            type="button"
            onClick={() => setDaysInput("")}
            data-testid="plan-suggestions-days-clear"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-tertiary transition-colors hover:text-text-primary"
            aria-label={t.clear}
            title={t.clear}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nothing to match against until the customer has entered some hours. */}
      {dailyMb <= 0 && (
        <p className="body-2xs text-text-tertiary m-0" data-testid="plan-suggestions-need-usage">
          {t.needUsage}
        </p>
      )}

      {destination && dailyMb > 0 && (
        <>
          {/* The thresholds the plans below are measured against. */}
          <p className="body-2xs text-text-secondary m-0" data-testid="plan-suggestions-need">
            {tripDays
              ? interpolate(t.needTripSummary ?? "", {
                  total: formatData(dailyMb * tripDays),
                  days: tripDays,
                  day: formatData(dailyMb),
                })
              : interpolate(t.needSummary ?? "", {
                  month: formatData(dailyMb * MONTH_DAYS),
                  day: formatData(dailyMb),
                })}
          </p>

          {isLoadingPlans && !hasAnything ? (
            <p className="body-2xs text-text-tertiary m-0">{t.loadingPlans}</p>
          ) : hasAnything ? (
            <div className="flex flex-col gap-4">
              {renderGroup(
                "fixed",
                tripDays ? interpolate(t.groupFixedTrip ?? "", { days: tripDays }) : t.groupFixed,
                groups.fixed,
              )}
              {renderGroup(
                "daily",
                tripDays ? interpolate(t.groupDailyTrip ?? "", { days: tripDays }) : t.groupDaily,
                groups.daily,
              )}

              {covered === 0 && groups.fallback.length > 0 && (
                <div className="flex flex-col gap-2">
                  {/* Honest about the gap rather than pretending a small plan fits */}
                  <p
                    className="body-2xs text-text-tertiary m-0"
                    data-testid="plan-suggestions-none-cover"
                  >
                    {t.noneCover}
                  </p>
                  <ul className="flex flex-col gap-2 list-none p-0 m-0">
                    {groups.fallback.map(renderSuggestion)}
                  </ul>
                </div>
              )}

              {renderGroup(
                "unlimited",
                tripDays
                  ? interpolate(t.groupUnlimitedTrip ?? "", { days: tripDays })
                  : t.groupUnlimited,
                groups.unlimited,
              )}

              <Link
                href={destinationHref}
                data-testid="plan-suggestions-view-all"
                className="body-2xs-medium text-text-secondary hover:text-text-primary underline underline-offset-2"
              >
                {interpolate(t.viewAll ?? "", {
                  name: destinationName(destination, lang),
                })}
              </Link>
            </div>
          ) : (
            <p className="body-2xs text-text-tertiary m-0" data-testid="plan-suggestions-empty">
              {t.noPlans}
            </p>
          )}
        </>
      )}
      <CartConfirmDialog
        open={!!added}
        onClose={() => setAdded(null)}
        lang={lang}
        itemName={added?.name ?? "eSIM"}
        totalLabel={formatVnd(added?.totalVnd ?? 0)}
      />
    </section>
  );
}
