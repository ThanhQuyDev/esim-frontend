import {
  CouponHero,
  CouponHowToUse,
  CouponFreeCredits,
} from "@/components/layout/sections/coupon-page";
import { TestimonialsSection } from "@/components/layout/sections/testimonials";
import { ReviewComparisonTable } from "@/components/layout/sections/review-page";
import { FAQSection } from "@/components/layout/sections/faq";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
  };
}

export default async function CouponPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const coupon = dict.couponPage;

  // Override testimonials title with coupon-specific title, keep same reviews
  const testimonialsDict = {
    ...dict.testimonials,
    title: coupon.testimonials.title,
  };

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.coupon }]}
        lang={locale}
      />
      <CouponHero dict={coupon.hero} lang={locale} />
      <CouponHowToUse dict={coupon.howToUse} lang={locale} />
      <TestimonialsSection dict={testimonialsDict} />
      <ReviewComparisonTable dict={coupon.comparisonTable} lang={locale} />
      <CouponFreeCredits dict={coupon.freeCredits} lang={locale} />
      <FAQSection dict={coupon.faq} lang={locale} />
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
