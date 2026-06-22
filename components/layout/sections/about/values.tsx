"use client";

import { useState, useRef, useCallback } from "react";
import { Globe, Lightbulb, Heart, Sprout, Brain, Rocket } from "lucide-react";

interface AboutValuesProps {
  dict: Record<string, any>;
}

const valueIcons = [Globe, Lightbulb, Heart, Sprout, Brain, Rocket];

export function AboutValues({ dict }: AboutValuesProps) {
  // Mobile swiper state
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const totalSlides = dict.items?.length || 0;
  const canGoPrev = currentSlide > 0;
  const canGoNext = currentSlide < totalSlides - 1;

  const scrollToSlide = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, totalSlides - 1));
    setCurrentSlide(clamped);
    if (sliderRef.current) {
      const slideWidth = sliderRef.current.offsetWidth * 0.87;
      const gap = 16;
      sliderRef.current.scrollTo({
        left: clamped * (slideWidth + gap),
        behavior: "smooth",
      });
    }
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    scrollToSlide(currentSlide - 1);
  }, [currentSlide, scrollToSlide]);

  const handleNext = useCallback(() => {
    scrollToSlide(currentSlide + 1);
  }, [currentSlide, scrollToSlide]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (diff > threshold) {
      scrollToSlide(currentSlide + 1);
    } else if (diff < -threshold) {
      scrollToSlide(currentSlide - 1);
    }
  }, [currentSlide, scrollToSlide]);

  const handleScroll = useCallback(() => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const slideWidth = container.offsetWidth * 0.87 + 16;
    const newIndex = Math.round(container.scrollLeft / slideWidth);
    if (newIndex !== currentSlide && newIndex >= 0 && newIndex < totalSlides) {
      setCurrentSlide(newIndex);
    }
  }, [currentSlide, totalSlides]);

  return (
    <section
      data-section="Values"
      className="relative scroll-mt-20 xl:scroll-mt-24 group/section"
    >
      <div className="absolute top-0 group-first/section:-top-24 bottom-0 w-full">
        <div className="w-full h-full bg-bg-dark" />
      </div>
      <div className="relative bg-black">
        <div className="py-16">
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
                          <Icon className="lg:w-[36px] lg:h-[36px] w-6 h-6 text-[#fff500]" />
                          <p className="text-xl font-medium text-text-primary-on-color">
                            {item.title}
                          </p>
                        </div>
                        <p className="body-md text-secondary-on-color">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile: Swiper */}
              <div className="md:hidden max-sm:-mx-4 max-sm:px-4 overflow-hidden">
                <div className="overflow-visible">
                  <div
                    ref={sliderRef}
                    className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none"
                    onScroll={handleScroll}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {dict.items.map((item: any, i: number) => {
                      const Icon = valueIcons[i] || Globe;
                      const isActive = i === currentSlide;
                      return (
                        <div
                          key={i}
                          className="flex-shrink-0 snap-start max-w-[87%] min-[480px]:max-w-[71%] sm:max-w-[62%] mr-4"
                        >
                          <div className={`h-full w-full flex flex-col justify-start gap-y-4 p-5 rounded-xl border transition-colors ${isActive ? "border-[#fff500] bg-white/[0.04]" : "border-white/[0.12]"}`}>
                            <div className="flex flex-col text-start items-start justify-start gap-y-6">
                              <Icon className="lg:w-[38px] lg:h-[38px] w-6 h-6 text-[#fff500]" />
                              <p className="text-xl font-medium text-text-primary-on-color">
                                {item.title}
                              </p>
                            </div>
                            <p className="body-md text-secondary-on-color">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end gap-4 items-center mt-8">
                    <button
                      className={`w-12 h-12 rounded-full inline-flex items-center justify-center border transition-colors ${
                        canGoPrev
                          ? "text-text-primary-on-color border-gray-100 sm:hover:text-[#fff500] sm:hover:border-[#fff500] sm:active:text-[#fff500]"
                          : "cursor-not-allowed border-gray-200 text-white/[0.24]"
                      }`}
                      disabled={!canGoPrev}
                      onClick={handlePrev}
                      aria-label="Previous slide"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-5 h-5">
                        <path d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"/>
                      </svg>
                    </button>
                    <button
                      className={`w-12 h-12 rounded-full inline-flex items-center justify-center border transition-colors ${
                        canGoNext
                          ? "text-text-primary-on-color border-gray-100 sm:hover:text-[#fff500] sm:hover:border-[#fff500] sm:active:text-[#fff500]"
                          : "cursor-not-allowed border-gray-200 text-white/[0.24]"
                      }`}
                      disabled={!canGoNext}
                      onClick={handleNext}
                      aria-label="Next slide"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-5 h-5">
                        <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"/>
                      </svg>
                    </button>
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
