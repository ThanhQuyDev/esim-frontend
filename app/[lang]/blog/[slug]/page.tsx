import { BlogDetailContent } from "@/components/layout/sections/blog-page";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { getBlogBySlug } from "@/lib/api";
import { localizedHref } from "@/lib/route-mapping";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; slug: string };
}): Promise<Metadata> {
  const baseMeta = await getSeoMetadata(`/${params.lang}/blog/${params.slug}`);
  const blog = await getBlogBySlug(params.slug, params.lang);

  if (!blog) return baseMeta;

  // SEO Feature 1.6: Add article:modified_time for Google freshness signals
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
      <Breadcrumb
        items={[
          { label: dict.breadcrumb.blog, href: localizedHref(params.lang, "blog") },
          { label: blog.title },
        ]}
        lang={params.lang}
      />
      <BlogDetailContent lang={params.lang} slug={params.slug} initialBlog={blog} />
      <FooterSection dict={dict.footer} lang={params.lang} />
    </main>
  );
}
