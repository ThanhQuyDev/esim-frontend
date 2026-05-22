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
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  return getSeoMetadata(`/${params.lang}/review`);
}

export default async function ReviewPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);
  const review = dict.reviewPage;

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.review }]}
        lang={params.lang}
      />
      <ReviewHero dict={review.hero} lang={params.lang} />
      <ReviewFeatures dict={review.features} lang={params.lang} />
      <TestimonialsSection dict={dict.testimonials} />
      <ReviewComparisonTable dict={review.comparisonTable} lang={params.lang} />
      <DestinationsSection dict={dict.destinations} lang={params.lang} />
      <FAQSection dict={dict.faq} lang={params.lang} />
      <FooterSection dict={dict.footer} lang={params.lang} />
    </main>
  );
}
