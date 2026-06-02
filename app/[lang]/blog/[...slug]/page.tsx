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
  params: { lang: Locale; slug: string[] };
}): Promise<Metadata> {
  const articleSlug = params.slug[params.slug.length - 1];
  const baseMeta = await getSeoMetadata(`/${params.lang}/blog/${params.slug.join("/")}`);
  const blog = await getBlogBySlug(articleSlug, params.lang);

  if (!blog) return baseMeta;

  const openGraph: Record<string, any> = {
    ...(baseMeta.openGraph || {}),
    type: "article",
  };

  if (blog.publishedAt) {
    openGraph["article:published_time"] = blog.publishedAt;
  }
  if (blog.updatedAt && blog.updatedAt !== blog.createdAt) {
    openGraph["article:modified_time"] = blog.updatedAt;
  }

  const otherMeta: Record<string, string> = {};
  if (blog.updatedAt && blog.updatedAt !== blog.createdAt) {
    otherMeta["article:modified_time"] = blog.updatedAt;
  }

  return {
    ...baseMeta,
    openGraph,
    other: otherMeta,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: { lang: Locale; slug: string[] };
}) {
  const articleSlug = params.slug[params.slug.length - 1];

  const [dict, blog] = await Promise.all([
    getDictionary(params.lang),
    getBlogBySlug(articleSlug, params.lang),
  ]);

  if (!blog) {
    notFound();
  }

  return (
    <main role="main">
      <BlogDetailContent lang={params.lang} slug={articleSlug} initialBlog={blog} />
      <FooterSection dict={dict.footer} lang={params.lang} />
    </main>
  );
}
