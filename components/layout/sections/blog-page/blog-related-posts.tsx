import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import type { Blog } from "@/lib/api";
import { blogDetailHref, categorySlug } from "./blog-detail-helpers";

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

interface BlogRelatedPostsProps {
  posts: Blog[];
  lang: string;
}

export function BlogRelatedPosts({ posts, lang }: BlogRelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  const heading = lang === "vi" ? "Bài viết liên quan" : "Related Articles";

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <h2 className="heading-md mb-6 scroll-mt-20 xl:scroll-mt-24">
        {heading}
      </h2>
      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:[&>figure]:max-w-[240px]"
          >
            {post.coverImage && (
              <Link
                href={blogDetailHref(post, lang)}
                className="align-bottom min-w-[240px] transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus hover:underline"
              >
                <figure className="overflow-hidden rounded-sm">
                  <Image
                    alt={post.title}
                    loading="lazy"
                    width={968}
                    height={507}
                    className="w-full h-auto object-cover"
                    sizes="(max-width: 640px) 100vw, 240px"
                    src={post.coverImage}
                  />
                </figure>
              </Link>
            )}
            <div className="flex flex-col text-start items-start justify-start gap-y-4">
              {post.category && (
                <div>
                  <Link
                    href={`/${lang}/blog/${categorySlug(post.category)}`}
                    className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
                  >
                    <span className="text-center whitespace-nowrap rounded-full inline-block bg-tertiary text-primary py-0.5 px-2 body-2xs-medium hover:bg-neutral-300">
                      {post.category}
                    </span>
                  </Link>
                </div>
              )}
              <div className="flex flex-col text-start items-start justify-start gap-y-2">
                <div className="flex flex-row justify-start flex-wrap items-center gap-x-4">
                  {post.publishedAt && (
                    <time
                      dateTime={post.publishedAt}
                      className="flex gap-2 items-center text-secondary"
                    >
                      <p className="body-xs">{formatDate(post.publishedAt)}</p>
                    </time>
                  )}
                  {post.timeRead != null && (
                    <div className="flex gap-2 items-center text-secondary">
                      <BookOpen size={16} />
                      <p className="body-xs">{post.timeRead} min read</p>
                    </div>
                  )}
                </div>
                <p className="body-md-medium">
                  <Link
                    href={blogDetailHref(post, lang)}
                    className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus hover:underline"
                  >
                    {post.title}
                  </Link>
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
