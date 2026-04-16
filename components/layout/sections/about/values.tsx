"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { Globe, Lightbulb, Heart, Sprout, Brain, Rocket } from "lucide-react";

interface AboutValuesProps {
  dict: Record<string, any>;
}

const valueIcons = [Globe, Lightbulb, Heart, Sprout, Brain, Rocket];

export function AboutValues({ dict }: AboutValuesProps) {
  return (
    <section
      data-section="Values"
      className="relative scroll-mt-20 xl:scroll-mt-24 group/section"
    >
      <div className="absolute top-0 group-first/section:-top-24 bottom-0 w-full">
        <div className="w-full h-full bg-bg-dark" />
      </div>
      <div className="relative">
        <div className="py-16">
          {/* Header */}
          <div className="mx-4 sm:mx-auto">
            <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
              <div className="col-span-12 md:col-span-8">
                <div className="grid grid-cols-1 gap-y-6">
                  <h2 className="heading-xl text-text-primary-on-color">
                    {dict.title}
                  </h2>
                  <p className="body-md text-text-secondary-on-color">
                    {dict.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              {/* Desktop: 3-col grid */}
              <div className="sm:gap-x-8 md:grid-cols-3 grid-cols-1 gap-y-8 hidden md:grid">
                {dict.items.map((item: any, i: number) => {
                  const Icon = valueIcons[i] || Globe;
                  return (
                    <div key={i}>
                      <div className="h-full w-full flex flex-col justify-start gap-y-4">
                        <div className="flex flex-col text-start items-start justify-start gap-y-6">
                          <Icon className="lg:w-8 lg:h-8 w-6 h-6 text-accent" />
                          <p className="body-lg-medium text-text-primary-on-color">
                            {item.title}
                          </p>
                        </div>
                        <p className="body-md text-text-secondary-on-color">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile: Swiper */}
              <div className="md:hidden max-sm:-mx-4 max-sm:px-4 overflow-hidden">
                <Swiper
                  modules={[FreeMode]}
                  slidesPerView="auto"
                  spaceBetween={16}
                  className="overflow-visible!"
                >
                  {dict.items.map((item: any, i: number) => {
                    const Icon = valueIcons[i] || Globe;
                    return (
                      <SwiperSlide
                        key={i}
                        className="!h-auto !max-w-[87%] min-[480px]:!max-w-[71%] sm:!max-w-[62%]"
                      >
                        <div className="h-full w-full flex flex-col justify-start gap-y-4">
                          <div className="flex flex-col text-start items-start justify-start gap-y-6">
                            <Icon className="lg:w-8 lg:h-8 w-6 h-6 text-accent" />
                            <p className="body-lg-medium text-text-primary-on-color">
                              {item.title}
                            </p>
                          </div>
                          <p className="body-md text-text-secondary-on-color">
                            {item.description}
                          </p>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
