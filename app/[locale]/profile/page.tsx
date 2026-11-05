"use client";

import { ProfileContent } from "@/components/layout/sections/profile";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { useLocale } from "next-intl";

/** Three quarters of the site's width: full width read badly (vande-0411 #079). */
const PROFILE_WIDTH = "md:max-w-[768px] xl:max-w-[876px]";

export default function ProfilePage() {
  const locale = useLocale() as "vi" | "en";

  return (
    <main role="main" className="relative bg-[#F7F7F8]">
      {/* The eSIM lookup page's blue, so the white cards stand out. */}
      <div className="absolute inset-x-0 -top-[116px] h-[900px] bg-[linear-gradient(#9FCFF2,#F7F7F8)]" />
      <div className="relative z-10">
        <Breadcrumb
          items={[{ label: locale === "vi" ? "Tài khoản" : "My Account" }]}
          lang={locale}
          widthClassName={PROFILE_WIDTH}
        />
        <ProfileContent lang={locale} widthClassName={PROFILE_WIDTH} />
      </div>
    </main>
  );
}
