"use client";

import { ProfileContent } from "@/components/layout/sections/profile";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { useLocale } from "next-intl";

export default function ProfilePage() {
  const locale = useLocale() as "vi" | "en";

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: locale === "vi" ? "Tài khoản" : "My Account" }]}
        lang={locale}
      />
      <ProfileContent lang={locale} />
    </main>
  );
}
