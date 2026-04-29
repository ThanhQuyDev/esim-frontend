"use client";

import type { Destination } from "@/lib/api";
import type { DestinationDict } from "../types";

interface MobileHeroProps {
  destination: Destination;
  dict: DestinationDict;
}

export function MobileHero({ destination, dict }: MobileHeroProps) {
  return (
    <>
      {/* Hero - 230px full-bleed with dark gradient */}
      <div className="relative w-full h-[230px]">
        <div className="absolute inset-0">
          {destination.avatarUrl ? (
            <img
              src={destination.avatarUrl}
              alt={destination.name}
              className="w-full h-full object-cover object-[center_30%]"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: "linear-gradient(160deg,#E8824A,#FAC96A,#7BAFC0)" }}
            />
          )}
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom,rgba(0,0,0,.12),rgba(0,0,0,.52) 60%,rgba(0,0,0,.70))",
            }}
          />
        </div>

        {/* Overlay content */}
        <div className="absolute inset-0 z-[2] flex flex-col justify-end px-[18px] pb-[34px]">
          {/* Rating pill */}
          <div className="flex items-center gap-[9px] mb-[9px]">
            <div className="inline-flex items-center gap-[5px] bg-[#22C55E] rounded-[30px] px-[11px] py-1">
              <span className="text-[13.5px] font-extrabold text-white">
                {dict.trust?.rating || "4.7"}
              </span>
              <span className="text-xs text-white">★</span>
            </div>
            <span className="text-[13px] text-white/[0.92] font-medium">
              {dict.trust?.ratingCount || "97K+ đánh giá"}
            </span>
          </div>
          {/* Subtitle */}
          <div className="text-[12.5px] text-white/[0.82] font-medium mb-[5px]">
            {dict.heroTag}
          </div>
          {/* Title row with globe */}
          <div className="flex items-center gap-[11px]">
            <div className="w-9 h-9 rounded-full bg-[#FFF500] flex items-center justify-center shrink-0">
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="2.2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
              </svg>
            </div>
            <h1 className="text-[28px] font-extrabold text-white tracking-[-0.4px] leading-[1.15]">
              {dict.title.replace("{destination}", destination.name)}
            </h1>
          </div>
        </div>
      </div>

      {/* Sheet - white card overlapping hero by 22px */}
      <div className="relative z-10 bg-white rounded-t-[22px] -mt-[22px] pt-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.10)]">
        {/* Description */}
        <p className="px-4 pt-3.5 text-[14.5px] text-[#6b7280] leading-[1.65]">
          {dict.subtitle.replace("{destination}", destination.name)}
        </p>
      </div>
    </>
  );
}
