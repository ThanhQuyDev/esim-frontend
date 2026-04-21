interface ReviewFeaturesProps {
  dict: Record<string, any>;
  lang: string;
}

function WalletIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="lg:w-8 lg:h-8 w-6 h-6 text-primary">
      <path d="M464 48H64C28.7 48 0 76.7 0 112v288c0 35.3 28.7 64 64 64h400c26.5 0 48-21.5 48-48V96c0-26.5-21.5-48-48-48zm16 368c0 8.8-7.2 16-16 16H64c-17.6 0-32-14.4-32-32V112c0-17.6 14.4-32 32-32h400c8.8 0 16 7.2 16 16v320zm-64-208c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm0 32c0 0 0 0 0 0z"/>
    </svg>
  );
}

function CirclePlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="lg:w-8 lg:h-8 w-6 h-6 text-primary">
      <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm0 384c-97 0-176-79-176-176S159 80 256 80s176 79 176 176-79 176-176 176zm96-192h-80v-80c0-8.8-7.2-16-16-16s-16 7.2-16 16v80h-80c-8.8 0-16 7.2-16 16s7.2 16 16 16h80v80c0 8.8 7.2 16 16 16s16-7.2 16-16v-80h80c8.8 0 16-7.2 16-16s-7.2-16-16-16z"/>
    </svg>
  );
}

function SimCardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" className="lg:w-8 lg:h-8 w-6 h-6 text-primary">
      <path d="M336 0H176L0 176v272c0 35.3 28.7 64 64 64h272c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64zm32 448c0 17.6-14.4 32-32 32H64c-17.6 0-32-14.4-32-32V187.3L180.7 32H336c17.6 0 32 14.4 32 32v384zM160 256h-32c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm96 0h-32c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm-96 96h-32c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm96 0h-32c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16z"/>
    </svg>
  );
}

function ChatSupportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" className="lg:w-8 lg:h-8 w-6 h-6 text-primary">
      <path d="M208 0C93.1 0 0 78.8 0 176c0 39.6 15.3 76.2 41.1 106.6L1.3 370.5c-3.4 7.5-.1 16.3 7.4 19.8 2 .9 4.1 1.3 6.2 1.3 5.7 0 11.1-3.1 13.9-8.5l44.5-98.7C107.5 306.2 155.8 320 208 320c114.9 0 208-78.8 208-176S322.9 0 208 0zm0 288c-46.5 0-89.8-12.2-121.8-32.4-5.8-3.7-13.2-3.5-18.8.5L32 304l24.5-54.2c2.7-6 1.2-13.1-3.7-17.5C27.7 210.7 32 192.5 32 176c0-79.4 78.8-144 176-144s176 64.6 176 144-78.8 144-176 144zm384-80c0-62.8-53.6-114.4-125.3-131.8 2.2 10.4 3.3 21.2 3.3 32.2 0 114.4-114.9 207.6-256.3 207.6H208c-5.5 0-10.9-.2-16.3-.5C222.5 372.8 288.3 416 368 416c38.8 0 74.8-10.4 105.3-28.2l35.5 78.7c2.8 5.4 8.2 8.5 13.9 8.5 2.1 0 4.2-.4 6.2-1.3 7.5-3.5 10.8-12.3 7.4-19.8l-29.8-66.1C537.3 358.6 592 310.4 592 208z"/>
    </svg>
  );
}

const featureIcons = [WalletIcon, CirclePlusIcon, SimCardIcon, ChatSupportIcon];

const defaultFeatures = [
  {
    title: "Affordable plans",
    description: "You can choose from hundreds of plans in over 200 countries — all at some of the best prices on the market. With esim.vn eSIMs, you can save every time, wherever you travel."
  },
  {
    title: "eSIM top-ups",
    description: "If your eSIM expires, don\u2019t buy a new one. With esim.vn, top up your account and use the same eSIM. If your plan hasn\u2019t expired yet, the data will be added automatically once the current plan expires."
  },
  {
    title: "One eSIM for all countries",
    description: "esim.vn makes eSIM management easier and saves you more time. Instead of getting a new eSIM every time you travel, you can use the same esim.vn eSIM for any country."
  },
  {
    title: "24/7 chat support",
    description: "esim.vn\u2019s team is always ready to answer your questions. Check out the FAQ and the Help Center to find an answer, or contact esim.vn\u2019s support via email or live chat to get help."
  }
];

