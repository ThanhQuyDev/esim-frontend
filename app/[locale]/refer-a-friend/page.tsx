import {
  ReferHero,
  ReferWhyJoin,
  ReferHowItWorks,
  ReferDownloadApp,
} from "@/components/layout/sections/refer-a-friend-page";
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
  const dict = await getDictionary(locale);
  const meta = dict.referFriendPage?.metadata ?? {};
  return getSeoMetadata(getCmsSeoUrlForPage("/refer-a-friend", locale), {
    title: meta.title,
    description: meta.description,
  });
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
      <ReferHowItWorks dict={refer.howItWorks} />
      <ReferDownloadApp dict={refer.downloadApp} />
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
