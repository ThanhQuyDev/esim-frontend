interface ReferAboutSprintProps {
  dict: Record<string, any>;
}

export function ReferAboutSprint({ dict }: ReferAboutSprintProps) {
  const paragraphs: string[] = dict.paragraphs ?? [];

  return (
    <div
      data-section="SailyRewardSprint"
      data-testid="section-SailyRewardSprint"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="mx-auto">
              <div className="mx-auto container">
                <div className="grid sm:gap-x-16 gap-y-8 grid-cols-1 md:grid-cols-2">
                  <div className="h-full flex flex-col justify-center gap-y-4">
                    <div className="h-full w-full flex flex-col justify-center gap-y-4">
                      <div className="flex flex-col justify-start gap-y-6">
                        <h2 className="heading-xl text-primary scroll-mt-20 xl:scroll-mt-24">
                          {dict.title}
                        </h2>

                        <div className="flex flex-col justify-start gap-y-6">
                          {paragraphs.map((p, i) => (
                            <div key={i} className="body-md text-secondary">
                              <p className="text-secondary scroll-mt-20 xl:scroll-mt-24">
                                {p}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={dict.imageAlt}
                        loading="lazy"
                        width={555}
                        height={555}
                        decoding="async"
                        src="https://res.cloudinary.com/deqfcfcwf/image/upload/v1782062656/about-rewards-sprint-program-asset_zcrcd4.png"
                        style={{ color: "transparent" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
