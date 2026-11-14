/**
 * A SIM chip, gold contacts on a rounded card, so a row reads as "an eSIM" at
 * a glance (vande-1411 #040).
 */
export function EsimChipIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      data-testid="esim-chip-icon"
      fill="none"
    >
      <rect x="3" y="4" width="18" height="16" rx="3.5" fill="#F5C451" stroke="#B88A1E" strokeWidth="1.2" />
      <path
        d="M9 4v4.5M15 4v4.5M9 15.5V20M15 15.5V20M3 10h4.5M3 14h4.5M16.5 10H21M16.5 14H21"
        stroke="#B88A1E"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <rect x="7.5" y="8.5" width="9" height="7" rx="1.6" fill="#FBE08A" stroke="#B88A1E" strokeWidth="1.2" />
    </svg>
  );
}
