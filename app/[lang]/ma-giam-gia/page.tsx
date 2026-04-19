import {
  CouponHero,
  CouponHowToUse,
  CouponFreeCredits,
} from "@/components/layout/sections/coupon-page";
import { TestimonialsSection } from "@/components/layout/sections/testimonials";
import { ReviewComparisonTable } from "@/components/layout/sections/review-page";
import { FAQSection } from "@/components/layout/sections/faq";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

export default async function CouponPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);
  const coupon = dict.couponPage;

  const testimonialsDict = {
    ...dict.testimonials,
    title: coupon.testimonials.title,
  };

  return (
    <main role="main">
      <CouponHero dict={coupon.hero} lang={params.lang} />
      <CouponHowToUse dict={coupon.howToUse} lang={params.lang} />
      <TestimonialsSection dict={testimonialsDict} />
      <ReviewComparisonTable dict={coupon.comparisonTable} lang={params.lang} />
      <CouponFreeCredits dict={coupon.freeCredits} lang={params.lang} />
      <FAQSection dict={coupon.faq} lang={params.lang} />
      <FooterSection dict={dict.footer} />
    </main>
  );
}
