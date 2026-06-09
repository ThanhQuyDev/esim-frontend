"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import type { Blog } from "@/lib/api";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function categorySlug(cat: string): string {
  return cat
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function blogDetailHref(
  blog: { slug: string; category?: string | null; parent?: string | null },
  lang: string
): string {
  const articleSlug = (blog.slug || "").replace(/^\//, "");
  return `/${lang}/blog/${encodeURIComponent(articleSlug)}`;
}

export function CategoryBadge({
  category,
  lang,
}: {
  category: string | null;
  lang: string;
}) {
  if (!category) return null;
  return (
    <Link
      href={`/${lang}/blog/${categorySlug(category)}/`}
      className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
    >
      <span className="text-center whitespace-nowrap rounded-full inline-block bg-tertiary text-primary py-0.5 px-2 body-2xs-medium hover:bg-neutral-300">
        {category}
      </span>
    </Link>
  );
}

export function BlogMeta({
  date,
  timeRead,
  lang,
}: {
  date: string | null;
  timeRead: string | null;
  lang?: string;
}) {
  return (
    <div className="h-full flex flex-row justify-end flex-wrap items-center gap-x-4 gap-y-4">
      {date && (
        <div>
          <time dateTime={date} className="flex gap-2 items-center text-secondary">
            <p className="body-xs">{formatDate(date)}</p>
          </time>
        </div>
      )}
      {timeRead && (
        <div>
          <div className="flex gap-2 items-center text-secondary">
            <BookOpen size={16} />
            <p className="body-xs">
              {timeRead} {lang === "vi" ? "phút đọc" : "min read"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function AuthorLink({
  author,
  lang,
}: {
  author: string | null;
  lang: string;
}) {
  if (!author) return null;
  const authorSlug = author.toLowerCase().replace(/\s+/g, "-");
  return (
    <Link
      href={`/${lang}/blog/author/${authorSlug}/`}
      className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
    >
      <div className="flex flex-row items-center gap-3">
        <div className="relative rounded-full overflow-hidden w-[24px] min-w-[24px] h-[24px] bg-tertiary">
          <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
            <span className="text-[12px] text-secondary font-medium">
              {author.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <address className="body-sm text-secondary not-italic hover:underline">
          {author}
        </address>
      </div>
    </Link>
  );
}

export function BlogCard({ blog, lang }: { blog: Blog; lang: string }) {
  return (
    <article className="flex flex-col gap-4">
      <Link
        href={blogDetailHref(blog, lang)}
        className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
      >
        <figure className="overflow-hidden rounded-sm">
          <div>
            {blog.coverImage ? (
              <Image
                alt={blog.title}
                loading="lazy"
                width={968}
                height={507}
                className="w-full h-auto"
                style={{ color: "transparent" }}
                src={blog.coverImage}
              />
            ) : (
              <div className="w-full aspect-[968/507] bg-tertiary flex items-center justify-center">
                <span className="text-4xl opacity-40">📝</span>
              </div>
            )}
          </div>
        </figure>
      </Link>
      <div className="h-full w-full flex flex-col text-start items-start justify-start gap-y-4">
        <div>
          <CategoryBadge category={blog.category} lang={lang} />
        </div>
        <div>
          <div className="h-full w-full flex flex-col text-start items-start justify-start gap-y-2">
            <div>
              <BlogMeta
                date={blog.updatedAt}
                timeRead={String(blog.timeRead)}
                lang={lang}
              />
            </div>
            <div>
              <h3 className="heading-sm">
                <Link
                  href={blogDetailHref(blog, lang)}
                  className="!text-[1.4rem] hover:underline font-medium align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
                >
                  {blog.title}
                </Link>
              </h3>
            </div>
          </div>
        </div>
        <div>
          <AuthorLink author={blog.author} lang={lang} />
        </div>
      </div>
    </article>
  );
}
