"use client";

import type { DestinationDict } from "./types";

interface TrustpilotBarProps {
  dict: DestinationDict;
}

const Star = () => (
  <svg viewBox="0 0 20 20" fill="#22C55E" className="w-4 h-4">
    <path d="M10 1l2.39 4.84 5.35.78-3.87 3.77.91 5.32L10 13.27l-4.78 2.51.91-5.32L2.26 6.62l5.35-.78L10 1z" />
  </svg>
);

export function TrustpilotBar({ dict }: TrustpilotBarProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex gap-0.5">
        {Array.from({ length: 4 }).map((_, i) => <Star key={i} />)}
        <svg viewBox="0 0 20 20" fill="#22C55E" className="w-4 h-4 opacity-50">
          <path d="M10 1l2.39 4.84 5.35.78-3.87 3.77.91 5.32L10 13.27l-4.78 2.51.91-5.32L2.26 6.62l5.35-.78L10 1z" />
        </svg>
      </div>
      <span className="text-base sm:text-sm font-medium text-[#111]">{dict.trust.rating}</span>
      <span className="text-sm text-[#6b7280]">{dict.trust.ratingCount}</span>
      <div className="ml-auto flex items-center gap-1.5 text-sm text-[#6b7280] font-medium">
        <span className="text-base sm:text-sm text-[#22C55E]">★</span>
        {dict.trust.trustpilot}
      </div>
    </div>
  );
}
