import { Navbar } from "@/components/layout/navbar";
import { LayoutClientWidgets } from "@/components/layout/layout-client-widgets";
import { PageStructuredData } from "@/components/page-structured-data";
import { i18n, type Locale } from "@/lib/i18n-config";
import { getTopBars } from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import type { Metadata } from "next";
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
  const [dict, topBars] = await Promise.all([
    getDictionary(params.lang),
    getTopBars({ lang: params.lang }),
  ]);

  return (
    <>
      <PageStructuredData />
      <Navbar lang={params.lang} dict={dict.nav} topBars={topBars} />
      {children}
      <LayoutClientWidgets lang={params.lang} />
    </>
  );
}
