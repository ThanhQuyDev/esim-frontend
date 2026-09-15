"use client";

/**
 * TEST-ONLY harness for the domestic-eSIM feature.
 *
 * Two real components are mounted client-side so Playwright's `page.route`
 * (which only intercepts BROWSER requests) can drive them against a mocked
 * network layer. The real pages can't be used directly:
 *   - `/` (homepage) and `/esim-noi-dia/[carrier]` are SERVER components whose
 *     SSR fetches hit the backend and throw / notFound when it's unreachable.
 *
 * Views (query param `?view=`):
 *   - `detail` (default) → mounts {@link LocalEsimDetail} WITHOUT initialPlans,
 *     so its client hook fetches plans from the mock.
 *   - `tab` → mounts the real {@link DestinationsSection} so the "eSIM nội địa"
 *     tab + {@link LocalCarrierGrid} card grid can be exercised.
 *   - `plans` → mounts the real {@link DestinationPlans} for `?slug=`, so the
 *     plan lists and the local-IP ("nonhkip") filter can be exercised against a
 *     mocked `/plans/by-destination/:slug`.
 *   - `search` → mounts the real {@link DestinationSearchModal} already open, so
 *     the domestic-eSIM suggestions ("việt nam", "esim nội địa", a carrier name)
 *     can be exercised without the server-rendered homepage hero.
 *   - `plan-suggest` → mounts the real {@link PlanSuggestions} for
 *     `?values=key:hours,…`, so the destination lookup and the plan matching
 *     can be exercised against mocked destinations/plans endpoints.
 *   - `donut` → mounts the real {@link DonutChart} for `?values=key:hours,…`,
 *     so the slice maths and the legend can be checked without the calculator
 *     page around it.
 *   - `support-form` → mounts the real {@link SupportForm} so the spam guard
 *     (honeypot, fill-time trap, per-browser rate limit, duplicate) can be
 *     exercised against a mocked `POST /api/v1/tickets`.
 *   - `help-search` → mounts the real {@link HelpCenterSearchBox} so the live
 *     results popup can be exercised against a mocked
 *     `/api/v1/help-center/search`; the real help-center page is a server
 *     component whose SSR fetch throws with no backend.
 *
 * Guard: 404 in production — only renders under `next dev`.
 *
 * Query params:
 *   ?view=detail|tab|search|plans|region-suggest|how-it-works|faq|tier-ladder|esim-usage|orders|blog-nav|lang-cache|help-search|support-form|donut|plan-suggest|affiliate
 *   ?slug=japan                       (plans view; default japan)
 *   ?carrier=wintel|itel|vnsky|...   (detail view; default wintel)
 *   ?lang=vi|en                       (defaults to the route locale)
 */

import { notFound, useSearchParams } from "next/navigation";
import { useLocale, useMessages } from "next-intl";
import { LocalEsimDetail } from "@/components/layout/sections/local-esim/local-esim-detail";
import { DestinationsSection } from "@/components/layout/sections/destinations";
import { DestinationSearchModal } from "@/components/layout/destination-search-modal";
import { DestinationPlans } from "@/components/layout/sections/destination/destination-plans";
import { useLocalPlansByCarrier, useDestinationBySlug, useRegions, usePlansBySlug } from "@/lib/hooks";
import { RegionSuggestions } from "@/components/layout/sections/destination/region-suggestions";
import { buildRegionSuggestions } from "@/lib/region-suggestions";
import { RegionVariantTabs } from "@/components/layout/sections/region-group/region-variant-tabs";
import { findRegionGroupBySlug } from "@/lib/region-groups";
import { HowItWorksSection } from "@/components/layout/sections/how-it-works";
import { buildHowItWorksDict } from "@/lib/how-it-works";
import { FAQSection } from "@/components/layout/sections/faq";
import { TierLadder } from "@/components/layout/sections/profile/tier-ladder";
import { DataUsageSection } from "@/components/layout/sections/profile/esim-card-list";
import { OrderList } from "@/components/layout/sections/profile/order-list";
import { AffiliateTab } from "@/components/layout/sections/profile/affiliate-tab";
import { BlogCategoryNav } from "@/components/layout/sections/blog-page";
import { HelpCenterSearchBox } from "@/components/layout/sections/help-center/help-center-search-box";
import { SupportForm, type SupportFormDict } from "@/components/layout/sections/support";
import { DonutChart } from "@/components/layout/sections/data-calculator/donut-chart";
import { PlanSuggestions } from "@/components/layout/sections/data-calculator/plan-suggestions";
import { profileTranslations } from "@/components/layout/sections/profile/translations";
import type { MembershipTier } from "@/lib/hooks";
import type { DestinationDict } from "@/components/layout/sections/destination/types";
import type { Destination } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";

