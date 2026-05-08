"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Captures ?ref=CODE from the URL and stores it in localStorage.
 * The cart and checkout pages will read this value to auto-fill the referral code.
 */
export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ref.trim()) {
      localStorage.setItem("saily_referral_code", ref.trim().toUpperCase());
    }
  }, [searchParams]);

  return null;
}
