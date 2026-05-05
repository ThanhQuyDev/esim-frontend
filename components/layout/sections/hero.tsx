"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { resolveFileUrl, type HeroBanner } from "@/lib/api";
import { DestinationSearchModal } from "@/components/layout/destination-search-modal";
import type { Locale } from "@/lib/i18n-config";

interface HeroSectionProps {
  dict: Record<string, any>;
  heroBanners?: HeroBanner[];
  lang: Locale;
}

const HERO_IMAGE_URL =
  "https://sb.nordcdn.com/m/452d4cc162d39d45/original/sf-homepage-hero-asset.png";

interface HeroImageProps {
  apiImageUrl: string | null;
  fallbackSrc: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
}

function HeroImage({
  apiImageUrl,
  fallbackSrc,
  alt,
  width,
  height,
  className,
  style,
}: HeroImageProps) {
  if (apiImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        src={apiImageUrl}
        width={width}
        height={height}
        className={className}
        loading="eager"
        style={style}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      src={fallbackSrc}
      width={width}
      height={height}
      className={className}
      loading="eager"
      style={style}
    />
  );
}

export function HeroSection({ dict, heroBanners = [], lang }: HeroSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const activeBanner = heroBanners.find((banner) => banner.active === true);
  const heroImageUrl = resolveFileUrl(activeBanner?.image);

  return (
    <div className="relative">
      {/* Background gradient + hero image */}
      <div className="absolute -top-[72px] bottom-0 w-full flex flex-col items-center overflow-hidden bg-[linear-gradient(#9FCFF2,#E9F2FF)]">
        <div className="absolute bottom-0 min-w-[1038px] md:min-w-[1153px] lg:min-w-[1372px] xl:min-w-[1716px] md:translate-x-[18%] lg:translate-x-[21%] xl:translate-x-[23%]">
          <div>
            <HeroImage
              alt="The Saily international eSIM app."
              apiImageUrl={heroImageUrl}
              fallbackSrc={HERO_IMAGE_URL}
              width={1716}
              height={908}
              style={{ color: "transparent" }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        data-section="Hero"
        data-testid="section-Hero"
        className="relative scroll-mt-20 xl:scroll-mt-24"
      >
        <div>
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              <div className="md:flex flex-col justify-center py-16 max-md:pb-[404px] md:max-w-[370px] lg:max-w-[540px] xl:max-w-[680px] min-h-[743px] md:min-h-[480px] lg:min-h-[592px] xl:min-h-[683px]">
                <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col text-start justify-start gap-y-6 items-stretch">
                  <div>
                    <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col gap-y-6">
                      {/* Badge row */}
                      <div>
                        <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-row flex-wrap gap-x-3 gap-y-4">
                          <div>
                            <p
                              className="body-sm text-secondary scroll-mt-20 xl:scroll-mt-24"
                              id=""
                            >
                              {dict.badge}
                            </p>
                          </div>
                          <div>
                            <div>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                alt="nordvpn default"
                                src="https://sb.nordcdn.com/m/1431cb1f1a5ca2c9/original/nordvpn-default.svg"
                                width={106}
                                height={24}
                                loading="lazy"
                                style={{ color: "transparent" }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <h1
                          className="heading-2xl scroll-mt-20 xl:scroll-mt-24"
                          id=""
                        >
                          {dict.title}
                        </h1>
                      </div>

                      {/* Search */}
                      <div>
                        <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col gap-y-2">
                          <div>
                            <p
                              className="body-md-medium scroll-mt-20 xl:scroll-mt-24"
                              id=""
                            >
                              {dict.subtitle}
                            </p>
                          </div>
                          <div>
                            <button
                              data-testid="destination-modal-button"
                              className="inline-flex relative p-6 max-lg:py-4 pr-15 lg:pr-18 w-full md:max-w-[400px] bg-white text-tertiary body-md-regular rounded-md outline-hidden hover:bg-primary active:bg-primary focus:bg-primary transition-colors duration-medium"
                              onClick={() => setModalOpen(true)}
                            >
                              {dict.ctaPrimary}
                              <span className="flex absolute right-3 lg:right-4 top-2 lg:top-3 w-10 lg:w-12 h-10 lg:h-12 bg-accent rounded-sm items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-text-primary"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                  />
                                </svg>
                              </span>
                            </button>
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
      </div>

      {/* Destination Search Modal */}
      <DestinationSearchModal
        lang={lang}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