/**
 * Runs the real country→region join client-side (#043), so the suggestions the
 * server page renders can be exercised against mocked `/destinations/slug/:slug`
 * and `/regions` responses.
 */
function RegionSuggestionsProbe({
  slug,
  lang,
}: {
  slug: string;
  lang: Locale;
}) {
  const messages = useMessages() as Record<string, any>;
  const destination = useDestinationBySlug(slug, lang);
  const regions = useRegions(undefined, undefined, undefined, 500);

  if (!destination.data || !regions.data) {
    return <p data-testid="region-suggest-loading">loading</p>;
  }

  const items = buildRegionSuggestions(destination.data, regions.data, lang);

  return (
    <RegionSuggestions
      items={items}
      countryName={
        (lang === "vi" ? destination.data.titleVi : destination.data.title) ||
        destination.data.name
      }
      dict={{
        ...messages.regionSuggestions,
        from: messages.allDestinations.from,
        country: messages.allDestinations.country,
        countries: messages.allDestinations.countries,
      }}
      lang={lang}
    />
  );
}

/**
 * Resolves a region group from the mocked `/regions` list the same way the
 * server page does and mounts the real variant tabs (#004), so switching packs
 * in place can be exercised against a mocked `/plans/by-region/:slug`.
 */
function RegionTabsProbe({ slug, lang }: { slug: string; lang: Locale }) {
  const messages = useMessages() as Record<string, any>;
  const regions = useRegions(undefined, undefined, undefined, 500);

  if (!regions.data) {
    return <p data-testid="region-tabs-loading">loading</p>;
  }

  const group = findRegionGroupBySlug(regions.data, slug, lang);
  if (!group) return <p data-testid="region-tabs-none">no group</p>;

  return (
    <RegionVariantTabs
      members={group.members}
      lang={lang}
      dict={messages.destinationPage as DestinationDict}
      fromLabel={messages.allDestinations.from}
      initialSlug={group.slug === slug ? undefined : slug}
    />
  );
}

/**
 * Builds the per-country "how it works" copy the same way the server page does
 * (#044) and mounts the real section, so the dynamic wording and the plan-facts
 * line can be exercised against a mocked plans API.
 */
function HowItWorksProbe({ slug, lang }: { slug: string; lang: Locale }) {
  const messages = useMessages() as Record<string, any>;
  const destination = useDestinationBySlug(slug, lang);
  const plans = usePlansBySlug(slug, lang);

  if (!destination.data || !plans.data) {
    return <p data-testid="how-it-works-loading">loading</p>;
  }

  const name =
    (lang === "vi" ? destination.data.titleVi : destination.data.title) ||
    destination.data.name;

  return (
    <HowItWorksSection
      dict={buildHowItWorksDict(messages.howItWorks, {
        name,
        plans: plans.data,
        lang,
      })}
    />
  );
}

/** Minimal destination for the `plans` view — the plan list is what's tested. */
function harnessDestination(slug: string): Destination {
  return {
    id: 1,
    name: slug,
    slug,
    slugVi: slug,
    countryCode: slug.slice(0, 2).toUpperCase(),
    isPopular: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  };
}

/**
 * Mounts the SAME localized query twice, once per language, so a test can
 * assert the two do not share a React Query cache entry. Before the fix the
 * language was missing from the query key, so the second mount silently reused
 * the first language's payload — the "site switches itself to English" bug.
 */
