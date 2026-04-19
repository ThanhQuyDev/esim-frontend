import { Info } from "lucide-react";

interface CouponFreeCreditsProps {
  dict: Record<string, any>;
  lang: string;
}

export function CouponFreeCredits({ dict, lang }: CouponFreeCreditsProps) {
  return (
    <div data-section="FreeCredits" data-testid="section-FreeCredits" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="mx-auto">
              <div className="mx-auto container">
                <div className="grid sm:gap-x-16 gap-y-8 grid-cols-1 md:grid-cols-2">
                  <div className="h-full flex flex-col justify-center gap-y-4">
                    <div className="h-full w-full flex flex-col justify-center gap-y-4">
                      <div>
                        <div className="h-full w-full flex flex-col justify-start gap-y-6">
                          <div>
                            <h2 className="heading-xl text-primary scroll-mt-20 xl:scroll-mt-24">
                              {dict.title || "Earn free Esim.vn credit"}
                            </h2>
                          </div>
                          <div>
                            <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
                              {dict.description || "Invite your friends and family to try Esim.vn and earn US$5 worth of Esim.vn credits for every successful referral."}
                            </p>
                          </div>
                          <div>
                            <div className="body-md text-secondary">
                              <div className="h-full w-full flex flex-col gap-y-6">
                                <div>
                                  <a
                                    role="button"
                                    className="max-md:w-full text-center inline-block text-primary bg-accent pointer-fine:hover:bg-accent-hover border-md border-accent pointer-fine:hover:border-accent-hover active:bg-accent-active! active:border-accent-active! box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
                                    href={`/${lang}/refer-a-friend`}
                                  >
                                    {dict.cta || "Learn more"}
                                  </a>
                                </div>
                                <div>
                                  <div className="h-full w-full flex flex-row items-center gap-x-2">
                                    <div>
                                      <Info className="w-4 h-4 text-secondary" />
                                    </div>
                                    <div>
                                      <p className="body-xs text-secondary scroll-mt-20 xl:scroll-mt-24">
                                        {dict.disclaimer || "For more information, check out the"}{" "}
                                        <a
                                          className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus underline"
                                          rel="noopener noreferrer nofollow"
                                          target="_blank"
                                          href="/legal/referral-program-terms-and-conditions/"
                                        >
                                          {dict.disclaimerLink || "terms and conditions"}
                                        </a>{" "}
                                        {dict.disclaimerSuffix || "page of this referral program."}
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
                  <div className="md:row-start-1">
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={dict.imageAlt || "Young people enjoy the sun after referring a friend to Esim.vn"}
                        loading="lazy"
                        width={555}
                        height={555}
                        decoding="async"
                        style={{ color: "transparent" }}
                        src="https://sb.nordcdn.com/m/72c05c36bb93b1cf/original/friends-referral-program-sky-money.png"
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
