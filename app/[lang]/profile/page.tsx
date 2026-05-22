"use client";

import { ProfileContent } from "@/components/layout/sections/profile";
import { Breadcrumb } from "@/components/layout/breadcrumb";

export default function ProfilePage({
  params,
}: {
  params: { lang: "en" | "vi" };
}) {
  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: params.lang === "vi" ? "Tài khoản" : "My Account" }]}
        lang={params.lang}
      />
      <ProfileContent lang={params.lang} />
    </main>
  );
}
