"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import type { Locale } from "@/lib/i18n-config";
import type { WhyChooseUs } from "@/lib/api";

interface FeaturesSectionProps {
  dict: Record<string, any>;
  lang: Locale;
  features?: WhyChooseUs[];
}

export function FeaturesSection({ dict, lang, features = [] }: FeaturesSectionProps) {
  // Sort by sortOrder and filter active items
  const sortedFeatures = [...features]
    .filter((f) => f.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Mobile carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const totalSlides = sortedFeatures.length;
  const canGoPrev = currentSlide > 0;
  const canGoNext = currentSlide < totalSlides - 1;

  const scrollToSlide = useCallback(
    (index: number) => {
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
    },
    [totalSlides],
  );

  const handlePrev = useCallback(() => {
    scrollToSlide(currentSlide - 1);
  }, [currentSlide, scrollToSlide]);

  const handleNext = useCallback(() => {
    scrollToSlide(currentSlide + 1);
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
    <div
      data-section="StayConnected"
      data-testid="section-StayConnected"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        {/* Header */}
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <p className="body-md-medium text-disabled mb-4">
                {dict.badge}
              </p>
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="heading-xl text-primary">
                  {dict.title}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            {/* Desktop grid (md+) */}
            <div className="sm:gap-x-8 md:grid-cols-3 grid-cols-1 gap-y-8 hidden md:grid">
              {sortedFeatures.map((feature) => (
                <div key={feature.id}>
                  <div className="h-full w-full flex flex-col justify-start gap-y-4">
                    <div>
                      <div className="h-full w-full flex flex-col text-start items-start justify-start gap-y-6">
                        <div>
                          {feature.icon ? (
                            <Image
                              src={feature.icon}
                              alt={feature.title}
                              width={36}
                              height={36}
                              className="lg:w-[38px] lg:h-[38px] w-6 h-6"
                              unoptimized
                            />
                          ) : (
                            <div className="lg:w-8 lg:h-8 w-6 h-6 bg-muted rounded" />
                          )}
                        </div>
                        <div>
                          <h3 className="sm:text-[1.25rem] body-lg-medium text-primary">
                            {feature.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div
                        className="body-md prose prose-sm max-w-none"
                        style={{ color: '#4d4e56' }}
                        dangerouslySetInnerHTML={{ __html: feature.description }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile carousel (below md) */}
            <div className="md:hidden max-sm:-mx-4 max-sm:px-4 overflow-hidden">
              <div className="overflow-visible">
                <div
                  ref={sliderRef}
                  className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-4"
                  onScroll={handleScroll}
                >
                  {sortedFeatures.map((feature, index) => {
                    const isActive = index === currentSlide;
                    return (
                      <div
                        key={feature.id}
                        className={`snap-start shrink-0 max-w-[87%] min-[480px]:max-w-[71%] sm:max-w-[62%]`}
                      >
                        <div className={`h-full w-full flex flex-col justify-start gap-y-4 p-5 rounded-xl border transition-colors ${isActive ? "border-primary bg-primary/[0.04]" : "border-tertiary"}`}>
                          <div>
                            <div className="h-full w-full flex flex-col text-start items-start justify-start gap-y-6">
                              <div>
                                {feature.icon ? (
                                  <Image
                                    src={feature.icon}
                                    alt={feature.title}
                                    width={24}
                                    height={24}
                                    className="w-6 h-6"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-6 h-6 bg-muted rounded" />
                                )}
                              </div>
                              <div>
                                <p
                                  className="body-lg-medium text-primary"
                                  role="heading"
                                  aria-level={3}
                                >
                                  {feature.title}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div
                              className="body-md prose prose-sm max-w-none"
                              style={{ color: '#4d4e56' }}
                              dangerouslySetInnerHTML={{ __html: feature.description }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Arrow buttons */}
                <div className="flex justify-end gap-4 items-center mt-8">
                  <button
                    className={`w-12 h-12 rounded-full inline-flex items-center justify-center border-md transition-colors ${
                      canGoPrev
                        ? "text-primary border-tertiary hover:text-primary-on-color hover:bg-dark active:bg-dark active:text-primary-on-color"
                        : "cursor-not-allowed border-tertiary text-disabled"
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
                    className={`w-12 h-12 rounded-full inline-flex items-center justify-center border-md transition-colors ${
                      canGoNext
                        ? "text-primary border-tertiary hover:text-primary-on-color hover:bg-dark active:bg-dark active:text-primary-on-color"
                        : "cursor-not-allowed border-tertiary text-disabled"
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
  );
}