function LangCacheProbe({ carrier }: { carrier: string }) {
  const vi = useLocalPlansByCarrier(carrier, "vi");
  const en = useLocalPlansByCarrier(carrier, "en");

  return (
    <div>
      <p data-testid="lang-cache-vi">
        vi:{vi.isSuccess ? "ok" : vi.isLoading ? "loading" : "idle"}
      </p>
      <p data-testid="lang-cache-en">
        en:{en.isSuccess ? "ok" : en.isLoading ? "loading" : "idle"}
      </p>
    </div>
  );
}

export default function LocalEsimTestPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const locale = useLocale() as Locale;
  const messages = useMessages() as Record<string, unknown>;

  // `useSearchParams` rather than `window.location.search`: reading `window`
  // during render makes the server and client markup disagree, which React
  // reports as a hydration error and then re-renders the whole tree on the
  // client.
  const params = useSearchParams();

  const view = params.get("view") ?? "detail";
  const carrier = (params.get("carrier") ?? "wintel").toLowerCase();
  const lang = (params.get("lang") as Locale | null) ?? locale;

  if (view === "tab") {
    const destDict = messages.destinations as Record<string, unknown>;
    return (
      <main role="main">
        <p data-testid="local-test-meta">view=tab lang={lang}</p>
        <DestinationsSection dict={destDict} lang={lang} />
      </main>
    );
  }

  if (view === "lang-cache") {
    return (
      <main role="main">
        <p data-testid="local-test-meta">view=lang-cache carrier={carrier}</p>
        <LangCacheProbe carrier={carrier} />
      </main>
    );
  }

  if (view === "blog-nav") {
    return (
      <main role="main" style={{ padding: 12 }}>
        <p data-testid="local-test-meta">view=blog-nav lang={lang}</p>
        <BlogCategoryNav lang={lang} />
      </main>
    );
  }

  if (view === "orders") {
    const orders = JSON.parse(params.get("orders") ?? "[]");
    return (
      <main role="main" style={{ padding: 12 }}>
        <p data-testid="local-test-meta">view=orders lang={lang}</p>
        <OrderList
          orders={orders}
          isLoading={false}
          t={profileTranslations[lang === "en" ? "en" : "vi"]}
          lang={lang === "en" ? "en" : "vi"}
        />
      </main>
    );
  }

  if (view === "esim-usage") {
    const esimId = Number(params.get("esimId") ?? 1);
    return (
      <main role="main" style={{ padding: 12 }}>
        <p data-testid="local-test-meta">view=esim-usage esimId={esimId}</p>
        <DataUsageSection esimId={esimId} lang={lang} />
      </main>
    );
  }

  if (view === "affiliate") {
    // Affiliates tab (#095). The real profile page needs a signed-in
    // partner; here the partner record is a query param and the two list
    // endpoints are mocked, so the tab itself can be exercised.
    const status = params.get("status") ?? "active";
    return (
      <main role="main" style={{ padding: 12 }}>
        <p data-testid="local-test-meta">view=affiliate status={status}</p>
        <AffiliateTab
          lang={lang === "en" ? "en" : "vi"}
          partner={{ id: 5, partnerType: "kol", status, tierCode: "silver" }}
        />
      </main>
    );
  }

  if (view === "tier-ladder") {
    const spend = Number(params.get("spend") ?? 0);
    const tier = (params.get("tier") ?? "traveler") as MembershipTier;
    return (
      <main role="main" style={{ padding: 12 }}>
        <p data-testid="local-test-meta">
          view=tier-ladder spend={spend} tier={tier}
        </p>
        <TierLadder
          currentTier={tier}
          lifetimeSpendVnd={spend}
          lang={lang === "en" ? "en" : "vi"}
        />
      </main>
    );
  }

  if (view === "faq") {
    const slug = params.get("slug") ?? "/esim-nhat-ban";
    const generic = params.get("generic") ?? "/destination";
    return (
      <main role="main" style={{ padding: 12 }}>
        <p data-testid="local-test-meta">
          view=faq slug={slug} lang={lang}
        </p>
        <FAQSection
          dict={(messages.faq ?? {}) as Record<string, unknown>}
          lang={lang}
          url={slug}
          urls={[slug, generic]}
        />
      </main>
    );
  }

  if (view === "how-it-works") {
    const slug = params.get("slug") ?? "japan";
    return (
      <main role="main" style={{ padding: 12 }}>
        <p data-testid="local-test-meta">
          view=how-it-works slug={slug} lang={lang}
        </p>
        <HowItWorksProbe slug={slug} lang={lang} />
      </main>
    );
  }

  if (view === "region-tabs") {
    const slug = params.get("slug") ?? "esim-chau-a";
    return (
      <main role="main" style={{ padding: 12 }}>
        <p data-testid="local-test-meta">
          view=region-tabs slug={slug} lang={lang}
        </p>
        <RegionTabsProbe slug={slug} lang={lang} />
      </main>
    );
  }

  if (view === "region-suggest") {
    const slug = params.get("slug") ?? "japan";
    return (
      <main role="main" style={{ padding: 12 }}>
        <p data-testid="local-test-meta">
          view=region-suggest slug={slug} lang={lang}
        </p>
        <RegionSuggestionsProbe slug={slug} lang={lang} />
      </main>
    );
  }

  if (view === "plans") {
    const dict = messages.destinationPage as DestinationDict;
    const slug = params.get("slug") ?? "japan";
    return (
      <main role="main" style={{ padding: 12 }}>
        <p data-testid="local-test-meta">
          view=plans slug={slug} lang={lang}
        </p>
        <DestinationPlans
          destination={harnessDestination(slug)}
          slug={slug}
          dict={dict}
          lang={lang}
        />
      </main>
    );
  }

  if (view === "search") {
    return (
      <main role="main">
        <p data-testid="local-test-meta">view=search lang={lang}</p>
        <DestinationSearchModal lang={lang} open onClose={() => { }} />
      </main>
    );
  }

  if (view === "plan-suggest") {
    const raw = params.get("values") ?? "videoCalls:2,socialMedia:1";
    const values = Object.fromEntries(
      raw
        .split(",")
        .filter(Boolean)
        .map((pair) => {
          const [key, hours] = pair.split(":");
          return [key, Number(hours) || 0];
        }),
    );
    const suggestDict = (messages.dataCalculator as { calculator: Record<string, any> })
      .calculator;
    return (
      <main role="main" style={{ padding: 12 }}>
        <p data-testid="local-test-meta">view=plan-suggest lang={lang}</p>
        <div style={{ maxWidth: 420 }}>
          <PlanSuggestions values={values} dict={suggestDict} lang={lang} />
        </div>
      </main>
    );
  }

  if (view === "donut") {
    // `?values=socialMedia:1,emailsMessaging:0.5` — hours per activity.
    const raw = params.get("values") ?? "socialMedia:1,videoCalls:2,emailsMessaging:0.5";
    const values = Object.fromEntries(
      raw
        .split(",")
        .filter(Boolean)
        .map((pair) => {
          const [key, hours] = pair.split(":");
          return [key, Number(hours) || 0];
        }),
    );
    const calcDict = (messages.dataCalculator as { calculator: Record<string, any> })
      .calculator;
    return (
      <main role="main" style={{ padding: 12 }}>
        <p data-testid="local-test-meta">view=donut lang={lang}</p>
        <div style={{ maxWidth: 420 }}>
          <DonutChart values={values} dict={calcDict} />
        </div>
      </main>
    );
  }

  if (view === "support-form") {
    return (
      <main role="main" style={{ padding: 12 }}>
        <p data-testid="local-test-meta">view=support-form lang={lang}</p>
        <SupportForm
          lang={lang}
          dict={(messages.support as { form: SupportFormDict }).form}
        />
      </main>
    );
  }

  if (view === "help-search") {
    return (
      <main role="main" style={{ padding: 12 }}>
        <p data-testid="local-test-meta">view=help-search lang={lang}</p>
        <HelpCenterSearchBox lang={lang} variant="hero" />
      </main>
    );
  }

  const dict = messages.destinationPage as DestinationDict;
  return (
    <main role="main" style={{ padding: 12 }}>
      <p data-testid="local-test-meta">carrier={carrier} lang={lang}</p>
      <LocalEsimDetail carrier={carrier} dict={dict} lang={lang} />
    </main>
  );
}
