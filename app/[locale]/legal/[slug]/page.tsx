import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { FooterSection } from "@/components/layout/sections/footer";
import {
  LegalPage,
  LEGAL_POLICIES,
  findPolicyBySlug,
} from "@/components/layout/sections/legal";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

export function generateStaticParams() {
  return LEGAL_POLICIES.flatMap((policy) =>
    (["vi", "en"] as const).map((locale) => ({
      locale,
      slug: policy.urlSlug[locale],
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const policy = findPolicyBySlug(decodeURIComponent(params.slug), locale);
  if (!policy) return {};

  const content = policy.content[locale];
  return {
    title: `${content.title} — esim.vn`,
    description: content.title,
  };
}

export default async function LegalPolicyPage({
  params,
}: {
  params: { slug: string };
}) {
  const locale = (await getLocale()) as Locale;
  const slug = decodeURIComponent(params.slug);
  const policy = findPolicyBySlug(slug, locale);

  if (!policy) notFound();

  const dict = await getDictionary(locale);

  return (
    <main role="main">
      <Breadcrumb
        items={[
          { label: dict.breadcrumb.legal },
          { label: policy.navLabel[locale] },
        ]}
        lang={locale}
      />
      <LegalPage policy={policy} locale={locale} />
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
