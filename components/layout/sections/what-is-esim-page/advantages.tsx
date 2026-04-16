"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { Wallet, Users, ListChecks, Smartphone, ShieldCheck, Recycle } from "lucide-react";

interface EsimAdvantagesProps {
  dict: Record<string, any>;
}

const advantageIcons = [Wallet, Users, ListChecks, Smartphone, ShieldCheck, Recycle];

export function EsimAdvantages({ dict }: EsimAdvantagesProps) {
  const [activeTab, setActiveTab] = useState(0);
  const tabLabels = [dict.advantagesLabel, dict.disadvantagesLabel];

  return (
    <section data-section="why-use-an-esim" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            {/* Tab buttons */}
            <div className="flex gap-1 pb-4 scrollbar-none overflow-auto">
              <div className="relative flex gap-1 w-fit p-1 border border-border-secondary rounded-full">
                {tabLabels.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`relative z-[1] body-sm-medium whitespace-nowrap md:body-md-medium px-4 py-1 rounded-full transition-colors ${
                      activeTab === i
                        ? "text-text-primary-on-color bg-bg-dark"
                        : "text-text-primary hover:bg-bg-primary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advantages tab */}
            {activeTab === 0 && (
              <div className="pt-6">
                <div className="flex flex-col gap-y-4">
                  <h2 className="heading-xl text-text-primary">{dict.advantages.title}</h2>
                  <p className="text-text-secondary">{dict.advantages.subtitle}</p>

                  {/* Desktop grid */}
                  <div className="sm:gap-x-8 md:grid-cols-3 grid-cols-1 gap-y-8 hidden md:grid">
                    {dict.advantages.items.map((item: any, i: number) => {
                      const Icon = advantageIcons[i] || Wallet;
                      return (
                        <div key={i}>
                          <div className="h-full w-full flex flex-col justify-start gap-y-4">
                            <div className="flex flex-col text-start items-start justify-start gap-y-6">
                              <Icon className="lg:w-8 lg:h-8 w-6 h-6 text-text-primary" />
                              <span className="body-lg-medium text-text-primary">{item.title}</span>
                            </div>
                            <p className="body-md text-text-secondary">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile swiper */}
                  <div className="md:hidden max-sm:-mx-4 max-sm:px-4 overflow-hidden">
                    <Swiper
                      modules={[FreeMode]}
                      slidesPerView="auto"
                      spaceBetween={16}
                      className="overflow-visible!"
                    >
                      {dict.advantages.items.map((item: any, i: number) => {
                        const Icon = advantageIcons[i] || Wallet;
                        return (
                          <SwiperSlide
                            key={i}
                            className="!h-auto !max-w-[87%] min-[480px]:!max-w-[71%] sm:!max-w-[62%]"
                          >
                            <div className="h-full w-full flex flex-col justify-start gap-y-4">
                              <div className="flex flex-col text-start items-start justify-start gap-y-6">
                                <Icon className="lg:w-8 lg:h-8 w-6 h-6 text-text-primary" />
                                <p className="body-lg-medium text-text-primary">{item.title}</p>
                              </div>
                              <p className="body-md text-text-secondary">{item.description}</p>
                            </div>
                          </SwiperSlide>
                        );
                      })}
                    </Swiper>
                  </div>
                </div>
              </div>
            )}

            {/* Disadvantages tab */}
            {activeTab === 1 && (
              <div className="pt-6">
                <div className="flex flex-col gap-y-10">
                  <div className="flex flex-col gap-y-6">
                    <h2 className="heading-xl text-text-primary">{dict.disadvantages.title}</h2>
                    <p className="text-text-secondary">{dict.disadvantages.subtitle}</p>
                  </div>
                  <ul className="flex flex-col list-inside gap-2 body-md">
                    {dict.disadvantages.items.map((item: string, i: number) => (
                      <li key={i} className="flex text-text-primary">
                        <span className="whitespace-nowrap mr-2 mt-1">
                          <span className="block w-4 h-4 bg-clip-content border-[5px] border-solid border-transparent rounded-full bg-current" />
                        </span>
                        <p className="body-md text-text-primary">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
