"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { Quote } from "lucide-react";

interface AboutCrewProps {
  dict: Record<string, any>;
}

const crewImages = [
  "https://sb.nordcdn.com/m/5a3fba689153f9d4/original/about-us-voices-of-saily-vykintas.png",
  "https://sb.nordcdn.com/m/108f4f7d954bec87/original/about-us-voices-of-saily-matas.png",
  "https://sb.nordcdn.com/m/33e8884daf33e459/original/about-us-voices-of-saily-neringa.png",
];

export function AboutCrew({ dict }: AboutCrewProps) {
  return (
    <section data-section="SailyCrew" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div>
        <div className="relative w-full max-w-[1600px] mx-auto">
          {/* Dark wave backgrounds */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" loading="lazy" width={320} height={471} className="absolute md:hidden w-full mt-16" src="https://sb.nordcdn.com/m/642c93fcc4433f74/original/two-sections-wave-xs-dark.svg" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" loading="lazy" width={768} height={650} className="absolute hidden md:block lg:hidden w-full mt-16" src="https://sb.nordcdn.com/m/82fbca0f2d5076b/original/two-sections-wave-md-dark.svg" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" loading="lazy" width={1000} height={734} className="absolute hidden lg:block xl:hidden w-full mt-16" src="https://sb.nordcdn.com/m/1f823717fd6dae6f/original/two-sections-wave-lg-dark.svg" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" loading="lazy" width={1400} height={937} className="absolute hidden xl:block w-full mt-16" src="https://sb.nordcdn.com/m/1b7fd84e2cf2a366/original/two-sections-wave-xl-dark.svg" />

          <div className="relative py-16">
            {/* Header */}
            <div className="mx-4 sm:mx-auto">
              <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
                <div className="col-span-12 md:col-span-8">
                  <div className="grid grid-cols-1 gap-y-6">
                    <h2 className="heading-xl text-text-primary-on-color">
                      {dict.title}
                    </h2>
                    <p className="body-md text-secondary-on-color">
                      {dict.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Crew Swiper */}
            <div className="mx-4 sm:mx-auto">
              <div className="container mx-auto">
                <Swiper
                  modules={[Pagination, Autoplay]}
                  slidesPerView={1}
                  spaceBetween={24}
                  loop
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  pagination={{
                    clickable: true,
                    el: ".crew-pagination",
                    bulletClass: "block rounded-full transition-all bg-neutral-700 hover:bg-bg-secondary w-3 h-3 cursor-pointer",
                    bulletActiveClass: "!px-4 !bg-bg-secondary",
                  }}
                >
                  {dict.members.map((member: any, i: number) => (
                    <SwiperSlide key={i} className="!h-auto">
                      <div className="flex max-md:flex-col items-center gap-8 lg:gap-12 rounded-lg p-6 lg:p-12 border border-[rgba(255,255,255,0.32)] text-text-primary-on-color backdrop-blur-[45px]">
                        {/* Quote */}
                        <div className="flex flex-col md:flex-row gap-3">
                          <div className="w-6 h-6 md:w-16 md:h-16 flex items-center justify-center shrink-0">
                            <Quote className="md:w-12 md:h-12 w-4 h-4 text-[#4D4E56]" />
                          </div>
                          <p className="body-md-medium md:body-lg-medium">
                            {member.quote}
                          </p>
                        </div>
                        {/* Photo + name */}
                        <div className="flex shrink-0 flex-col gap-6">
                          <div className="rounded-md overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt={member.name}
                              loading="lazy"
                              width={300}
                              height={300}
                              src={crewImages[i]}
                              className="w-[300px] h-[300px] object-cover"
                            />
                          </div>
                          <footer className="flex flex-col gap-1">
                            <p className="body-md-medium not-italic">{member.name}</p>
                            <p className="body-sm text-secondary-on-color">
                              {member.role}
                            </p>
                          </footer>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <div className="crew-pagination flex gap-3 mt-8 justify-center" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section >
  );
}
