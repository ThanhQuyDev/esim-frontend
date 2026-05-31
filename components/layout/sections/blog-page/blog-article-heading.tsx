import Link from "next/link";
import Image from "next/image";
import { Calendar, BookOpen } from "lucide-react";
import type { Blog } from "@/lib/api";
import { formatDate, formatTimeRead, authorSlug } from "./blog-detail-helpers";
import { SocialIconsCol, SocialIconsRow } from "./blog-social-icons";

export function BlogArticleHeading({ blog, lang }: { blog: Blog; lang: string }) {
  const category = blog.category;
  const authorName = blog.author || "Unknown";
  const authorAvatarUrl = blog.authorAvatar || "";
  const publishedDate = blog.publishedAt || blog.createdAt;

  return (
    <div data-section="blog article heading" data-testid="section-blog article heading" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="grid sm:gap-x-8 grid-cols-12 gap-y-8">

              {/* Title + Social Icons */}
              <div className="col-span-12 lg:col-start-2 lg:col-span-10">
                <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-row items-start justify-between gap-x-2">
                  <div>
                    <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col text-start items-start justify-start gap-y-6">
                      <div>
                        <h1 className="heading-2xl scroll-mt-20 xl:scroll-mt-24">{blog.title}</h1>
                      </div>
                      {blog.excerpt && (
                        <div>
                          <div className="flex flex-col gap-6 justify-center items-start text-start">
                            <p className="body-md w-full min-h-6 text-secondary scroll-mt-20 xl:scroll-mt-24">
                              {blog.excerpt}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <SocialIconsCol />
                  </div>
                </div>
              </div>

              {/* Author + Date + Mobile Social Icons */}
              <div className="col-span-12 lg:col-start-2 lg:col-span-10">
                <div className="flex flex-col-reverse sm:flex-row justify-between w-full h-full">
                  {/* Mobile social icons */}
                  <SocialIconsRow className="sm:hidden mt-6" />

                  {/* Author */}
                  <div className="flex">
                    <Link
                      className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus "
                      href={`/${lang}/blog/author/${authorSlug(authorName)}/`}
                    >
                      <div className="flex flex-row items-center gap-4">
                        {authorAvatarUrl && (
                          <div className="relative rounded-full overflow-hidden w-[48px] min-w-[48px] h-[48px]">
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
                        <address className="body-md text-secondary not-italic scroll-mt-20 xl:scroll-mt-24">
                          {authorName}
                        </address>
                      </div>
                    </Link>
                  </div>

                  {/* Date + Read time */}
                  <div className="flex group/stack [&>div:empty]:hidden flex-row justify-start flex-wrap items-center gap-x-4 gap-y-4 h-auto mb-6 sm:mb-0 w-auto">
                    <div>
                      <time dateTime={publishedDate} className="flex gap-2 items-center text-secondary">
                        <Calendar size={24} />
                        <p className="body-sm scroll-mt-20 xl:scroll-mt-24">{formatDate(publishedDate)}</p>
                      </time>
                    </div>
                    {blog.timeRead != null && (
                      <div>
                        <div className="flex gap-2 items-center text-secondary">
                          <BookOpen size={24} />
                          <p className="body-sm scroll-mt-20 xl:scroll-mt-24">{formatTimeRead(blog.timeRead)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              {blog.coverImage && (
                <div className="col-span-12 lg:col-start-2 lg:col-span-10">
                  <figure className="overflow-hidden rounded-sm md:rounded-md lg:rounded-lg">
                    <div>
                      <Image
                        alt={blog.title}
                        loading="eager"
                        width={968}
                        height={507}
                        style={{ color: "transparent" }}
                        sizes="(min-width: 1168px) 968px, (min-width: 992px) 796px, (min-width: 768px) 738px, (min-width: 640px) 610px, 100vw"
                        src={blog.coverImage}
                      />
                    </div>
                  </figure>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
