import Image from "next/image";
import Link from "next/link";
import { localizedHref } from "@/lib/route-mapping";

interface WhatIsEsimProps {
  dict: Record<string, any>;
  lang?: string;
}

export function WhatIsEsim({ dict, lang = "en" }: WhatIsEsimProps) {
  return (
    <div
      data-section="WhatIsEsim"
      data-testid="section-WhatIsEsim"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="mx-auto">
              <div className="mx-auto container">
                <div className="grid sm:gap-x-16 gap-y-8 grid-cols-1 md:grid-cols-2">
                  <div className="h-full flex flex-col justify-center gap-y-4">
                    <div className="h-full w-full flex [&>div:empty]:hidden flex-col justify-center gap-y-4">
                      <div>
                        <div className="h-full w-full flex [&>div:empty]:hidden flex-col justify-start gap-y-6">
                          <div>
                            <h2 className="heading-xl text-primary scroll-mt-20 xl:scroll-mt-24">
                              {dict.title}
                            </h2>
                          </div>
                          <div>
                            <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
                              {dict.descriptionBefore}
                              <Link
                                className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus underline"
                                href={localizedHref(lang || "en", "what-is-esim")}
                              >
                                {dict.linkText}
                              </Link>
                              {dict.descriptionAfter}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:row-start-1">
                    <div>
                      <Image
                        alt={dict.imageAlt || "An eSIM card with an active data plan."}
                        loading="lazy"
                        width={555}
                        height={200}
                        decoding="async"
                        src="https://sb.nordcdn.com/m/4b32c41c87b8ff4f/original/homepage-what-is-esim.png"
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
