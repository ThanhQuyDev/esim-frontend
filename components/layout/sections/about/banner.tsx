interface AboutBannerProps {
  dict: Record<string, any>;
}

export function AboutBanner({ dict }: AboutBannerProps) {
  return (
    <section
      data-section="Banner"
      className="relative scroll-mt-20 xl:scroll-mt-24 group/section"
    >
      {/* Background image */}
      <div className="absolute top-0 group-first/section:-top-24 bottom-0 w-full">
        <div className="relative overflow-hidden w-full h-full">
          <picture className="absolute w-full h-full" style={{ backgroundColor: "#5C8FAE" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="about us cta"
              loading="lazy"
              className="h-full w-full object-cover object-center absolute inset-0"
              src="https://sb.nordcdn.com/m/6f8964bf193e6517/original/about-us-cta-xl.jpg"
            />
          </picture>
        </div>
      </div>

      <div className="relative">
        <div className="py-16">
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              <div className="flex lg:flex-row flex-col rounded-sm md:rounded-md lg:rounded-lg h-full overflow-hidden bg-[rgba(0,0,0,0.01)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.32)]">
                <div className="flex-1 flex items-center">
                  <div className="md:p-16 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                    <div className="flex flex-col items-center gap-y-8">
                      <div className="flex flex-col items-center gap-y-4">
                        <h2 className="heading-xl text-text-primary-on-color text-center">
                          {dict.title}
                        </h2>
                        <p className="text-text-primary-on-color text-center">
                          {dict.subtitle}
                        </p>
                      </div>
                      <a
                        role="button"
                        className="max-md:w-full text-center inline-block text-text-primary bg-bg-secondary hover:bg-bg-tertiary border border-border-secondary hover:border-neutral-100 rounded-full transition-colors py-[11px] body-md-medium px-7"
                        href={dict.ctaHref}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        {dict.ctaText}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
