import { BlogPageContent } from "@/components/layout/sections/blog-page";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { getBlogs, getBlogCategories } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  return getSeoMetadata(`/${params.lang}/blog`);
}

export default async function BlogPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const [dict, blogsRes, categories] = await Promise.all([
    getDictionary(params.lang),
    getBlogs({ lang: params.lang, limit: 20 }),
    getBlogCategories(params.lang),
  ]);

  const blogs = blogsRes.data.filter((b) => b.isPublished);

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.blog }]}
        lang={params.lang}
      />
      <BlogPageContent
        lang={params.lang}
        initialBlogs={blogs}
        initialCategories={categories}
      />
      <FooterSection dict={dict.footer} lang={params.lang} />
    </main>
  );
}
