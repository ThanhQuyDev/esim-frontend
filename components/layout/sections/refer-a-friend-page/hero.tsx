import { Check } from "lucide-react";

interface ReferHeroProps {
  dict: Record<string, any>;
}

export function ReferHero({ dict }: ReferHeroProps) {
  const perks: string[] = dict.perks ?? [];

  return (
    <div
      data-section="hero"
      data-testid="section-hero"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16 overflow-hidden">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="grid sm:gap-x-8 md:grid-cols-2 grid-cols-1 gap-y-8 xl:gap-x-16">
              <div>
                <div className="h-full flex flex-col justify-center gap-y-6">
                  <div className="flex flex-col gap-y-4">
                    <div>
                      <p className="body-md-medium text-tertiary scroll-mt-20 xl:scroll-mt-24">
                        {dict.badge}
                      </p>
                    </div>
                    <h1 className="heading-2xl text-primary scroll-mt-20 xl:scroll-mt-24">
                      {dict.title}
                    </h1>
                  </div>

                  <p className="body-md text-primary scroll-mt-20 xl:scroll-mt-24">
                    {dict.description}
                  </p>

                  <div className="flex flex-col gap-y-6">
                    <ul className="flex flex-col list-inside gap-0 body-md">
                      {perks.map((perk, i) => (
                        <li key={i} className="flex text-primary">
                          <span className="ltr:mr-2 rtl:ml-2 flex items-center justify-center flex-shrink-0 w-6 h-6">
                            <Check className="w-4 h-4" />
                          </span>
                          <p className="scroll-mt-20 xl:scroll-mt-24">{perk}</p>
                        </li>
                      ))}
                    </ul>

                    <div>
                      <div className="flex flex-row gap-x-4">
                        <a
                          className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
                          rel="noopener noreferrer nofollow"
                          target="_blank"
                          href="https://saily.onelink.me/ymzx/appstore"
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
                          rel="noopener noreferrer nofollow"
                          target="_blank"
                          href="https://saily.onelink.me/ymzx/android"
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

                    <div>
                      <p className="body-xs text-secondary scroll-mt-20 xl:scroll-mt-24">
                        {dict.termsPrefix}
                        <a
                          className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus underline"
                          rel="noopener noreferrer nofollow"
                          target="_blank"
                          href={dict.termsHref || "/legal/refer-a-friend-campaign/"}
                        >
                          {dict.termsLink}
                        </a>
                        {dict.termsSuffix}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-center">
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={dict.imageAlt}
                      loading="lazy"
                      width={555}
                      height={555}
                      decoding="async"
                      src="https://sb.nordcdn.com/asset/f516430e-8144-4f46-b7cd-c9a0358ea6f1/referral-program-hero-asset.png"
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
  );
}
