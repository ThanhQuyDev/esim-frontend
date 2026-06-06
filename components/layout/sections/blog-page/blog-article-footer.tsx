import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import type { Blog } from "@/lib/api";
import { formatDate, formatTimeRead, authorSlug, categorySlug, blogDetailHref } from "./blog-detail-helpers";
import { SocialIconsRow } from "./blog-social-icons";

function RelatedArticle({ article, lang }: { article: Blog; lang: string }) {
  return (
    <article className="flex flex-col gap-4 sm:flex-row sm:items-center sm:[&>figure]:max-w-[240px]">
      {article.coverImage && (
        <Link
          className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus "
          href={blogDetailHref(article, lang)}
        >
          <figure className="overflow-hidden rounded-sm">
            <div>
              <Image
                alt={article.title}
                loading="lazy"
                width={968}
                height={507}
                style={{ color: "transparent" }}
                src={article.coverImage}
              />
            </div>
          </figure>
        </Link>
      )}
      <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col text-start items-start justify-start gap-y-4">
        {article.category && (
          <div>
            <Link
              className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
              href={`/${lang}/blog/${categorySlug(article.category)}/`}
            >
              <span className="text-center whitespace-nowrap rounded-full inline-block bg-tertiary text-primary py-0.5 px-2 body-2xs-medium hover:bg-neutral-300">
                {article.category}
              </span>
            </Link>
          </div>
        )}
        <div>
          <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col text-start items-start justify-start gap-y-2">
            <div>
              <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-row justify-start flex-wrap items-center gap-x-4 gap-y-4">
                <div>
                  <time
                    dateTime={article.publishedAt || article.createdAt}
                    className="flex gap-2 items-center text-secondary"
                  >
                    <p className="body-xs scroll-mt-20 xl:scroll-mt-24">
                      {formatDate(article.publishedAt || article.createdAt)}
                    </p>
                  </time>
                </div>
                {article.timeRead != null && (
                  <div>
                    <div className="flex gap-2 items-center text-secondary">
                      <BookOpen size={16} />
                      <p className="body-xs scroll-mt-20 xl:scroll-mt-24">{formatTimeRead(article.timeRead)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="body-md-medium scroll-mt-20 xl:scroll-mt-24">
                <Link
                  className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus "
                  href={blogDetailHref(article, lang)}
                >
                  {article.title}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function BlogArticleFooter({ blog, lang }: { blog: Blog; lang: string }) {
  const authorName = blog.author || "Unknown";
  const authorAvatarUrl = blog.authorAvatar || "";
  const relatedBlogs = blog.relatedBlogs || [];

  return (
    <div
      data-section="blog article footer"
      data-testid="section-blog article footer"
      className="py-4 relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div>
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="grid sm:gap-x-8 grid-cols-12 gap-y-8">
              <div className="col-span-12 lg:odd:col-start-2 lg:odd:col-span-7 lg:col-span-3">
                <div className="h-full w-full group/stack [&>div:empty]:hidden flex-col text-start items-start justify-start gap-y-6 grid grid-cols-1">
                  {/* Social Icons */}
                  <div>
                    <SocialIconsRow />
                  </div>

                  {/* Divider */}
                  <div>
                    <hr className="border-sm border-secondary w-full" />
                  </div>

                  {/* Author Bio */}
                  <div>
                    <Link
                      className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus group"
                      href={`/${lang}/blog/author/${authorSlug(authorName)}/`}
                    >
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                        {/* Desktop avatar */}
                        {authorAvatarUrl && (
                          <div className="hidden sm:block w-[96px] min-w-[96px] h-[96px] relative rounded-full overflow-hidden">
                            <div className="relative overflow-hidden w-full h-full">
                              <Image
                                alt={`blog author ${authorName.toLowerCase()}`}
                                loading="lazy"
                                fill
                                className="h-full w-full object-cover object-center"
                                sizes="100vw"
                                src={authorAvatarUrl}
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col gap-4 w-full">
                          <div className="flex gap-3 sm:gap-0 items-center">
                            {/* Mobile avatar */}
                            {authorAvatarUrl && (
                              <div className="sm:hidden w-[48px] min-w-[48px] h-[48px] relative rounded-full overflow-hidden">
                                <div className="relative overflow-hidden w-full h-full">
                                  <Image
                                    alt={`blog author ${authorName.toLowerCase()}`}
                                    loading="lazy"
                                    fill
                                    className="h-full w-full object-cover object-center"
                                    sizes="100vw"
                                    src={authorAvatarUrl}
                                  />
                                </div>
                              </div>
                            )}
                            <address className="!text-[1.6rem] sm:heading-md not-italic group-scroll-mt-20 xl:scroll-mt-24">
                              {authorName}
                            </address>
                          </div>
                          {blog.authorBio && (
                            <p className="scroll-mt-20 xl:scroll-mt-24">{blog.authorBio}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Related Articles */}
                  {relatedBlogs.length > 0 && (
                    <div>
                      <div className="mt-6 mb-12">
                        <div className="flex flex-col gap-6">
                          <p className="heading-sm scroll-mt-20 xl:scroll-mt-24">Related articles</p>
                          <div className="flex flex-col gap-6" data-testid="blog-related-articles">
                            {relatedBlogs.map((article) => (
                              <RelatedArticle key={article.id} article={article} lang={lang} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
