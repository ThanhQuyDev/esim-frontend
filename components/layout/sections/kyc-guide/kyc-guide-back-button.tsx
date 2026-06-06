"use client";

import { useRouter } from "next/navigation";

export function KycGuideBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-center gap-1.5 px-[14px] py-2 rounded-full text-sm font-semibold text-[#374151] cursor-pointer bg-white transition-colors hover:bg-[#F3F4F6] shrink-0"
      style={{ border: "1.5px solid #E5E7EB" }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Quay lại
    </button>
  );
}
