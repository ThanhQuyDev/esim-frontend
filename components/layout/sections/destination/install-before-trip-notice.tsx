"use client";

import { installBeforeTripNotice, requiresInstallBeforeTrip } from "@/lib/destination-notices";

interface InstallBeforeTripNoticeProps {
  destination:
    | { countryCode?: string | null; slug?: string | null; slugVi?: string | null }
    | null
    | undefined;
  lang: string;
  planSource?: "destination" | "region";
  className?: string;
}

/**
 * "Install the eSIM before you travel" — shown on the Turkey eSIM page only
 * (#060). Region pages that happen to include Turkey do not show it.
 */
export function InstallBeforeTripNotice({
  destination,
  lang,
  planSource = "destination",
  className = "",
}: InstallBeforeTripNoticeProps) {
  if (planSource !== "destination" || !requiresInstallBeforeTrip(destination)) return null;
  const notice = installBeforeTripNotice(lang);

  return (
    <div
      role="note"
      data-testid="install-before-trip-notice"
      className={`flex items-start gap-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#D97706"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0"
        aria-hidden="true"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div className="min-w-0">
        <p className="text-[.875rem] font-bold text-[#92400E]">{notice.title}</p>
        <p className="mt-0.5 text-[.8125rem] leading-[1.55] text-[#92400E]">{notice.body}</p>
      </div>
    </div>
  );
}
