"use client";

import type { DestinationDict } from "./types";

interface TrustpilotBarProps {
  dict: DestinationDict;
}

const Star = () => (
  <svg viewBox="0 0 16 16" fill="#00b67a" className="w-4 h-4">
    <path d="M8 1l1.8 5.5H16l-4.9 3.6 1.9 5.5L8 12l-5 3.6 1.9-5.5L1 6.5h6.2z" />
  </svg>
);

export function TrustpilotBar({ dict }: TrustpilotBarProps) {
  return (
    <div className="flex items-center gap-2 pb-3 mb-3.5 border-b border-[#f0f0f0]">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} />)}
      </div>
      <span className="text-[13px] font-bold text-[#1a1a1a]">{dict.trust.rating}</span>
      <span className="text-[13px] text-[#6b7280]">{dict.trust.ratingCount}</span>
      <span className="ml-auto flex items-center gap-1 text-[13px] font-semibold text-[#1a1a1a]">
        <Star />{dict.trust.trustpilot}
      </span>
    </div>
  );
}
