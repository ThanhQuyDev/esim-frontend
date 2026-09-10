import {
  BarChart3,
  Globe2,
  Link2,
  Sparkles,
  Ticket,
  Wallet,
} from "lucide-react";

interface Benefit {
  icon?: string;
  title: string;
  description: string;
}

interface AffiliateBenefitsProps {
  dict: Record<string, any>;
}

/**
 * Icon per benefit, chosen in the dictionary by name so translators can
 * reorder the list without touching the component.
 */
const ICONS: Record<string, typeof Globe2> = {
  wallet: Wallet,
  link: Link2,
  chart: BarChart3,
  globe: Globe2,
  ticket: Ticket,
  sparkles: Sparkles,
};

export function AffiliateBenefits({ dict }: AffiliateBenefitsProps) {
  const items: Benefit[] = dict.items ?? [];

  return (
    <div
      data-section="affiliate-benefits"
      data-testid="section-affiliate-benefits"
      className="relative scroll-mt-20 xl:scroll-mt-24 bg-gray-50/70"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <h2 className="heading-xl text-primary">{dict.title}</h2>
            <p className="body-md text-secondary mt-3 max-w-2xl">
              {dict.subtitle}
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => {
                const Icon = ICONS[item.icon ?? ""] ?? Sparkles;
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-white p-6"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </span>
                    <h3 className="body-lg-medium text-primary mt-4">
                      {item.title}
                    </h3>
                    <p className="body-md text-secondary mt-2">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AffiliateAudienceProps {
  dict: Record<string, any>;
}

/** Who the programme is for — the "is this me?" section. */
export function AffiliateAudience({ dict }: AffiliateAudienceProps) {
  const items: { title: string; description: string }[] = dict.items ?? [];

  return (
    <div
      data-section="affiliate-audience"
      data-testid="section-affiliate-audience"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <h2 className="heading-xl text-primary">{dict.title}</h2>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 p-6"
                >
                  <h3 className="body-lg-medium text-primary">{item.title}</h3>
                  <p className="body-md text-secondary mt-2">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
