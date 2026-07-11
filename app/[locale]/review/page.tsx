import {
  ReviewHero,
  ReviewFeatures,
  ReviewComparisonTable,
} from "@/components/layout/sections/review-page";
import { TestimonialsSection } from "@/components/layout/sections/testimonials";
import { DestinationsSection } from "@/components/layout/sections/destinations";
import { FAQSection } from "@/components/layout/sections/faq";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getCmsSeoUrlForPage } from "@/lib/cms-seo-url";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";

export async function generateMetadata() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  return getSeoMetadata(getCmsSeoUrlForPage("/review", locale), {
    title: dict.metadata.title,
    description: dict.metadata.description,
  });
}

export default async function ReviewPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const review = dict.reviewPage;

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.review }]}
        lang={locale}
      />
      <ReviewHero dict={review.hero} lang={locale} />
      <ReviewFeatures dict={review.features} lang={locale} />
      <TestimonialsSection dict={dict.testimonials} />
      <ReviewComparisonTable dict={review.comparisonTable} lang={locale} />
      <DestinationsSection dict={dict.destinations} lang={locale} />
      <FAQSection dict={dict.faq} lang={locale} />
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
