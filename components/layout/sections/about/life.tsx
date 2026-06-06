"use client";

import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ArrowLeft, ArrowRight, GraduationCap, Scale, Sprout, Compass, Microscope } from "lucide-react";

interface AboutLifeProps {
  dict: Record<string, any>;
}

const lifeIcons = [GraduationCap, Scale, Sprout, Compass, Microscope];

const lifeImages = [
  "https://sb.nordcdn.com/m/713ed1bf421f8b2/original/about-us-life-at-saily-1.png",
  "https://sb.nordcdn.com/m/7ea380c1b9a549a/original/about-us-life-at-saily-2.png",
  "https://sb.nordcdn.com/m/290b710c37296382/original/about-us-life-at-saily-3.png",
  "https://sb.nordcdn.com/m/5ea489d3dbb04d5/original/about-us-life-at-saily-4.png",
  "https://sb.nordcdn.com/m/26844073be68c91c/original/about-us-life-at-saily-5.png",
];

export function AboutLife({ dict }: AboutLifeProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  return (
    <section data-section="SailyLife" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <Swiper
              modules={[FreeMode, Navigation]}
              slidesPerView="auto"
              spaceBetween={24}
              freeMode
              onSwiper={(s) => (swiperRef.current = s)}
              onSlideChange={(s) => {
                setIsBeginning(s.isBeginning);
                setIsEnd(s.isEnd);
              }}
              className="overflow-visible overflow-y-visible"
            >
              {/* First slide: title + first perk */}
              <SwiperSlide className="!h-auto !w-auto group/gallery-slide">
                <div className="flex flex-col gap-6 w-[400px] h-full">
                  <div className="flex items-center min-h-[140px] text-text-primary-on-color">
                    <h2 className="heading-xl text-text-primary-on-color">
                      {dict.title}
                    </h2>
                  </div>
                  <div className="flex items-center flex-1 p-6 border border-[rgba(255,255,255,0.32)] rounded-lg">
                    <div className="h-full w-full flex flex-col justify-center gap-y-4">
                      <div className="flex flex-row gap-x-3">
                        <GraduationCap className="w-6 h-6 text-[#fff500] shrink-0" />
                        <p className="body-lg-medium text-text-primary-on-color">
                          {dict.perks[0].title}
                        </p>
                      </div>
                      <p className="body-md text-secondary-on-color">
                        {dict.perks[0].description}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={dict.perks[0].imageAlt}
                        loading="lazy"
                        width={400}
                        height={168}
                        src={lifeImages[0]}
                        className="w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>

              {/* Remaining slides */}
              {dict.perks.slice(1).map((perk: any, i: number) => {
                const Icon = lifeIcons[i + 1] || Compass;
                const isEven = i % 2 === 0;
                return (
                  <SwiperSlide key={i + 1} className="!h-auto !w-auto group/gallery-slide">
                    <div className="flex flex-col gap-6 w-[400px] h-full">
                      <div className={`flex items-center flex-1 p-6 border border-[rgba(255,255,255,0.32)] rounded-lg ${isEven ? "order-last" : ""}`}>
                        <div className="h-full w-full flex flex-col justify-center gap-y-4">
                          <div className="flex flex-row gap-x-3">
                            <Icon className="w-6 h-6 text-[#fff500] shrink-0" />
                            <p className="body-lg-medium text-text-primary-on-color">
                              {perk.title}
                            </p>
                          </div>
                          <p className="body-md text-secondary-on-color">
                            {perk.description}
                          </p>
                        </div>
                      </div>
                      <div className={`relative ${isEven ? "order-first" : ""}`}>
                        <div className="rounded-lg overflow-visible">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={perk.imageAlt}
                            loading="lazy"
                            width={400}
                            height={250}
                            src={lifeImages[i + 1]}
                            className="w-full object-cover rounded-lg"
                          />
                        </div>
                        {perk.title === "Work-life balance" && (
                          <div className="absolute z-10" style={{ bottom: "-60px", right: "15px" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt="about us life at saily sticker trophy"
                              loading="lazy"
                              width={80}
                              height={80}
                              src="https://sb.nordcdn.com/m/2fdf52457e4e83ac/original/about-us-life-at-saily-sticker-trophy.svg"
                              style={{ color: "transparent" }}
                            />
                          </div>
                        )}
                        {perk.title === "Autonomy and ownership" && (
                          <div className="absolute z-10" style={{ top: "-30px", right: "20px" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt="about us life at saily sticker plane"
                              loading="lazy"
                              width={80}
                              height={80}
                              src="https://sb.nordcdn.com/m/452227169e641f28/original/about-us-life-at-saily-sticker-plane.svg"
                              style={{ color: "transparent" }}
                            />
                          </div>
                        )}
                        {perk.title === "Curiosity-driven work" && (
                          <div className="absolute z-10" style={{ top: "-48px", right: "-40px" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt="about us life at saily sticker rocket"
                              loading="lazy"
                              width={80}
                              height={80}
                              src="https://sb.nordcdn.com/m/e6c1106925e87de/original/about-us-life-at-saily-sticker-rocket.svg"
                              style={{ color: "transparent" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Nav buttons */}
            <div className="flex justify-end gap-4 items-center mt-10">
              <button
                disabled={isBeginning}
                onClick={() => swiperRef.current?.slidePrev()}
                className="border border-border-tertiary rounded-full p-0 h-12 w-12 flex justify-center items-center disabled:text-text-disabled disabled:cursor-not-allowed text-text-primary-on-color sm:hover:bg-bg-secondary sm:hover:text-text-primary transition-colors"
                aria-label="Previous"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                disabled={isEnd}
                onClick={() => swiperRef.current?.slideNext()}
                className="border border-border-tertiary rounded-full p-0 h-12 w-12 flex justify-center items-center disabled:text-text-disabled disabled:cursor-not-allowed text-text-primary-on-color sm:hover:bg-bg-secondary sm:hover:text-text-primary transition-colors"
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
