import {
  ReferHero,
  ReferWhyJoin,
  ReferAboutSprint,
  ReferHowItWorks,
  ReferDownloadApp,
} from "@/components/layout/sections/refer-a-friend-page";
import { FAQSection } from "@/components/layout/sections/faq";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const meta = dict.referFriendPage?.metadata ?? {};
  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function ReferAFriendPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const refer = dict.referFriendPage;

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.referFriend }]}
        lang={locale}
      />
      <ReferHero dict={refer.hero} />
      <ReferWhyJoin dict={refer.whyJoin} />
      <ReferAboutSprint dict={refer.aboutSprint} />
      <ReferHowItWorks dict={refer.howItWorks} />
      <ReferDownloadApp dict={refer.downloadApp} />
      <FAQSection dict={refer.faq} lang={locale} />
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
