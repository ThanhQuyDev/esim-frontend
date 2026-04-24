"use client";

import { ProfileContent } from "@/components/layout/sections/profile";

export default function ProfilePage({
  params,
}: {
  params: { lang: "en" | "vi" };
}) {
  return <ProfileContent lang={params.lang} />;
}
