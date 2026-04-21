import { notFound } from "next/navigation";
import { getRegionBySlug } from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import { DestinationPlans } from "@/components/layout/sections/destination";
import { FooterSection } from "@/components/layout/sections/footer";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";
import type { Destination } from "@/lib/api";

interface RegionPageProps {
  params: { lang: Locale; slug: string };
}

export async function generateMetadata({
  params,
}: RegionPageProps): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  const region = await getRegionBySlug(params.slug, params.lang);

  if (!region) {
    return { title: dict.destinationPage.notFound };
  }

  const title = dict.destinationPage.title.replace("{destination}", region.name);
  const description = dict.destinationPage.subtitle.replace(
    "{destination}",
    region.name
  );

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function RegionPage({ params }: RegionPageProps) {
  const [dict, region] = await Promise.all([
    getDictionary(params.lang),
    getRegionBySlug(params.slug, params.lang),
  ]);

  if (!region) {
    notFound();
  }

  // Adapt Region to Destination shape for shared components
  const destination: Destination = {
    id: region.id,
    name: region.name,
    slug: region.slug,
    countryCode: "",
    avatarUrl: region.avatarUrl,
    isPopular: false,
    isActive: region.isActive,
    createdAt: region.createdAt,
    updatedAt: region.updatedAt,
  };

  return (
    <main role="main">
      <DestinationPlans
        destination={destination}
        slug={params.slug}
        dict={dict.destinationPage}
        lang={params.lang}
        planSource="region"
      />
      <FooterSection dict={dict.footer} />
    </main>
  );
}
