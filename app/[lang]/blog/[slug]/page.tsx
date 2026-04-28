import { BlogDetailContent } from "@/components/layout/sections/blog-page";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; slug: string };
}): Promise<Metadata> {
  return getSeoMetadata(`/${params.lang}/blog/${params.slug}`);
}

export default async function BlogDetailPage({
  params,
}: {
  params: { lang: Locale; slug: string };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <main role="main">
      <BlogDetailContent lang={params.lang} slug={params.slug} />
      <FooterSection dict={dict.footer} />
    </main>
  );
}
