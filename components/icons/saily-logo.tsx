export function SailyLogo({ className = "w-[57px] lg:w-[78px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1000 421" className={className} aria-label="Saily">
      <defs>
        <clipPath id="wave-clip">
          <rect x="0" y="0" width="101.808" height="32" rx="16" />
        </clipPath>
      </defs>
      <g transform="translate(552.303,205.457) scale(13.38448) translate(-50.904,-16)" clipPath="url(#wave-clip)">
        <rect width="101.808" height="32" rx="16" fill="#1a1a2e" />
        <g className="animate-[waveMove_11s_linear_infinite]">
          <path d="M0,16 Q12.726,4 25.452,16 T50.904,16 T76.356,16 T101.808,16 T127.26,16 T152.712,16 T178.164,16 T203.616,16" fill="none" stroke="#4dabf7" strokeWidth="3" transform="translate(0,0)" />
          <path d="M0,16 Q12.726,6 25.452,16 T50.904,16 T76.356,16 T101.808,16 T127.26,16 T152.712,16 T178.164,16 T203.616,16" fill="none" stroke="#69d2e7" strokeWidth="2.5" transform="translate(-10,2)" />
        </g>
      </g>
      <g transform="translate(317.647,205.457) scale(13.38448) translate(-50.904,-16)" clipPath="url(#wave-clip)">
        <rect width="101.808" height="32" rx="16" fill="#1a1a2e" />
        <g className="animate-[waveMove_11s_linear_infinite]">
          <path d="M0,16 Q12.726,4 25.452,16 T50.904,16 T76.356,16 T101.808,16 T127.26,16 T152.712,16 T178.164,16 T203.616,16" fill="none" stroke="#4dabf7" strokeWidth="3" transform="translate(0,0)" />
          <path d="M0,16 Q12.726,6 25.452,16 T50.904,16 T76.356,16 T101.808,16 T127.26,16 T152.712,16 T178.164,16 T203.616,16" fill="none" stroke="#69d2e7" strokeWidth="2.5" transform="translate(-10,2)" />
        </g>
      </g>
      <text x="50" y="300" fontSize="280" fontWeight="800" fill="#1a1a2e" fontFamily="system-ui, sans-serif">
        Sa
      </text>
      <text x="620" y="300" fontSize="280" fontWeight="800" fill="#1a1a2e" fontFamily="system-ui, sans-serif">
        y
      </text>
    </svg>
  );
}
