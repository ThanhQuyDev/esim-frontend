import {
  ReviewHero,
  ReviewFeatures,
  ReviewComparisonTable,
} from "@/components/layout/sections/review-page";
import { TestimonialsSection } from "@/components/layout/sections/testimonials";
import { DestinationsSection } from "@/components/layout/sections/destinations";
import { FAQSection } from "@/components/layout/sections/faq";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

export default async function ReviewPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);
  const review = dict.reviewPage;

  return (
    <main role="main">
      <ReviewHero dict={review.hero} lang={params.lang} />
      <ReviewFeatures dict={review.features} lang={params.lang} />
      <TestimonialsSection dict={dict.testimonials} />
      <ReviewComparisonTable dict={review.comparisonTable} lang={params.lang} />
      <DestinationsSection dict={dict.destinations} lang={params.lang} />
      <FAQSection dict={dict.faq} lang={params.lang} />
      <FooterSection dict={dict.footer} />
    </main>
  );
}
