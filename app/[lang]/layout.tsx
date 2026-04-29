import { Navbar } from "@/components/layout/navbar";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { AuthModal } from "@/components/layout/auth-modal";
import { ChatBubble } from "@/components/layout/chat-bubble";
import { i18n, type Locale } from "@/lib/i18n-config";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  return getSeoMetadata(`/${params.lang}`, {
    title: dict.metadata.title,
    description: dict.metadata.description,
  });
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <Navbar lang={params.lang} dict={dict.nav} />
      <AuthModal lang={params.lang} />
      {children}
      <ChatBubble />
    </>
  );
}
