"use client";

import Image from "next/image";
import type { Destination } from "@/lib/api";
import { getCloudinaryTransformedUrl } from "@/lib/image-utils";
import type { DestinationDict } from "./types";

interface ProductHeroProps {
  destination: Destination;
  dict: DestinationDict;
  lang: string;
}

export function ProductHero({ destination, dict, lang }: ProductHeroProps) {
  const heroSrc = getCloudinaryTransformedUrl(destination.avatarUrl, {
    width: 520,
    height: 260,
    quality: "auto:eco",
    gravity: "center",
  });

  return (
    <div className="rounded-[20px] overflow-hidden border border-[#e5e7eb] bg-white mb-4">
      {/* Hero image */}
      <div className="w-full h-[230px] overflow-hidden rounded-t-[20px]">
        {heroSrc ? (
          <Image
            src={heroSrc}
            alt={destination.name}
            width={520}
            height={260}
            sizes="(min-width: 841px) 465px, 100vw"
            priority
            fetchPriority="high"
            className="w-full h-full object-cover object-[center_30%] block rounded-t-[20px]"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center rounded-t-[20px]"
            style={{ background: "linear-gradient(160deg,#E8824A,#FAC96A,#7BAFC0)" }}
          >
            {destination.flagUrl && (
              <Image
                src={destination.flagUrl}
                alt={destination.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-lg shadow-lg object-cover"
              />
            )}
          </div>
        )}
      </div>

      {/* Body — overlaps image */}
      <div className="bg-white rounded-t-[18px] -mt-7 relative z-[2] px-[18px] pt-5 pb-4">
        {/* Title row with globe icon */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-[30px] h-[30px] bg-[#fff500] rounded-full flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
            </svg>
          </div>
          <h1 className="text-[26px] font-extrabold text-[#111] leading-[1.25] tracking-[-0.4px]">
            {(lang === "vi" ? destination.titleVi : destination.title) || dict.title.replace("{destination}", destination.name)}
          </h1>
        </div>
        <p className="text-sm text-[#6b7280] leading-[1.6] mb-3">
          {(lang === "vi" ? destination.descriptionVi : destination.description) || dict.subtitle.replace("{destination}", destination.name)}
        </p>
      </div>
    </div>
  );
}
