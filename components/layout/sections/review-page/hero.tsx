interface ReviewHeroProps {
  dict: Record<string, any>;
  lang: string;
}

export function ReviewHero({ dict, lang }: ReviewHeroProps) {
  return (
    <div data-section="Hero" data-testid="section-Hero" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16 overflow-hidden">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="grid sm:gap-x-8 md:grid-cols-2 grid-cols-1 gap-y-8 xl:gap-x-16">
              <div>
                <div className="h-full flex flex-col justify-center gap-y-6">
                  <div className="list flex flex-col gap-y-4">
                    <h1 className="heading-2xl scroll-mt-20 xl:scroll-mt-24">
                      {dict.title || "esim.vn review and rating: Should you get it?"}
                    </h1>
                  </div>
                  <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
                    {dict.subtitle || "An affordable eSIM service from the creators of esim.vn"}
                  </p>
                  <div>
                    <a
                      role="button"
                      className="max-md:w-full text-center inline-block text-primary bg-accent pointer-fine:hover:bg-accent-hover border-md border-bg-accent-hover hover:bg-accent-hover active:bg-accent-active! active:border-accent-active! box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
                      data-ga-slug="View All Plans"
                      href={`/${lang}/destination`}
                    >
                      {dict.cta || "View All Plans"}
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-center">
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={dict.imageAlt || "A happy woman lies on the beach after posting a esim.vn review."}
                      loading="eager"
                      width={555}
                      height={555}
                      decoding="async"
                      style={{ color: "transparent" }}
                      src={dict.imageUrl || "https://res.cloudinary.com/deqfcfcwf/image/upload/v1782062668/woman-stars-reviews-rating_bnej4h.png"}
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
