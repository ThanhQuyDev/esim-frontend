"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n-config";

const NavigationProgress = dynamic(
  () => import("@/components/layout/navigation-progress").then((mod) => mod.NavigationProgress),
  { ssr: false }
);

const AuthModal = dynamic(
  () => import("@/components/layout/auth-modal").then((mod) => mod.AuthModal),
  { ssr: false }
);

const ChatBubble = dynamic(
  () => import("@/components/layout/chat-bubble").then((mod) => mod.ChatBubble),
  { ssr: false }
);

export function LayoutClientWidgets({ lang }: { lang: Locale }) {
  return (
    <>
      <NavigationProgress />
      <AuthModal lang={lang} />
      <ChatBubble />
    </>
  );
}
