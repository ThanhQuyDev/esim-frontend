interface ReferDownloadAppProps {
  dict: Record<string, any>;
}

export function ReferDownloadApp({ dict }: ReferDownloadAppProps) {
  return (
    <div
      data-section="download"
      data-testid="section-download"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="flex lg:flex-row flex-col rounded-sm md:rounded-md lg:rounded-lg h-full overflow-hidden bg-accent">
              <div className="flex-1 flex items-center">
                <div className="md:p-16 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                  <div className="text-center lg:text-left">
                    <h2 className="heading-xl scroll-mt-20 xl:scroll-mt-24">
                      {dict.title}
                    </h2>
                  </div>

                  {/* Desktop: stores + subtitle */}
                  <div className="hidden lg:block">
                    <div className="h-full w-full flex flex-col gap-y-8">
                      <div className="h-full w-full flex flex-row flex-wrap gap-x-3 gap-y-3">
                        <a
                          className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={dict.appStoreAlt || "App Store"}
                            loading="lazy"
                            width={163}
                            height={48}
                            decoding="async"
                            src="https://sb.nordcdn.com/m/3bd4c58600abc36b/original/app-store.svg"
                            style={{ color: "transparent" }}
                          />
                        </a>
                        <a
                          className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={dict.googlePlayAlt || "Google Play"}
                            loading="lazy"
                            width={163}
                            height={48}
                            decoding="async"
                            src="https://sb.nordcdn.com/m/61c12f9617ed35b4/original/google-play.svg"
                            style={{ color: "transparent" }}
                          />
                        </a>
                      </div>

                      <div>
                        <p className="scroll-mt-20 xl:scroll-mt-24">
                          {dict.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile/Tablet: stores only */}
                  <div className="block lg:hidden">
                    <div className="h-full w-full flex flex-row justify-center gap-x-3">
                      <a
                        className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={dict.appStoreAlt || "App Store"}
                          loading="lazy"
                          width={163}
                          height={48}
                          decoding="async"
                          src="https://sb.nordcdn.com/m/3bd4c58600abc36b/original/app-store.svg"
                          style={{ color: "transparent" }}
                        />
                      </a>
                      <a
                        className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt={dict.googlePlayAlt || "Google Play"}
                          loading="lazy"
                          width={163}
                          height={48}
                          decoding="async"
                          src="https://sb.nordcdn.com/m/61c12f9617ed35b4/original/google-play.svg"
                          style={{ color: "transparent" }}
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-1">
                <div className="mx-auto flex items-end lg:items-center">
                  <div className="hidden lg:block">
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={dict.qrAlt}
                        loading="lazy"
                        width={430}
                        height={430}
                        decoding="async"
                        src="https://sb.nordcdn.com/m/5f88d37e18fa2128/original/download-app-qr.png"
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
