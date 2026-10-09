"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/**
 * Sign out from a button the customer pressed, then go to the home page
 * (#011, test round 4). Signing out used to leave the customer on whatever page
 * they were on — on a phone, a profile or wallet page that now had nothing to
 * show. The automatic sign-out on an expired session does not use this: it
 * must not yank someone off the page they are reading.
 */
export function useSignOut(lang: string) {
  const { logout } = useAuth();
  const router = useRouter();
  return useCallback(() => {
    logout();
    router.push(lang === "vi" ? "/" : `/${lang}`);
  }, [logout, router, lang]);
}
