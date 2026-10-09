import type { Metadata } from "next";
import { Suspense } from "react";
import { getLocale } from "next-intl/server";
import { AccountLinkAction } from "@/components/layout/sections/account/account-link-action";
import type { Locale } from "@/lib/i18n-config";

/** Where the reset-password email lands (#012, test round 4). Private link from an email: never indexed. */
export const metadata: Metadata = {
  title: "Đặt lại mật khẩu / Reset password",
  robots: { index: false, follow: false },
};

export default async function PasswordChangePage() {
  const locale = (await getLocale()) as Locale;
  return (
    <main role="main" className="min-h-[70vh] bg-gray-50 px-4 pt-28 pb-16">
      {/* useSearchParams needs a Suspense boundary to prerender. */}
      <Suspense fallback={null}>
        <AccountLinkAction mode="reset-password" lang={locale === "vi" ? "vi" : "en"} />
      </Suspense>
    </main>
  );
}
