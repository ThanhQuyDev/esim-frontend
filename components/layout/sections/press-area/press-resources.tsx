import type { PressAreaDict } from "./translations";

interface PressResourcesProps {
  dict: PressAreaDict["pressResources"];
}

export function PressResources({ dict }: PressResourcesProps) {
  return (
    <div data-section="PressResources" data-testid="section-PressResources" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="flex flex-col gap-y-8">
              <div className="flex flex-col items-center gap-y-4">
                <h2 className="heading-xl scroll-mt-20 xl:scroll-mt-24">{dict.title}</h2>
              </div>
              <div className="grid sm:gap-x-8 md:grid-cols-2 grid-cols-1 gap-y-8">
                {/* Contact Us */}
                <div>
                  <div className="flex flex-col rounded-[var(--radius-sm)] md:rounded-[var(--radius-md)] lg:rounded-[var(--radius-lg)] h-full overflow-hidden" style={{ backgroundColor: "#EEF1F6" }}>
                    <div className="flex-1">
                      <div className="md:p-10 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                        <i className="text-center w-[1em] fa-message-dots fa-sharp fa-regular lg:text-[48px] text-[32px]" />
                        <div className="text-center lg:text-left">
                          <p className="heading-lg text-start scroll-mt-20 xl:scroll-mt-24">{dict.contactTitle}</p>
                        </div>
                        <p className="body-md text-text-secondary scroll-mt-20 xl:scroll-mt-24">
                          {dict.contactDesc.split("press@saily.com")[0]}
                          <a className="underline" href="mailto:press@saily.com">press@saily.com</a>
                          {dict.contactDesc.split("press@saily.com")[1]}
                        </p>
                        <a
                          role="button"
                          className="max-md:w-full text-center inline-block text-text-primary hover:text-white hover:bg-[var(--bg-dark)] border border-border-secondary active:bg-[var(--bg-dark)] active:text-white box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
                          href="mailto:press@saily.com"
                        >
                          {dict.emailUs}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Media Assets */}
                <div>
                  <div className="flex flex-col rounded-[var(--radius-sm)] md:rounded-[var(--radius-md)] lg:rounded-[var(--radius-lg)] h-full overflow-hidden" style={{ backgroundColor: "#EEF1F6" }}>
                    <div className="flex-1">
                      <div className="md:p-10 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                        <div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt="press area media asset saily icon" loading="lazy" width={48} height={48} decoding="async" style={{ color: "transparent" }} src="https://sb.nordcdn.com/m/bff76223fbf9b2ef/original/press-area-media-asset-saily-icon.svg" />
                        </div>
                        <div className="text-center lg:text-left">
                          <p className="heading-lg text-start scroll-mt-20 xl:scroll-mt-24">{dict.mediaTitle}</p>
                        </div>
                        <p className="body-md text-text-secondary scroll-mt-20 xl:scroll-mt-24">{dict.mediaDesc}</p>
                        <a
                          role="button"
                          className="max-md:w-full text-center inline-block text-text-primary hover:text-white hover:bg-[var(--bg-dark)] border border-border-secondary active:bg-[var(--bg-dark)] active:text-white box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
                           
                          target="_blank"
                          href="https://zeroheight.com/5c8b55fba/p/90ce90-who-we-are"
                        >
                          {dict.downloadAssets}
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
