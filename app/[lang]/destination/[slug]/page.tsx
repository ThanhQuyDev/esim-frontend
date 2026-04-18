import { notFound } from "next/navigation";
import { getDestinationBySlug } from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import { DestinationPlans } from "@/components/layout/sections/destination";
import { FooterSection } from "@/components/layout/sections/footer";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

interface DestinationPageProps {
  params: { lang: Locale; slug: string };
}

export async function generateMetadata({
  params,
}: DestinationPageProps): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  const destination = await getDestinationBySlug(params.slug, params.lang);

  if (!destination) {
    return { title: dict.destinationPage.notFound };
  }

  const title = dict.destinationPage.title.replace(
    "{destination}",
    destination.name
  );
  const description = dict.destinationPage.subtitle.replace(
    "{destination}",
    destination.name
  );

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const [dict, destination] = await Promise.all([
    getDictionary(params.lang),
    getDestinationBySlug(params.slug, params.lang),
  ]);

  if (!destination) {
    notFound();
  }

  return (
    <main role="main">
      <DestinationPlans
        destination={destination}
        dict={dict.destinationPage}
        lang={params.lang}
      />
      <FooterSection dict={dict.footer} />
    </main>
  );
}
