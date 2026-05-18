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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {posts.map((post) => (
          <article key={post.id} className="flex flex-col gap-3">
            {post.coverImage && (
              <Link href={`/${lang}/blog/${post.slug}`}>
                <figure className="overflow-hidden rounded-lg">
                  <Image
                    alt={post.title}
                    loading="lazy"
                    width={480}
                    height={252}
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                    src={post.coverImage}
                  />
                </figure>
              </Link>
            )}
            <div className="flex flex-col gap-2">
              {post.category && (
                <span className="text-center whitespace-nowrap rounded-full inline-block bg-tertiary text-primary py-0.5 px-2 body-2xs-medium w-fit">
                  {post.category}
                </span>
              )}
              <div className="flex items-center gap-3 text-secondary body-xs">
                {post.publishedAt && (
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                )}
                {post.timeRead != null && (
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} />
                    {post.timeRead} min read
                  </span>
                )}
              </div>
              <h3 className="body-md-medium">
                <Link
                  href={`/${lang}/blog/${post.slug}`}
                  className="hover:underline"
                >
                  {post.title}
                </Link>
              </h3>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
