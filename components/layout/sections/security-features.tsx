import Image from "next/image";

interface SecurityFeaturesProps {
  dict: Record<string, any>;
}

export function SecurityFeatures({ dict }: SecurityFeaturesProps) {
  return (
    <div
      data-section="SecurityFeatures"
      data-testid="section-SecurityFeatures"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="h-full w-full flex flex-col gap-y-10">
              {/* Header */}
              <div>
                <div className="h-full w-full flex flex-col gap-y-6">
                  <div>
                    <div className="grid sm:gap-x-8 grid-cols-12 gap-y-8">
                      <div className="col-span-12 lg:col-start-3 lg:col-span-8">
                        <div className="h-full w-full flex flex-col items-center gap-y-4">
                          <div>
                            <h2 className="heading-xl text-center scroll-mt-20 xl:scroll-mt-24">
                              {dict.title}
                            </h2>
                          </div>
                          <div>
                            <p className="body-md text-secondary text-center scroll-mt-20 xl:scroll-mt-24">
                              {dict.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* CTA Button */}
                  <div>
                    <div className="hidden sm:block">
                      <div className="h-full w-full flex flex-col justify-center items-center gap-y-4">
                        <div>
                          <a
                            role="button"
                            className="max-md:w-full text-center inline-block text-text-primary bg-bg-accent hover:bg-bg-accent-hover border border-bg-accent hover:border-bg-accent-hover active:bg-bg-accent-active active:border-bg-accent-active box-border !border-[#d1b700] touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7 w-full sm:w-auto"
                            href="/all-destinations/"
                          >
                            {dict.cta}
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="block sm:hidden">
                      <a
                        role="button"
                        className="max-md:w-full text-center inline-block text-primary bg-accent hover:bg-accent-hover border-md border-accent hover:border-accent-hover active:bg-accent-active active:border-accent-active box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
                        href="/all-destinations/"
                      >
                        {dict.cta}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Tiles */}
              <div>
                <div className="h-full w-full flex flex-col gap-y-8">
                  {/* Top 2-column row */}
                  <div>
                    <div>
                      {/* Desktop: md+ */}
                      <div className="hidden md:block">
                        <div className="grid sm:gap-x-8 md:grid-cols-2 grid-cols-1 gap-y-8">
                          {/* Tile 1 - Connect instantly */}
                          {dict.features[0] && (
                            <div>
                              <div
                                className="flex flex-col rounded-sm md:rounded-md lg:rounded-lg h-full overflow-hidden"
                                style={{ backgroundColor: "rgb(238, 241, 246)" }}
                              >
                                <div className="flex-1">
                                  <div className="md:p-10 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                                    <div>
                                      <div className="h-full w-full flex flex-col gap-y-4">
                                        <div>
                                          <h3 className="heading-lg scroll-mt-20 xl:scroll-mt-24">
                                            {dict.features[0].title}
                                          </h3>
                                        </div>
                                        <div>
                                          <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
                                            {dict.features[0].description}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-1">
                                  <div className="mx-auto flex items-end">
                                    <div>
                                      <Image
                                        alt={dict.features[0].imageAlt}
                                        loading="lazy"
                                        width={609}
                                        height={609}
                                        src="https://sb.nordcdn.com/m/5f5e15f2fe290a34/original/homepage-display-tile-1.png"
                                        style={{ color: "transparent" }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Tile 2 - Avoid waiting in line */}
                          {dict.features[1] && (
                            <div>
                              <div
                                className="flex flex-col rounded-sm md:rounded-md lg:rounded-lg h-full overflow-hidden"
                                style={{ backgroundColor: "rgb(159, 207, 242)" }}
                              >
                                <div className="flex-1">
                                  <div className="md:p-10 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                                    <div>
                                      <div className="h-full w-full flex flex-col gap-y-4">
                                        <div>
                                          <h3 className="heading-lg scroll-mt-20 xl:scroll-mt-24">
                                            {dict.features[1].title}
                                          </h3>
                                        </div>
                                        <div>
                                          <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
                                            {dict.features[1].description}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-1">
                                  <div className="mx-auto flex items-end">
                                    <div className="hidden md:block">
                                      <div>
                                        <Image
                                          alt={dict.features[1].imageAlt}
                                          loading="lazy"
                                          width={609}
                                          height={609}
                                          src="https://sb.nordcdn.com/m/7b18929dcd6459c9/original/homepage-display-tile-2.png"
                                          style={{ color: "transparent" }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mobile: sm to md */}
                      <div className="block md:hidden">
                        <div className="grid sm:gap-x-8 grid-cols-1 gap-y-8">
                          {/* Tile 1 mobile */}
                          {dict.features[0] && (
                            <div>
                              <div className="flex lg:flex-row flex-col rounded-sm md:rounded-md lg:rounded-lg h-full overflow-hidden bg-blue-100">
                                <div className="flex-1 flex items-center">
                                  <div className="md:p-16 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                                    <div className="text-center lg:text-left">
                                      <h3 className="heading-lg text-start scroll-mt-20 xl:scroll-mt-24">
                                        {dict.features[0].title}
                                      </h3>
                                    </div>
                                    <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
                                      {dict.features[0].description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-1">
                                  <div className="mx-auto flex items-end lg:items-center">
                                    <div>
                                      <Image
                                        alt={dict.features[0].imageAlt}
                                        loading="lazy"
                                        width={609}
                                        height={609}
                                        src="https://sb.nordcdn.com/m/5f5e15f2fe290a34/original/homepage-display-tile-1.png"
                                        style={{ color: "transparent" }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Tile 2 mobile */}
                          {dict.features[1] && (
                            <div>
                              <div
                                className="flex flex-col rounded-sm md:rounded-md lg:rounded-lg h-full overflow-hidden"
                                style={{ backgroundColor: "rgb(159, 207, 242)" }}
                              >
                                <div className="flex-1">
                                  <div className="md:p-10 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                                    <div>
                                      <div className="h-full w-full flex flex-col gap-y-4">
                                        <div>
                                          <h3 className="heading-lg scroll-mt-20 xl:scroll-mt-24">
                                            {dict.features[1].title}
                                          </h3>
                                        </div>
                                        <div>
                                          <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
                                            {dict.features[1].description}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full-width Tile 3 - Stay protected online */}
                  {dict.features[2] && (
                    <div>
                      <div>
                        {/* Desktop: md+ */}
                        <div className="hidden md:block">
                          <div
                            className="flex lg:flex-row flex-col rounded-sm md:rounded-md lg:rounded-lg h-full overflow-hidden"
                            style={{ backgroundColor: "rgb(238, 241, 246)" }}
                          >
                            <div className="flex-1 flex items-center">
                              <div className="md:p-16 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                                <div>
                                  <div className="h-full w-full flex flex-col gap-y-4">
                                    <div>
                                      <h3 className="heading-lg scroll-mt-20 xl:scroll-mt-24">
                                        {dict.features[2].title}
                                      </h3>
                                    </div>
                                    <div>
                                      <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
                                        {dict.features[2].description}
                                      </p>
                                    </div>
                                    <div>
                                      <a
                                        role="button"
                                        className="max-md:w-full text-center inline-block text-primary hover:bg-brand-black hover:text-primary-on-color border-md border-reversed active:bg-brand-black active:text-primary-on-color box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
                                        href="/security-features/"
                                        aria-label={`Learn more about ${dict.features[2].title}`}
                                      >
                                        {dict.learnMore}
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-1">
                              <div className="mx-auto flex items-end lg:items-center">
                                <div>
                                  <Image
                                    alt={dict.features[2].imageAlt}
                                    loading="lazy"
                                    width={600}
                                    height={555}
                                    src="https://sb.nordcdn.com/m/174fc00da8400ee5/original/homepage-display-tile-3.png"
                                    style={{ color: "transparent" }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mobile: below md */}
                        <div className="block md:hidden">
                          <div
                            className="flex lg:flex-row flex-col rounded-sm md:rounded-md lg:rounded-lg h-full overflow-hidden"
                            style={{ backgroundColor: "rgb(238, 241, 246)" }}
                          >
                            <div className="flex-1 flex items-center">
                              <div className="md:p-16 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                                <div>
                                  <div className="h-full w-full flex flex-col gap-y-4">
                                    <div>
                                      <p className="heading-lg scroll-mt-20 xl:scroll-mt-24">
                                        {dict.features[2].title}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
                                        {dict.features[2].description}
                                      </p>
                                    </div>
                                    <div>
                                      <a
                                        role="button"
                                        className="max-md:w-full text-center inline-block text-primary hover:bg-brand-black hover:text-primary-on-color border-md border-reversed active:bg-brand-black active:text-primary-on-color box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
                                        href="/security-features/"
                                        aria-label={`Learn more about ${dict.features[2].title}`}
                                      >
                                        {dict.learnMore}
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
