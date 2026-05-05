import { BlogDetailContent } from "@/components/layout/sections/blog-page";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { getBlogBySlug } from "@/lib/api";
import { notFound } from "next/navigation";
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
  const [dict, blog] = await Promise.all([
    getDictionary(params.lang),
    getBlogBySlug(params.slug, params.lang),
  ]);

  if (!blog) {
    notFound();
  }

  return (
    <main role="main">
      <BlogDetailContent lang={params.lang} slug={params.slug} initialBlog={blog} />
      <FooterSection dict={dict.footer} />
    </main>
  );
}
