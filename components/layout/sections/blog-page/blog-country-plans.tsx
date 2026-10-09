import Image from "next/image";
import Link from "next/link";
import { Globe } from "lucide-react";
import type { Plan } from "@/lib/api";
import { formatPrice } from "./blog-detail-helpers";
import { formatBlogPlanData } from "@/lib/blog-plan-data";
import { blogPlanDestination } from "@/lib/blog-localize";

/** Where a plan works — its country, else its region (#034, test round 4). */
function planLocation(plan: Plan, lang: string) {
  const place = plan.destination ?? plan.region ?? null;
  const { name, href } = blogPlanDestination(place, lang);
  const flagUrl =
    plan.destination?.flagUrl || plan.region?.avatarUrl || plan.region?.iconUrl || null;
  return { name: place ? name : "", href, flagUrl };
}

export function BlogCountryPlansList({ plans, lang }: { plans: Plan[]; lang: string }) {
  if (!plans || plans.length === 0) return null;

  const firstPlan = plans[0];
  // Name and page in the post's language (#059); a region plan uses its region.
  const { name: destinationName, href: destinationHref } = blogPlanDestination(
    firstPlan.destination ?? firstPlan.region ?? null,
    lang
  );

  return (
    <div className="flex flex-col w-full gap-6 max-md:px-4 p-6 rounded-sm md:rounded-md bg-[linear-gradient(#EEF1F6,#C9D6E9)] CountryPlansList">
      <p className="heading-sm text-primary scroll-mt-20 xl:scroll-mt-24">
        {lang === "vi" ? "Bạn cần dữ liệu khi đến" : "Need data in"} {destinationName}?  {lang === "vi" ? "Hãy dùng eSIM ngay!" : "Get an eSIM!"}
      </p>
      <ul className="px-4 py-1 bg-primary rounded-sm">
        {plans.map((plan, idx) => {
          const location = planLocation(plan, lang);
          return (
            <li
              key={plan.id}
              data-testid="blog-plan-row"
              className={`flex items-center gap-2 py-3 ${idx > 0 ? "border-t" : ""}`}
            >
              <div className="w-[24px] h-[24px] relative overflow-hidden shrink-0 rounded-full">
                {/* No image → a globe, never an <Image> with an empty src (#034). */}
                {location.flagUrl ? (
                  <Image
                    alt={`${location.name || plan.countryCode || ""} flag`}
                    loading="lazy"
                    fill
                    className="w-full h-full object-cover"
                    sizes="24px"
                    src={location.flagUrl}
                    data-testid="blog-plan-flag"
                  />
                ) : (
                  <Globe className="w-full h-full text-secondary" aria-hidden />
                )}
                <div className="absolute inset-0 border-md rounded-full pointer-events-none border-[rgba(0,0,0,0.1)]" />
              </div>
              <div className="md:flex md:gap-2 items-center">
                {/* Country / region first, so the line reads on its own (#034). */}
                <p className="body-md-medium scroll-mt-20 xl:scroll-mt-24" data-testid="blog-plan-name">
                  {location.name ? `${location.name} ` : ""}
                  {/* By plan type: "2 GB/ngày", "Không giới hạn" — never "0 MB" (#057). */}
                  {formatBlogPlanData(plan, lang)}
                </p>
                <p className="body-sm-medium text-secondary scroll-mt-20 xl:scroll-mt-24">
                  {plan.durationDays} {lang === "vi" ? "ngày" : "days"}
                </p>
              </div>
              <p className="body-md-medium ml-auto scroll-mt-20 xl:scroll-mt-24">{formatPrice(plan)}</p>
            </li>
          );
        })}
      </ul>
      {destinationHref && (
        <Link
          role="button"
          className="max-md:w-full text-center inline-block text-primary bg-accent hover:bg-bg-accent-hover pointer-fine:hover:bg-accent-hover border-md border-bg-accent-hover pointer-fine:hover:border-accent-hover active:bg-accent-active! active:border-accent-active! box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
          href={destinationHref}
          data-testid="blog-plans-see-all"
        >
          {lang === "vi"
            ? `Xem tất cả gói eSIM ${destinationName}`
            : `See all ${destinationName} eSIM plans`}
        </Link>
      )}
    </div>
  );
}