export function ReviewFeatures({ dict, lang }: ReviewFeaturesProps) {
  const features = dict.items || defaultFeatures;

  return (
    <div data-section="Features" data-testid="section-Features" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="heading-xl text-primary scroll-mt-20 xl:scroll-mt-24">
                  {dict.title || "Reasons to buy a esim.vn eSIM card"}
                </h2>
                <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
                  {dict.description || "eSIMs can save you money and time when you\u2019re traveling. With a esim.vn eSIM, it becomes even easier."}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            {/* Desktop grid */}
            <div className="sm:gap-x-8 md:grid-cols-2 grid-cols-1 gap-y-8 hidden md:grid">
              {features.map((feature: any, index: number) => {
                const IconComponent = featureIcons[index] || WalletIcon;
                return (
                  <div key={index}>
                    <div className="h-full w-full flex [&>div:empty]:hidden flex-col justify-start gap-y-4">
                      <div>
                        <div className="h-full w-full flex [&>div:empty]:hidden flex-col text-start items-start justify-start gap-y-6">
                          <div><IconComponent /></div>
                          <div>
                            <h3 className="body-lg-medium text-primary scroll-mt-20 xl:scroll-mt-24">{feature.title}</h3>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile swiper */}
            <div className="md:hidden max-sm:-mx-4 max-sm:px-4 overflow-hidden">
              <div className="swiper swiper-initialized swiper-horizontal overflow-visible!">
                <div className="swiper-wrapper">
                  {features.map((feature: any, index: number) => {
                    const IconComponent = featureIcons[index] || WalletIcon;
                    const slideClass = index === 0
                      ? "swiper-slide swiper-slide-active"
                      : index === 1
                        ? "swiper-slide swiper-slide-next"
                        : "swiper-slide";
                    return (
                      <div
                        key={index}
                        className={`${slideClass} h-auto! max-w-[87%] min-[480px]:max-w-[71%] sm:max-w-[62%] mr-4`}
                        style={{ marginRight: "16px" }}
                      >
                        <div className="h-full w-full flex [&>div:empty]:hidden flex-col justify-start gap-y-4">
                          <div>
                            <div className="h-full w-full flex [&>div:empty]:hidden flex-col text-start items-start justify-start gap-y-6">
                              <div><IconComponent /></div>
                              <div>
                                <p className="body-lg-medium text-primary scroll-mt-20 xl:scroll-mt-24" role="heading" aria-level={3}>{feature.title}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end gap-4 items-center mt-8">
                  <button className="max-md:w-full cursor-not-allowed border-md border-tertiary text-disabled box-border touch-manipulation align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus inline-flex gap-2 text-start body-md-medium rounded-full p-0 h-12! w-12! justify-center items-center" disabled data-testid="swiper-prev-button">
                    <span className="flex items-center shrink-0">
                      <span className="flex items-center h-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-6 h-6">
                          <path d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"/>
                        </svg>
                      </span>&#8204;
                    </span>
                  </button>
                  <button className="max-md:w-full text-primary pointer-fine:hover:text-primary-on-color pointer-fine:hover:bg-dark border-md border-tertiary active:bg-dark! active:text-primary-on-color! box-border touch-manipulation align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus inline-flex gap-2 text-start body-md-medium rounded-full p-0 h-12! w-12! justify-center items-center" data-testid="swiper-next-button">
                    <span className="flex items-center shrink-0">
                      <span className="flex items-center h-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-6 h-6">
                          <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"/>
                        </svg>
                      </span>&#8204;
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
