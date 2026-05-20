"use client";

import { ArrowRight, Calendar, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { useBlogs } from "@/lib/hooks";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

interface BlogSectionProps {
  dict: Dictionary["blog"];
  lang: Locale;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return ""; }
}

const placeholderGradients = [
  "from-primary/30 via-saily-teal/20 to-saily-blue/30",
  "from-accent/30 via-primary/20 to-saily-teal/30",
  "from-saily-blue/30 via-accent/20 to-primary/30",
];

export function BlogSection({ dict, lang }: BlogSectionProps) {
  const { data: apiBlogs, isLoading } = useBlogs(lang, 6);

  // Use API data if available, otherwise fallback
  const blogs =
    apiBlogs && apiBlogs.length > 0
      ? apiBlogs.slice(0, 3).map((b) => ({
          id: b.id, title: b.title, slug: b.slug, excerpt: b.excerpt,
          coverImage: b.coverImage, author: b.author, tags: b.tags,
          publishedAt: b.publishedAt,
        }))
      : dict.fallback.map((b, i) => ({
          id: String(i), title: b.title, slug: b.slug, excerpt: b.excerpt,
          coverImage: null as string | null, author: b.author, tags: b.tags,
          publishedAt: null as string | null,
        }));

  return (
    <section id="blog" className="relative gradient-bg-section-alt py-24 md:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/[0.08] border border-accent/[0.15] mb-6">
              <span className="text-sm text-accent font-medium">{dict.badge}</span>
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-4 tracking-tight">
              {dict.title}<span className="gradient-text-purple">{dict.titleHighlight}</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{dict.subtitle}</p>
          </div>
          <Link href="#" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium group">
            {dict.viewAll}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((post, index) => (
            <article key={post.id} className="group glass-card-hover overflow-hidden flex flex-col">
              <div className="relative aspect-[16/10] overflow-hidden">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${placeholderGradients[index % 3]} flex items-center justify-center`}>
                    <span className="text-4xl opacity-40">📝</span>
                  </div>
                )}
                {post.tags && (
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    {post.tags.split(",").slice(0, 2).map((tag) => (
                      <span key={tag.trim()} className="text-[12px] font-medium px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/90">{tag.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  {post.publishedAt && (
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.publishedAt)}</span>
                  )}
                  {post.author && (
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                  )}
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2.5 line-clamp-2 group-hover:text-primary transition-colors duration-300">{post.title}</h3>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
                )}
                <Link href="#" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:text-primary/80 transition-colors mt-auto group/link">
                  {dict.readMore}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
