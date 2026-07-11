import {
  TermsOfServiceEn,
  TermsOfServiceVi,
} from "@/components/layout/sections/terms-of-service";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getCmsSeoUrlForPage } from "@/lib/cms-seo-url";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const title =
    locale === "en"
      ? "Terms of Service — esim.vn"
      : "Điều khoản và Điều kiện — esim.vn";
  const description =
    locale === "en"
      ? "Read the esim.vn Consumer Terms of Service governing the use of our eSIM data plans, app, website and related services."
      : "Điều khoản và Điều kiện giao dịch khi mua eSIM du lịch và sử dụng dịch vụ trên esim.vn.";
  return getSeoMetadata(getCmsSeoUrlForPage("/terms-of-service", locale), {
    title,
    description,
  });
}

export default async function TermsOfServicePage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.termsOfService }]}
        lang={locale}
      />
      {locale === "en" ? <TermsOfServiceEn /> : <TermsOfServiceVi />}
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
