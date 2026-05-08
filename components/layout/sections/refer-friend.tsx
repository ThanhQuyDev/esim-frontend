import Image from "next/image";

interface ReferFriendBannerProps {
  dict: Record<string, any>;
}

export function ReferFriendBanner({ dict }: ReferFriendBannerProps) {
  return (
    <div
      data-section="ReferFriendBanner"
      data-testid="section-ReferFriendBanner"
      className="relative scroll-mt-20 xl:scroll-mt-24 group/section"
    >
      <div className="absolute top-0 group-first/section:-top-24 bottom-0 w-full">
        <div className="background w-full h-full bg-white"></div>
      </div>
      <div className="relative">
        <div className="py-16">
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              <div className="flex lg:flex-row flex-col rounded-sm md:rounded-md lg:rounded-lg h-full overflow-hidden bg-blue-100">
                <div className="flex-1 flex items-center">
                  <div className="md:p-16 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                    <div className="text-center lg:text-left">
                      <h2 className="heading-lg scroll-mt-20 xl:scroll-mt-24">
                        {dict.title}
                      </h2>
                    </div>
                    <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
                      {dict.description}
                    </p>
                    <div>
                      <a
                        role="button"
                        className="max-md:w-full text-center inline-block text-primary pointer-fine:hover:bg-brand-black pointer-fine:hover:text-primary-on-color border-md border-black active:bg-brand-black active:text-primary-on-color box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
                        href="/refer-a-friend/"
                        aria-label={`Learn more about ${dict.title}`}
                      >
                        {dict.cta}
                        <span className="sr-only"> about {dict.title}</span>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1">
                  <div className="mx-auto flex items-end lg:items-center">
                    <div>
                      {/* Mobile/Tablet < lg */}
                      <div className="block lg:hidden">
                        <Image
                          alt={dict.imageAlt}
                          src="https://sb.nordcdn.com/m/679dd975658e23c5/original/refer-a-friend-xs.png"
                          width={800}
                          height={414}
                          loading="lazy"
                          style={{ color: "transparent" }}
                        />
                      </div>
                      {/* Desktop lg+ */}
                      <div className="hidden lg:block">
                        <Image
                          alt={dict.imageAlt}
                          src="https://sb.nordcdn.com/m/21d0b978993f51f3/original/refer-a-friend-xl.png"
                          width={700}
                          height={800}
                          loading="lazy"
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
  );
}
