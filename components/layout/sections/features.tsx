import Image from "next/image";
import type { Locale } from "@/lib/i18n-config";
import type { WhyChooseUs } from "@/lib/api";

interface FeaturesSectionProps {
  dict: Record<string, any>;
  lang: Locale;
  features?: WhyChooseUs[];
}

export function FeaturesSection({ dict, lang, features = [] }: FeaturesSectionProps) {
  // Sort by sortOrder and filter active items
  const sortedFeatures = [...features]
    .filter((f) => f.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

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
              {sortedFeatures.map((feature) => (
                <div key={feature.id}>
                  <div className="h-full w-full flex flex-col justify-start gap-y-4">
                    <div>
                      <div className="h-full w-full flex flex-col text-start items-start justify-start gap-y-6">
                        <div>
                          {feature.icon ? (
                            <Image
                              src={feature.icon}
                              alt={feature.title}
                              width={32}
                              height={32}
                              className="lg:w-8 lg:h-8 w-6 h-6"
                              unoptimized
                            />
                          ) : (
                            <div className="lg:w-8 lg:h-8 w-6 h-6 bg-muted rounded" />
                          )}
                        </div>
                        <div>
                          <h3 className="body-lg-medium text-primary">
                            {feature.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div
                        className="body-md prose prose-sm max-w-none"
                        style={{ color: '#4d4e56' }}
                        dangerouslySetInnerHTML={{ __html: feature.description }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile carousel (below md) */}
            <div className="md:hidden max-sm:-mx-4 max-sm:px-4 overflow-hidden">
              <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4">
                {sortedFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="snap-start shrink-0 max-w-[87%] min-[480px]:max-w-[71%] sm:max-w-[62%]"
                  >
                    <div className="h-full w-full flex flex-col justify-start gap-y-4">
                      <div>
                        <div className="h-full w-full flex flex-col text-start items-start justify-start gap-y-6">
                          <div>
                            {feature.icon ? (
                              <Image
                                src={feature.icon}
                                alt={feature.title}
                                width={24}
                                height={24}
                                className="w-6 h-6"
                                unoptimized
                              />
                            ) : (
                              <div className="w-6 h-6 bg-muted rounded" />
                            )}
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
                        <div
                          className="body-md prose prose-sm max-w-none"
                          style={{ color: '#4d4e56' }}
                          dangerouslySetInnerHTML={{ __html: feature.description }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
