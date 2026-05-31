import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Blog } from "@/lib/api";
import { categorySlug } from "./blog-detail-helpers";

export function BlogBreadcrumb({ blog, lang }: { blog: Blog; lang: string }) {
  const category = blog.category;

  return (
    <div className="mx-4 sm:mx-auto">
      <div className="container mx-auto">
        <div className="grid sm:gap-x-8 grid-cols-12">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10 pt-6">
            <div className="h-full w-full flex flex-row justify-start items-center gap-x-3">
              <div>
                <Link
                  className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus text-secondary body-sm font-medium"
                  href={`/${lang}/blog/`}
                >
                  Blog
                </Link>
              </div>
              <div>
                <ChevronRight size={12} className="text-neutral-700" />
              </div>
              {category && (
                <div>
                  <Link
                    className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus text-secondary body-sm font-medium"
                    href={`/${lang}/blog/category/${categorySlug(category)}/`}
                  >
                    {category}
                  </Link>
                </div>
              )}
              {blog.parent && (
                <>
                  <div>
                    <ChevronRight size={12} className="text-neutral-700" />
                  </div>
                  <div>
                    <Link
                      className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus text-secondary body-sm font-medium"
                      href={`/${lang}/blog/category/${categorySlug(category || "")}/${categorySlug(blog.parent)}/`}
                    >
                      {blog.parent}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
