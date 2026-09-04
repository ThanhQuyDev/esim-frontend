import { BlogCard, BlogCategoryNav } from "@/components/layout/sections/blog-page";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getBlogAuthor, getBlogsByAuthor } from "@/lib/api";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { authorSlug: string };
}): Promise<Metadata> {
  const author = await getBlogAuthor(decodeURIComponent(params.authorSlug));
  if (!author) return {};
  return {
    title: author.name,
    description: author.description ?? `Articles by ${author.name}`,
  };
}

export default async function BlogAuthorPage({
  params,
}: {
  params: { authorSlug: string };
}) {
  const locale = (await getLocale()) as Locale;
  const authorSlug = decodeURIComponent(params.authorSlug);
  const [dict, author] = await Promise.all([
    getDictionary(locale),
    getBlogAuthor(authorSlug),
  ]);
  if (!author) notFound();

  const blogs = (await getBlogsByAuthor(authorSlug, { lang: locale, limit: 20 })).data.filter(
    (blog) => blog.isPublished,
  );

  return (
    <main role="main">
      <BlogCategoryNav lang={locale} />
      <div className="bg-primary">
        <Breadcrumb
          items={[{ label: "Blog", href: `/${locale}/blog/` }, { label: author.name }]}
          lang={locale}
        />
      </div>
      <div className="container mx-auto max-w-[1168px] px-4 py-12">
        <header className="mb-12 flex flex-col items-center gap-4 text-center">
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-tertiary text-3xl">
              {author.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-[1.625rem] sm:text-[2rem]">{author.name}</h1>
          {author.description && <p className="body-md max-w-2xl text-secondary">{author.description}</p>}
        </header>
        {blogs.length === 0 ? (
          <p className="body-md text-secondary">
            {locale === "vi" ? "Chưa có bài viết nào." : "No articles found."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => <BlogCard key={blog.id} blog={blog} lang={locale} />)}
          </div>
        )}
      </div>
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
