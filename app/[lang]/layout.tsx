import { Navbar } from "@/components/layout/navbar";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { i18n, type Locale } from "@/lib/i18n-config";
import { getDictionary } from "@/lib/dictionaries";
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
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
    openGraph: {
      type: "website",
      title: dict.metadata.title,
      description: dict.metadata.description,
    },
  };
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
      {children}
    </>
  );
}
