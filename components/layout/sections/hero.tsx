"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { resolveFileUrl, type HeroBanner } from "@/lib/api";

interface HeroSectionProps {
  dict: Record<string, any>;
  heroBanners?: HeroBanner[];
}

const FALLBACK_MOBILE_HERO_IMAGE =
  "https://sb.nordcdn.com/m/1ec9b98515b5f040/original/saily-dach-campaign-man-mobile-1536x1760.png";
const FALLBACK_DESKTOP_HERO_IMAGE =
  "https://sb.nordcdn.com/m/70f7fbf89c133c58/original/saily_dach-campain_man_visual_desktop_5120x2220.png";

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
    <Image
      alt={alt}
      src={fallbackSrc}
      width={width}
      height={height}
      className={className}
      priority
      style={style}
    />
  );
}

export function HeroSection({ dict, heroBanners = [] }: HeroSectionProps) {
  const activeBanner = heroBanners.find((banner) => banner.active === true);
  const heroImageUrl = resolveFileUrl(activeBanner?.image);

  return (
    <section className="relative overflow-hidden">
      {/* Background colors per breakpoint */}
      <div className="absolute bottom-0 -top-[56px] lg:-top-[72px] w-full">
        <div className="w-full h-full md:hidden" style={{ backgroundColor: "rgb(158, 195, 240)" }} />
        <div className="w-full h-full hidden md:block lg:hidden" style={{ backgroundColor: "rgb(232, 233, 237)" }} />
        <div className="w-full h-full hidden lg:block xl:hidden" style={{ backgroundColor: "rgb(232, 233, 237)" }} />
        <div className="w-full h-full hidden xl:block" style={{ backgroundColor: "rgb(231, 233, 237)" }} />
      </div>

      {/* Background Hero Image */}
      <div className="absolute bottom-0 -top-[56px] lg:-top-[72px] w-full flex flex-col items-center overflow-hidden">
        <div className="relative h-full min-w-[768px] md:max-lg:min-w-[1720px] lg:max-xl:min-w-[1920px] xl:min-w-[2560px]">
          {/* Mobile < md */}
          <div className="block md:hidden absolute z-10 bottom-0">
            <HeroImage
              alt="A person using the esim.vn eSIM app while rushing on their travels."
              apiImageUrl={heroImageUrl}
              fallbackSrc={FALLBACK_MOBILE_HERO_IMAGE}
              width={768}
              height={880}
              className="max-w-fit"
              style={{ color: "transparent", maxWidth: "768px", width: "768px" }}
            />
          </div>
          {/* md to lg */}
          <div className="hidden md:block lg:hidden">
            <HeroImage
              alt="esim.vn dach campain man visual desktop 5120x2220"
              apiImageUrl={heroImageUrl}
              fallbackSrc={FALLBACK_DESKTOP_HERO_IMAGE}
              width={1720}
              height={746}
              className="max-w-fit"
              style={{ color: "transparent", maxWidth: "1720px", width: "1720px" }}
            />
          </div>
          {/* lg to xl */}
          <div className="hidden lg:block xl:hidden absolute z-10" style={{ left: "-40px" }}>
            <HeroImage
              alt="esim.vn dach campain man visual desktop 5120x2220"
              apiImageUrl={heroImageUrl}
              fallbackSrc={FALLBACK_DESKTOP_HERO_IMAGE}
              width={1920}
              height={832}
              className="max-w-fit"
              style={{ color: "transparent", maxWidth: "1920px", width: "1920px" }}
            />
          </div>
          {/* xl+ */}
          <div className="hidden xl:block">
            <HeroImage
              alt="esim.vn dach campain man visual desktop 5120x2220"
              apiImageUrl={heroImageUrl}
              fallbackSrc={FALLBACK_DESKTOP_HERO_IMAGE}
              width={2560}
              height={1110}
              className="max-w-fit"
              style={{ color: "transparent", maxWidth: "2560px", width: "2560px" }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="relative flex flex-col md:flex-row justify-center gap-8 xl:max-[2173px]:items-center h-auto py-8 md:py-10 lg:py-16">
              <div className="md:w-6/12">
                <div className="flex flex-col text-start justify-start gap-y-6 items-stretch">
                  {/* By the creators of NordVPN */}
                  <div className="flex flex-row justify-start flex-wrap items-center gap-x-3 gap-y-4">
                    <p className="body-md-medium text-text-secondary">{dict.badge}</p>
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

                  {/* Title */}
                  <h1 className="heading-2xl text-text-primary">{dict.title}</h1>

                  {/* Promo */}
                  <div className="flex flex-col gap-y-2">
                    <div className="flex flex-row items-center gap-x-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt="summer discount badge"
                        src="https://sb.nordcdn.com/m/52eb3c4de0f13d0d/original/summer-discount-badge.svg"
                        width={24}
                        height={24}
                        loading="lazy"
                        style={{ color: "transparent" }}
                      />
                      <p className="body-md-bold text-text-primary">{dict.promoBadge}</p>
                    </div>
                    <div className="flex flex-row gap-x-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt="checkbox tick"
                        src="https://sb.nordcdn.com/m/1ebafd36954a2b78/original/checkbox-tick.svg"
                        width={20}
                        height={20}
                        className="max-w-fit"
                        loading="lazy"
                        style={{ color: "transparent", maxWidth: "20px", width: "20px" }}
                      />
                      <p>{dict.promoLink}</p>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="flex flex-col gap-y-3">
                    <p className="body-md-medium text-text-primary">{dict.subtitle}</p>
                    <button
                      className="inline-flex relative p-6 max-lg:py-4 pr-15 lg:pr-18 w-full md:max-w-[400px] bg-white text-text-tertiary body-md rounded-md outline-none hover:bg-bg-primary transition-colors"
                      onClick={() => {
                        const el = document.getElementById("destinations");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {dict.ctaPrimary}
                      <span className="flex absolute right-3 lg:right-4 top-2 lg:top-3 w-10 lg:w-12 h-10 lg:h-12 bg-bg-accent rounded-sm items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              {/* Right spacer for hero image */}
              <div className="w-[288px] h-full self-end mx-auto relative xl:min-h-[555px] lg:min-h-[464px] md:min-h-[352px] min-h-[288px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
