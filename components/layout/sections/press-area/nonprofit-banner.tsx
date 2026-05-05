import type { PressAreaDict } from "./translations";

interface NonprofitBannerProps {
  dict: PressAreaDict["banner"];
}

export function NonprofitBanner({ dict }: NonprofitBannerProps) {
  return (
    <div data-section="Banner" data-testid="section-Banner" className="relative scroll-mt-20 xl:scroll-mt-24 group/section">
      <div className="absolute top-0 bottom-0 w-full">
        <div className="relative overflow-hidden w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="footer press area cta xl" loading="lazy" decoding="async" className="h-full w-full object-cover object-center absolute inset-0" style={{ backgroundColor: "#5C8FAE" }} src="https://sb.nordcdn.com/m/48608cbefea6ae1c/original/footer-press-area-cta-xl.png" />
        </div>
      </div>
      <div className="relative">
        <div className="py-16">
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              <div className="flex lg:flex-row flex-col rounded-[var(--radius-sm)] md:rounded-[var(--radius-md)] lg:rounded-[var(--radius-lg)] h-full overflow-hidden bg-[rgba(0,0,0,0.01)] backdrop-blur-[25px] border border-[rgba(255,255,255,0.32)]">
                <div className="flex-1 flex items-center">
                  <div className="md:p-16 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                    <div className="grid sm:gap-x-8 grid-cols-12 gap-y-8">
                      <div className="col-span-12 lg:col-start-3 lg:col-span-8 flex justify-center">
                        <h2 className="heading-xl text-white text-center scroll-mt-20 xl:scroll-mt-24">{dict.title}</h2>
                      </div>
                      <div className="col-span-12 lg:col-start-3 lg:col-span-8 flex justify-center">
                        <p className="text-white text-center scroll-mt-20 xl:scroll-mt-24">
                          {dict.description.split("non-profit@saily.com")[0]}
                          <a className="underline" href="mailto:non-profit@saily.com">non-profit@saily.com</a>
                          {dict.description.split("non-profit@saily.com")[1]}
                        </p>
                      </div>
                      <div className="col-span-12 lg:col-start-3 lg:col-span-8 flex justify-center">
                        <a role="button" className="max-md:w-full text-center inline-block text-text-primary bg-bg-secondary hover:bg-bg-secondary/80 border border-border-secondary box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7" href="/blog/saily-impact/" aria-label={`Learn more about ${dict.title}`}>
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
    </div>
  );
}
