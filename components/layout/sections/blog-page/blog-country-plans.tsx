import Image from "next/image";
import Link from "next/link";
import type { Plan } from "@/lib/api";
import { formatDataMb, formatPrice } from "./blog-detail-helpers";

export function BlogCountryPlansList({ plans, lang }: { plans: Plan[]; lang: string }) {
  if (!plans || plans.length === 0) return null;

  const firstPlan = plans[0];
  const countryCode = firstPlan.countryCode?.toLowerCase() || "";
  const destinationName = firstPlan.destination?.name || "this country";
  const destinationSlug = firstPlan.destination?.slug || "";

  return (
    <div className="flex flex-col w-full gap-6 max-md:px-4 p-6 rounded-sm md:rounded-md bg-[linear-gradient(#EEF1F6,#C9D6E9)] CountryPlansList">
      <p className="heading-sm text-primary scroll-mt-20 xl:scroll-mt-24">
        Need data in {destinationName}? Get an eSIM!
      </p>
      <ul className="px-4 py-1 bg-secondary rounded-sm">
        {plans.map((plan, idx) => (
          <li
            key={plan.id}
            className={`flex items-center gap-2 py-3 ${idx > 0 ? "border-t" : ""}`}
          >
            <div className="w-[24px] h-[24px] relative overflow-hidden shrink-0 rounded-full">
              <Image
                alt={`${countryCode.toUpperCase()} flag`}
                loading="lazy"
                fill
                className="w-full h-full object-cover"
                sizes="100vw"
                src={plan.destination?.flagUrl ?? ''}
              />
              <div className="absolute inset-0 border-md rounded-full pointer-events-none border-[rgba(0,0,0,0.1)]" />
            </div>
            <div className="md:flex md:gap-2 items-center">
              <p className="body-md-medium scroll-mt-20 xl:scroll-mt-24">{formatDataMb(plan.dataMb)}</p>
              <p className="body-sm-medium text-secondary scroll-mt-20 xl:scroll-mt-24">
                {plan.durationDays} days
              </p>
            </div>
            <p className="body-md-medium ml-auto scroll-mt-20 xl:scroll-mt-24">{formatPrice(plan)}</p>
          </li>
        ))}
      </ul>
      {destinationSlug && (
        <Link
          role="button"
          className="max-md:w-full text-center inline-block text-primary bg-accent pointer-fine:hover:bg-accent-hover border-md border-bg-accent-hover pointer-fine:hover:border-accent-hover active:bg-accent-active! active:border-accent-active! box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
          href={`/${lang}/${destinationSlug}/`}
        >
          See All Data Plans
        </Link>
      )}
    </div>
  );
}
