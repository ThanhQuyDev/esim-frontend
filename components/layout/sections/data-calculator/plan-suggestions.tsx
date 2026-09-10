"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Search, X, Infinity as InfinityIcon } from "lucide-react";
import { useDebounce } from "@/lib/use-debounce";
import { useExchangeRate, usePlansBySlug, useSearchDestinations } from "@/lib/hooks";
import { formatSalePrice } from "@/lib/price-locale";
import { localizedSlug } from "@/lib/slug";
import { DATA_RATES } from "./calculator-data";
import {
  buildDonutSegments,
  formatData,
  totalDailyMb,
} from "@/lib/data-calculator-chart";
import {
  collectCandidates,
  fallbackSuggestions,
  suggestPlans,
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
 * "Which plan should I buy?" — answered right under the estimate (#078).
 *
 * The calculator stopped at a number of gigabytes, leaving the customer to
 * work out which package covered it. Type a destination and every plan sold
 * there is measured against the estimate; the ones that cover it are listed
 * cheapest first.
 */
export function PlanSuggestions({ values, dict, lang }: PlanSuggestionsProps) {
  const t = (dict.suggestions ?? {}) as Record<string, string>;

  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState<Destination | null>(null);
  const debouncedQuery = useDebounce(query, 300);

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

  const { covering, fallback } = useMemo(() => {
    const candidates = collectCandidates(plans);
    const cover = suggestPlans(candidates, { dailyMb });
    return {
      covering: cover,
      fallback: cover.length > 0 ? [] : fallbackSuggestions(candidates, { dailyMb }),
    };
  }, [plans, dailyMb]);

  const price = (vnd: number) => formatSalePrice(vnd, lang, usdVndRate);
  const destinationHref = destination
    ? lang === "vi"
      ? `/${slug}`
      : `/${lang}/${slug}`
    : "";

  const renderSuggestion = (suggestion: PlanSuggestion) => (
    <li key={suggestion.plan.id}>
      <Link
        href={destinationHref}
        data-testid={`plan-suggestion-${suggestion.plan.id}`}
        className="flex items-center gap-3 rounded-sm border border-border-secondary bg-bg-primary p-3 no-underline transition-colors hover:border-border-focus"
      >
        <span className="flex flex-col flex-1 min-w-0">
          <span className="body-md-medium text-text-primary flex items-center gap-1.5">
            {suggestion.isUnlimited ? (
              <>
                <InfinityIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {t.unlimited}
              </>
            ) : (
              formatData(suggestion.plan.dataMb)
            )}
            <span className="body-sm text-text-tertiary">
              · {interpolate(t.durationDays ?? "{{days}}", {
                days: suggestion.plan.durationDays,
              })}
            </span>
          </span>
          <span className="body-2xs text-text-tertiary truncate">
            {suggestion.isUnlimited
              ? interpolate(t.durationDays ?? "{{days}}", {
                  days: suggestion.plan.durationDays,
                })
              : interpolate(t.coversDays ?? "{{days}}", {
                  days: suggestion.coversDays,
                })}
          </span>
        </span>
        <span className="flex flex-col items-end shrink-0">
          <span className="body-md-medium text-text-primary">
            {price(suggestion.plan.vndPrice)}
          </span>
          <span className="body-2xs text-text-tertiary">
            {interpolate(t.perDay ?? "{{price}}", {
              price: price(suggestion.vndPerDay),
            })}
          </span>
        </span>
      </Link>
    </li>
  );

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
            className="w-full rounded-sm border-md border-border-secondary bg-bg-primary py-[11px] pl-9 pr-3 body-md text-text-primary placeholder-text-tertiary outline-hidden hover:border-border-focus focus:border-border-focus"
          />

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

      {/* Nothing to match against until the customer has entered some hours. */}
      {dailyMb <= 0 && (
        <p className="body-2xs text-text-tertiary m-0" data-testid="plan-suggestions-need-usage">
          {t.needUsage}
        </p>
      )}

      {destination && dailyMb > 0 && (
        <>
          {isLoadingPlans && covering.length === 0 && fallback.length === 0 ? (
            <p className="body-2xs text-text-tertiary m-0">{t.loadingPlans}</p>
          ) : covering.length > 0 ? (
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              {covering.map(renderSuggestion)}
            </ul>
          ) : fallback.length > 0 ? (
            <>
              {/* Honest about the gap rather than pretending a small plan fits */}
              <p
                className="body-2xs text-text-tertiary m-0"
                data-testid="plan-suggestions-none-cover"
              >
                {t.noneCover}
              </p>
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {fallback.map(renderSuggestion)}
              </ul>
            </>
          ) : (
            <p className="body-2xs text-text-tertiary m-0" data-testid="plan-suggestions-empty">
              {t.noPlans}
            </p>
          )}

          {(covering.length > 0 || fallback.length > 0) && (
            <Link
              href={destinationHref}
              data-testid="plan-suggestions-view-all"
              className="body-2xs-medium text-text-secondary hover:text-text-primary underline underline-offset-2"
            >
              {interpolate(t.viewAll ?? "", {
                name: destinationName(destination, lang),
              })}
            </Link>
          )}
        </>
      )}
    </section>
  );
}
