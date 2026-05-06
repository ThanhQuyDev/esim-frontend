import dynamic from "next/dynamic";
import type { ComponentType } from "react";

type ComponentProps<T> = T extends ComponentType<infer P> ? P : never;

type HowItWorksProps = ComponentProps<
  typeof import("@/components/layout/sections/how-it-works").HowItWorksSection
>;
type FeaturesProps = ComponentProps<
  typeof import("@/components/layout/sections/features").FeaturesSection
>;
type EsimComparisonProps = ComponentProps<
  typeof import("@/components/layout/sections/what-is-esim-page/comparison").EsimComparison
>;
type TestimonialsProps = ComponentProps<
  typeof import("@/components/layout/sections/testimonials").TestimonialsSection
>;
type DownloadAppProps = ComponentProps<
  typeof import("@/components/layout/sections/download-app").DownloadAppSection
>;
type FaqProps = ComponentProps<
  typeof import("@/components/layout/sections/faq").FAQSection
>;
type ReferFriendProps = ComponentProps<
  typeof import("@/components/layout/sections/refer-friend").ReferFriendBanner
>;
type FooterProps = ComponentProps<
  typeof import("@/components/layout/sections/footer").FooterSection
>;

const SectionSkeleton = ({ className = "h-40" }: { className?: string }) => (
  <div className={`mx-4 sm:mx-auto py-8 ${className}`} aria-hidden="true">
    <div className="container mx-auto h-full rounded-sm bg-[#f5f5f7]" />
  </div>
);

export const LazyHowItWorksSection = dynamic<HowItWorksProps>(
  () => import("@/components/layout/sections/how-it-works").then((mod) => mod.HowItWorksSection),
  { loading: () => <SectionSkeleton className="h-64" /> }
);

export const LazyFeaturesSection = dynamic<FeaturesProps>(
  () => import("@/components/layout/sections/features").then((mod) => mod.FeaturesSection),
  { loading: () => <SectionSkeleton className="h-56" /> }
);

export const LazyEsimComparison = dynamic<EsimComparisonProps>(
  () => import("@/components/layout/sections/what-is-esim-page/comparison").then((mod) => mod.EsimComparison),
  { loading: () => <SectionSkeleton className="h-56" /> }
);

export const LazyTestimonialsSection = dynamic<TestimonialsProps>(
  () => import("@/components/layout/sections/testimonials").then((mod) => mod.TestimonialsSection),
  { loading: () => <SectionSkeleton className="h-56" /> }
);

export const LazyDownloadAppSection = dynamic<DownloadAppProps>(
  () => import("@/components/layout/sections/download-app").then((mod) => mod.DownloadAppSection),
  { loading: () => <SectionSkeleton className="h-56" /> }
);

export const LazyFAQSection = dynamic<FaqProps>(
  () => import("@/components/layout/sections/faq").then((mod) => mod.FAQSection),
  { loading: () => <SectionSkeleton className="h-56" /> }
);

export const LazyReferFriendBanner = dynamic<ReferFriendProps>(
  () => import("@/components/layout/sections/refer-friend").then((mod) => mod.ReferFriendBanner),
  { loading: () => <SectionSkeleton className="h-32" /> }
);

export const LazyFooterSection = dynamic<FooterProps>(
  () => import("@/components/layout/sections/footer").then((mod) => mod.FooterSection),
  { loading: () => <SectionSkeleton className="h-48" /> }
);
