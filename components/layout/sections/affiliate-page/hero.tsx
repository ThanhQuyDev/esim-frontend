import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { localizedHref } from "@/lib/route-mapping";

interface AffiliateHeroProps {
  dict: Record<string, any>;
  lang: string;
}

/**
 * Landing hero for the affiliate programme (#095, ý 4).
 *
 * Deliberately illustration-free: every other marketing page here points at a
 * Cloudinary asset, and shipping a link to an image nobody has uploaded yet
 * would leave a broken box at the top of the page. The stat strip carries the
 * visual weight until a real asset exists.
 */
export function AffiliateHero({ dict, lang }: AffiliateHeroProps) {
  const perks: string[] = dict.perks ?? [];
  const stats: { value: string; label: string }[] = dict.stats ?? [];

  return (
    <div
      data-section="affiliate-hero"
      data-testid="section-affiliate-hero"
      className="relative scroll-mt-20 xl:scroll-mt-24 bg-gradient-to-b from-blue-50/70 to-white"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="max-w-3xl">
              <p className="body-md-medium text-tertiary">{dict.badge}</p>
              <h1 className="heading-2xl text-primary mt-4">{dict.title}</h1>
              <p className="body-md text-secondary mt-5">{dict.description}</p>

              <ul className="mt-6 flex flex-col gap-y-2 body-md">
                {perks.map((perk, i) => (
                  <li key={i} className="flex text-primary">
                    <span className="mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <p>{perk}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="cursor-pointer">
                  <Link
                    href={localizedHref(lang, "/affiliate/register")}
                    data-testid="affiliate-hero-cta"
                  >
                    {dict.ctaPrimary}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <a
                  href="#how-it-works"
                  className="body-md-medium text-primary underline underline-offset-4"
                >
                  {dict.ctaSecondary}
                </a>
              </div>
            </div>

            {stats.length > 0 && (
              <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-gray-200 bg-white p-6"
                  >
                    <p className="text-2xl font-semibold text-primary">
                      {stat.value}
                    </p>
                    <p className="body-md text-secondary mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
