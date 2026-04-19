"use client";

import type { Destination } from "@/lib/api";
import type { DestinationDict } from "./types";

interface ProductHeroProps {
  destination: Destination;
  dict: DestinationDict;
}

export function ProductHero({ destination, dict }: ProductHeroProps) {
  return (
    <div className="mb-5">
      {/* Hero image */}
      <div className="relative w-full h-[210px] rounded-xl overflow-hidden mb-5 bg-gradient-to-b from-[#ffd89b] via-[#ffb88a] to-[#ff9a8b]">
        {destination.avatarUrl ? (
          <img
            src={destination.avatarUrl}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {destination.flagUrl && (
              <img
                src={destination.flagUrl}
                alt={destination.name}
                className="w-20 h-20 rounded-lg shadow-lg"
              />
            )}
          </div>
        )}
        <div className="absolute bottom-2.5 left-2.5 bg-black/55 text-white text-[11px] font-semibold rounded-full px-2.5 py-1 flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" stroke="white" strokeWidth="1" />
            <path d="M3 5l1.5 1.5L7 3.5" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {dict.heroTag}
        </div>
      </div>

      {/* Title & description */}
      <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight mb-2 leading-tight">
        {dict.title.replace("{destination}", destination.name)}
      </h1>
      <p className="text-[15px] text-[#4b5563] leading-relaxed mb-4">
        {dict.subtitle.replace("{destination}", destination.name)}
      </p>
    </div>
  );
}
