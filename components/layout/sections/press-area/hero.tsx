import type { PressAreaDict } from "./translations";

interface PressAreaHeroProps {
  dict: PressAreaDict["hero"];
}

export function PressAreaHero({ dict }: PressAreaHeroProps) {
  return (
    <div data-section="Hero" data-testid="section-Hero" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16 overflow-hidden">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="grid sm:gap-x-8 md:grid-cols-2 grid-cols-1 gap-y-8 xl:gap-x-16">
              <div>
                <div className="h-full flex flex-col justify-center gap-y-6">
                  <div className="list flex flex-col gap-y-4">
                    <div className="h-full w-full flex flex-col">
                      <div>
                        <a
                          className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
                          rel="noopener noreferrer nofollow"
                          target="_blank"
                          href="https://www.trustpilot.com/review/saily.com"
                        >
                          <div className="inline-flex gap-2 items-start">
                            <div className="flex gap-2 items-baseline">
                              <p className="body-md-medium text-text-primary scroll-mt-20 xl:scroll-mt-24">{dict.excellent}</p>
                              <p className="body-sm text-text-primary scroll-mt-20 xl:scroll-mt-24">{dict.rating}</p>
                            </div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt="Trustpilot"
                              loading="lazy"
                              width={98}
                              height={21}
                              decoding="async"
                              style={{ color: "transparent" }}
                              src="https://sb.nordcdn.com/m/790e17b32e10d831/original/trustpilot-logo.svg"
                            />
                          </div>
                        </a>
                      </div>
                    </div>
                    <h1 className="heading-2xl scroll-mt-20 xl:scroll-mt-24">{dict.title}</h1>
                  </div>
                  <p className="body-lg text-text-secondary scroll-mt-20 xl:scroll-mt-24">
                    {dict.description}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-center">
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="A smiling woman using her phone while sitting with her luggage."
                      loading="eager"
                      width={555}
                      height={555}
                      decoding="async"
                      style={{ color: "transparent" }}
                      src="https://sb.nordcdn.com/m/61f8a8af9d05330c/original/press-area-hero.png"
                    />
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
