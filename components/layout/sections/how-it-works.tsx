interface HowItWorksSectionProps {
  dict: Record<string, any>;
}

const stepImages = [
  "https://sb.nordcdn.com/m/2e23689ebdcc105/original/1-step.svg",
  "https://sb.nordcdn.com/m/2a28e7fa0cb54961/original/2-step.svg",
  "https://sb.nordcdn.com/m/3f8ce32d6d5693d3/original/3-step.svg",
];

export function HowItWorksSection({ dict }: HowItWorksSectionProps) {
  return (
    <div
      data-section="HowSailyWorks"
      data-testid="section-HowSailyWorks"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        {/* Header */}
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <p className="body-md-medium text-disabled mb-4 scroll-mt-20 xl:scroll-mt-24">
                {dict.subtitle}
              </p>
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="heading-xl scroll-mt-20 xl:scroll-mt-24">
                  {dict.title}
                </h2>
                <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
                  {dict.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step Cards */}
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col gap-y-4">
              <div>
                <div className="grid sm:gap-x-8 md:grid-cols-3 grid-cols-1 gap-y-8">
                  {dict.steps.map((step: any, i: number) => (
                    <div key={i}>
                      <div className="flex flex-col items-start text-left rtl:text-right relative h-full word-break-word transform-gpu border-none p-0 gap-0 overflow-hidden rounded-sm bg-blue-100">
                        <div className="p-6 lg:pb-3">
                          {/* Step Number */}
                          <div className="pb-4 lg:pb-6">
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white">
                              <p className="body-md-medium text-primary scroll-mt-20 xl:scroll-mt-24">
                                {step.number}
                              </p>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex flex-col gap-3 lg:gap-4 w-full h-full">
                            <h3 className="body-lg-medium text-primary scroll-mt-20 xl:scroll-mt-24">
                              {step.title}
                            </h3>
                            <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        {/* Step Image */}
                        <div className="hidden md:flex justify-center items-end w-full h-full pt-3">
                          <div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt={step.imageAlt}
                              loading="lazy"
                              width={368}
                              height={240}
                              decoding="async"
                              src={stepImages[i]}
                              style={{ color: "transparent" }}
                            />
                          </div>
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
    </div>
  );
}
