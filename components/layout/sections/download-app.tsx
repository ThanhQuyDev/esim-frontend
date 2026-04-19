import Image from "next/image";
import { Star } from "lucide-react";

interface DownloadAppSectionProps {
  dict: Record<string, any>;
}

export function DownloadAppSection({ dict }: DownloadAppSectionProps) {
  return (
    <div
      data-section="DownloadSailyApp"
      data-testid="section-DownloadSailyApp"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="mx-auto">
              <div className="mx-auto container">
                <div className="grid sm:gap-x-16 gap-y-8 grid-cols-1 md:grid-cols-2">
                  {/* Left Content */}
                  <div className="h-full flex flex-col justify-center gap-y-4">
                    <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col justify-center gap-y-4">
                      {/* Trustpilot */}
                      <div>
                        <div className="body-md-medium text-disabled">
                          <a
                            className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
                            rel="noopener noreferrer nofollow"
                            target="_blank"
                            href="https://www.trustpilot.com/review/saily.com"
                          >
                            <div className="inline-flex gap-2 items-start">
                              <div className="flex gap-2 items-baseline">
                                <p className="body-md-medium text-primary scroll-mt-20 xl:scroll-mt-24">
                                  {dict.trustpilot.label}
                                </p>
                                <p className="body-sm text-primary scroll-mt-20 xl:scroll-mt-24">
                                  {dict.trustpilot.rating} out of {dict.trustpilot.total}
                                </p>
                              </div>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                alt="Trustpilot"
                                loading="lazy"
                                width={98}
                                height={21}
                                src="https://sb.nordcdn.com/m/790e17b32e10d831/original/trustpilot-logo.svg"
                                style={{ color: "transparent" }}
                              />
                            </div>
                          </a>
                        </div>
                      </div>

                      {/* Title, Description & Store Buttons */}
                      <div>
                        <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col justify-start gap-y-6">
                          <div>
                            <h2 className="heading-xl text-primary scroll-mt-20 xl:scroll-mt-24">
                              {dict.title}
                            </h2>
                          </div>
                          <div>
                            <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
                              {dict.subtitle}
                            </p>
                          </div>
                          <div>
                            <div className="body-md text-secondary">
                              <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col gap-y-6">
                                <div>
                                  <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-row items-start gap-x-4">
                                    {/* App Store */}
                                    <div>
                                      <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col gap-y-4">
                                        <div>
                                          <a
                                            className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus app-download-link"
                                            rel="noopener noreferrer nofollow"
                                            target="_blank"
                                            href="https://saily.onelink.me/ymzx/appstore"
                                          >
                                            <div>
                                              {/* eslint-disable-next-line @next/next/no-img-element */}
                                              <img
                                                alt="app store"
                                                loading="lazy"
                                                width={163}
                                                height={48}
                                                src="https://sb.nordcdn.com/m/3bd4c58600abc36b/original/app-store.svg"
                                                style={{ color: "transparent" }}
                                              />
                                            </div>
                                          </a>
                                        </div>
                                        <div>
                                          <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col gap-y-1">
                                            <div>
                                              <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-row items-center gap-x-2">
                                                <div>
                                                  <Star className="w-4 h-4 fill-current text-primary" />
                                                </div>
                                                <div>
                                                  <p className="body-sm-medium text-primary scroll-mt-20 xl:scroll-mt-24">
                                                    {dict.appStore.rating}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                            <div>
                                              <p className="body-xs text-tertiary scroll-mt-20 xl:scroll-mt-24">
                                                {dict.appStore.reviews}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Google Play */}
                                    <div>
                                      <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col gap-y-4">
                                        <div>
                                          <a
                                            className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus app-download-link"
                                            rel="noopener noreferrer nofollow"
                                            target="_blank"
                                            href="https://saily.onelink.me/ymzx/android"
                                          >
                                            <div>
                                              {/* eslint-disable-next-line @next/next/no-img-element */}
                                              <img
                                                alt="google play"
                                                loading="lazy"
                                                width={163}
                                                height={48}
                                                src="https://sb.nordcdn.com/m/61c12f9617ed35b4/original/google-play.svg"
                                                style={{ color: "transparent" }}
                                              />
                                            </div>
                                          </a>
                                        </div>
                                        <div>
                                          <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col gap-y-1">
                                            <div>
                                              <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-row items-center gap-x-2">
                                                <div>
                                                  <Star className="w-4 h-4 fill-current text-primary" />
                                                </div>
                                                <div>
                                                  <p className="body-sm-medium text-primary scroll-mt-20 xl:scroll-mt-24">
                                                    {dict.googlePlay.rating}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                            <div>
                                              <p className="body-xs text-tertiary scroll-mt-20 xl:scroll-mt-24">
                                                {dict.googlePlay.reviews}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right - Phone Images */}
                  <div>
                    <div>
                      {/* Mobile / Tablet */}
                      <div className="block md:hidden">
                        <div>
                          <Image
                            alt="A hand holds a phone with the Esim.vn app open, showing options to manage eSIM plans, mobile data, and security features."
                            loading="lazy"
                            width={555}
                            height={555}
                            src="https://sb.nordcdn.com/m/18f01ad59d199b85/original/download-asset-xs.png"
                            style={{ color: "transparent" }}
                          />
                        </div>
                      </div>
                      {/* Desktop */}
                      <div className="hidden md:block">
                        <div>
                          <Image
                            alt="A QR code to download the Esim.vn eSIM app."
                            loading="lazy"
                            width={555}
                            height={555}
                            src="https://sb.nordcdn.com/m/2116ba3676cc8b98/original/download-asset-xl.png"
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
      </div>
    </div>
  );
}
