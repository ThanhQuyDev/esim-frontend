"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface AboutTimelineProps {
  dict: Record<string, any>;
}

const timelineImages = [
  "https://res.cloudinary.com/deqfcfcwf/image/upload/v1782062661/about-us-timeline-step-1_okfxik.svg",
  "https://sb.nordcdn.com/m/5d0a526e01f5d1e6/original/about-us-timeline-step-2.svg",
  "https://sb.nordcdn.com/m/3a52b19ab728cf16/original/about-us-timeline-step-3.svg",
  "https://sb.nordcdn.com/m/319134988244ae10/original/about-us-timeline-step-4.svg",
  "https://sb.nordcdn.com/m/3d6cc88efb8c9575/original/about-us-timeline-step-5.svg",
];

export function AboutTimeline({ dict }: AboutTimelineProps) {
  return (
    <section data-section="SailyTale" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        {/* Header */}
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="heading-xl">{dict.title}</h2>
                <p className="body-md text-text-secondary">{dict.subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Swiper */}
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="max-sm:-mx-4 max-sm:px-4 -ml-5 pl-5 overflow-hidden">
              <Swiper
                modules={[Navigation]}
                slidesPerView="auto"
                spaceBetween={24}
                navigation={{
                  nextEl: ".button-next",
                  prevEl: ".button-previous",
                }}
                className="overflow-visible! ml-[-20px] pl-[20px]"
              >
                {dict.milestones.map((milestone: any, i: number) => (
                  <SwiperSlide
                    key={i}
                    className="!h-auto sm:!max-w-[372px] md:!max-w-[269px] lg:!max-w-[274px] xl:!max-w-[300px]"
                  >
                    <div className="flex flex-col h-full group/timeline-slide">
                      {/* Card */}
                      <div className="h-full relative mb-7 bg-primary rounded-sm shadow-[0px_8px_24px_0px_rgba(149,157,165,0.20)]">
                        <div className="rounded-t-md overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={milestone.title}
                            loading="lazy"
                            width={480}
                            height={224}
                            src={timelineImages[i]}
                            className="w-full"
                          />
                        </div>
                        <div className="flex flex-col gap-3 p-6">
                          <p className="body-lg-medium">{milestone.title}</p>
                          <p className="body-md text-text-secondary">
                            {milestone.description}
                          </p>
                        </div>
                        {/* Triangle pointer */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[16px] border-t-white" />
                      </div>

                      {/* Date */}
                      <p className="body-md-medium text-center">{milestone.date}</p>

                      {/* Timeline dot + line */}
                      <div className="flex justify-center mt-3 relative">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="6" fill="white" stroke="black" strokeWidth="4" />
                        </svg>
                        <div className="absolute w-[calc(100%+24px)] first:left-0 border-b border-border-secondary -z-10 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Nav buttons — outside overflow-hidden div, Swiper Navigation auto-disables at begin/end */}
            <div className="flex justify-end gap-4 items-center mt-10">
              <button
                className="button-previous border border-border-tertiary rounded-full p-0 h-12 w-12 flex justify-center items-center disabled:text-text-disabled disabled:cursor-not-allowed text-text-primary hover:bg-bg-tertiary transition-colors"
                aria-label="Previous"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                className="button-next border border-border-tertiary rounded-full p-0 h-12 w-12 flex justify-center items-center disabled:text-text-disabled disabled:cursor-not-allowed text-text-primary sm:hover:bg-bg-dark sm:hover:text-text-primary-on-color transition-colors"
                aria-label="Next"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
