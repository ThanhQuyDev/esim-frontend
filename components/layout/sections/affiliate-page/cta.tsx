import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { localizedHref } from "@/lib/route-mapping";

interface AffiliateCtaProps {
  dict: Record<string, any>;
  lang: string;
}

/** Closing call to action — the second entry point to the sign-up form. */
export function AffiliateCta({ dict, lang }: AffiliateCtaProps) {
  return (
    <div
      data-section="affiliate-cta"
      data-testid="section-affiliate-cta"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="rounded-3xl bg-blue-100 px-6 py-12 text-center md:px-12">
              <h2 className="heading-xl text-primary">{dict.title}</h2>
              <p className="body-md text-secondary mx-auto mt-3 max-w-xl">
                {dict.description}
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="cursor-pointer">
                  <Link
                    href={localizedHref(lang, "/affiliate/register")}
                    data-testid="affiliate-cta-button"
                  >
                    {dict.cta}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
              <p className="body-xs text-secondary mt-4">{dict.note}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
