import type { PlansByDestinationResponse } from "./api";
import { formatDataCompact, interpolate } from "./utils";
import { formatSalePrice, formatVndPrice } from "./price-locale";

/**
 * Per-country / per-region copy for the "how it works" steps (#044).
 *
 * The homepage keeps the generic text. A country or region page renders the
 * `destination` variant instead, with the place name and that place's real plan
 * lineup (how many packs, which data sizes, which durations, cheapest price)
 * substituted in — so the steps describe the eSIM the visitor is looking at
 * rather than eSIMs in general.
 */

export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
  imageAlt: string;
  /** Extra dynamic line, rendered only when the plan facts are known. */
  note?: string;
}

export interface HowItWorksDict {
  subtitle: string;
  title: string;
  description: string;
  steps: HowItWorksStep[];
}

/** What the steps can say about a place's actual plan lineup. */
export interface PlanFacts {
  planCount: number;
  /** "1GB – 20GB", or a single size when every plan is the same. */
  dataRange: string | null;
  /** "3 – 30 ngày" / "3 – 30 days". */
  dayRange: string | null;
  /** Cheapest plan, formatted in VND: "120.000đ". */
  fromPrice: string | null;
  /** Cheapest plan as a raw VND number, for callers that convert (#050). */
  fromPriceVnd: number;
  hasUnlimited: boolean;
}

const PLAN_GROUPS = [
  "localEsim",
  "dataPlans",
  "fastUnlimited",
  "slowUnlimited",
  "dailyUnlimited",
  "smsCallEsim",
] as const;

const UNLIMITED_GROUPS = [
  "fastUnlimited",
  "slowUnlimited",
  "dailyUnlimited",
] as const;

function range(
  values: number[],
  format: (n: number) => string
): string | null {
  if (values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? format(min) : `${format(min)} – ${format(max)}`;
}

/**
 * Summarize the plans of one destination/region. Returns null when there is
 * nothing to say — the caller then leaves the dynamic line out entirely rather
 * than printing an empty claim.
 */
export function summarizePlanFacts(
  plans: PlansByDestinationResponse | null | undefined,
  lang: string
): PlanFacts | null {
  if (!plans) return null;

  const all = PLAN_GROUPS.flatMap((group) => plans[group] ?? []);
  if (all.length === 0) return null;

  const dayUnit = lang === "en" ? "days" : "ngày";
  const prices = all
    .map((plan) => Number(plan.vndPrice))
    .filter((price) => Number.isFinite(price) && price > 0);
  const days = all
    .map((plan) => Number(plan.durationDays))
    .filter((d) => Number.isFinite(d) && d > 0);
  // Unlimited plans carry dataMb 0 (or a FUP threshold); they'd drag the range
  // down to "0MB", so only sized plans describe the data range.
  const dataMb = all
    .map((plan) => Number(plan.dataMb))
    .filter((mb) => Number.isFinite(mb) && mb > 0);

  const fromPriceVnd = prices.length ? Math.min(...prices) : 0;

  return {
    planCount: all.length,
    dataRange: range(dataMb, formatDataCompact),
    dayRange: days.length
      ? `${range(days, (n) => String(n))} ${dayUnit}`
      : null,
    fromPrice: fromPriceVnd > 0 ? formatVndPrice(fromPriceVnd) : null,
    fromPriceVnd,
    hasUnlimited: UNLIMITED_GROUPS.some(
      (group) => (plans[group] ?? []).length > 0
    ),
  };
}

/**
 * Place names come from the CMS `title`/`titleVi`, which for regions often
 * already read "eSIM Châu Âu". Copy that says "eSIM ${name}" would then double
 * the word, so the prefix is dropped here and added back by the copy.
 */
export function placeName(name: string): string {
  return name.replace(/^\s*esim\s+/i, "").trim() || name;
}

/** A string that still carries an unresolved `${var}` must never reach a page. */
function resolved(value: string | undefined): string | null {
  if (!value) return null;
  return /\$\{\w+\}/.test(value) ? null : value;
}

/**
 * Build the "how it works" dict for a country/region page.
 *
 * Falls back to the generic string whenever a templated one can't be filled, so
 * a missing variable shows the old wording instead of a literal `${name}`.
 * Called without a `name` (the homepage) it returns the base dict untouched.
 */
export function buildHowItWorksDict(
  base: Record<string, any>,
  opts: {
    name?: string | null;
    plans?: PlansByDestinationResponse | null;
    lang: string;
    /**
     * USD → VND rate. The English steps quote USD, so they never sit next to a
     * dong figure on the same page (#050).
     */
    rate?: number;
  }
): HowItWorksDict {
  const generic: HowItWorksDict = {
    subtitle: base.subtitle,
    title: base.title,
    description: base.description,
    steps: (base.steps ?? []) as HowItWorksStep[],
  };
  if (!opts.name) return generic;

  const template = (base.destination ?? base) as Record<string, any>;
  const facts = summarizePlanFacts(opts.plans, opts.lang);
  const vars = {
    name: placeName(opts.name),
    planCount: facts?.planCount,
    dataRange: facts?.dataRange,
    dayRange: facts?.dayRange,
    fromPrice:
      facts && facts.fromPriceVnd > 0
        ? formatSalePrice(facts.fromPriceVnd, opts.lang, opts.rate)
        : undefined,
  };

  const fill = (value: string | undefined, fallback: string): string =>
    resolved(interpolate(value ?? "", vars)) ?? fallback;

  const templateSteps = (template.steps ?? []) as (HowItWorksStep & {
    planNote?: string;
    planNoteUnlimited?: string;
  })[];

  return {
    subtitle: fill(template.subtitle, generic.subtitle),
    title: fill(template.title, generic.title),
    description: fill(template.description, generic.description),
    steps: templateSteps.map((step, i) => {
      const fallback = generic.steps[i] ?? step;
      const noteTemplate =
        facts?.hasUnlimited && step.planNoteUnlimited
          ? step.planNoteUnlimited
          : step.planNote;
      return {
        number: step.number ?? fallback.number,
        title: fill(step.title, fallback.title),
        description: fill(step.description, fallback.description),
        imageAlt: fill(step.imageAlt, fallback.imageAlt),
        // Dropped outright when a fact is missing: an incomplete sentence about
        // the plan lineup is worse than no sentence.
        note: resolved(interpolate(noteTemplate ?? "", vars)) ?? undefined,
      };
    }),
  };
}
