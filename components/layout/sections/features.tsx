import {
  Layers,
  CheckCircle,
  ClipboardCheck,
  CreditCard,
  BellRing,
  Globe,
} from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n-config";

interface FeaturesSectionProps {
  dict: Record<string, any>;
  lang: Locale;
}

const iconMap: Record<string, React.ElementType> = {
  layers: Layers,
  "circle-check": CheckCircle,
  "ballot-check": ClipboardCheck,
  "sim-card": CreditCard,
  "bell-ring": BellRing,
  earth: Globe,
  // legacy fallbacks
  globe: Globe,
  smartphone: CheckCircle,
  ban: ClipboardCheck,
  sim: CreditCard,
  bell: BellRing,
  map: Globe,
};

// Helper to render description with links
function DescriptionWithLinks({ text }: { text: string }) {
  // Parse text for markdown-style links: [text](url)
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  
  return (
    <>
      {parts.map((part, idx) => {
        const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          const [, linkText, url] = linkMatch;
          return (
            <Link
              key={idx}
              href={url}
              className="underline transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
            >
              {linkText}
            </Link>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}

export function FeaturesSection({ dict, lang }: FeaturesSectionProps) {
  const features = dict.features ?? [];

  return (
    <div
      data-section="StayConnected"
      data-testid="section-StayConnected"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        {/* Header */}
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <p className="body-md-medium text-disabled mb-4">
                {dict.badge}
              </p>
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="heading-xl text-primary">
                  {dict.title}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            {/* Desktop grid (md+) */}
            <div className="sm:gap-x-8 md:grid-cols-3 grid-cols-1 gap-y-8 hidden md:grid">
              {features.map((feature: any, i: number) => {
                const Icon = iconMap[feature.icon] || Globe;
                return (
                  <div key={i}>
                    <div className="h-full w-full flex flex-col justify-start gap-y-4">
                      <div>
                        <div className="h-full w-full flex flex-col text-start items-start justify-start gap-y-6">
                          <div>
                            <Icon className="lg:text-[32px] text-[24px] w-6 h-6 lg:w-8 lg:h-8 text-primary" />
                          </div>
                          <div>
                            <h3 className="body-lg-medium text-primary">
                              {feature.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="body-md" style={{ color: '#4d4e56' }}>
                          <DescriptionWithLinks text={feature.description} />
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile carousel (below md) */}
            <div className="md:hidden max-sm:-mx-4 max-sm:px-4 overflow-hidden">
              <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4">
                {features.map((feature: any, i: number) => {
                  const Icon = iconMap[feature.icon] || Globe;
                  return (
                    <div
                      key={i}
                      className="snap-start shrink-0 max-w-[87%] min-[480px]:max-w-[71%] sm:max-w-[62%]"
                    >
                      <div className="h-full w-full flex flex-col justify-start gap-y-4">
                        <div>
                          <div className="h-full w-full flex flex-col text-start items-start justify-start gap-y-6">
                            <div>
                              <Icon className="text-[24px] w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p
                                className="body-lg-medium text-primary"
                                role="heading"
                                aria-level={3}
                              >
                                {feature.title}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="body-md" style={{ color: '#4d4e56' }}>
                            <DescriptionWithLinks text={feature.description} />
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
