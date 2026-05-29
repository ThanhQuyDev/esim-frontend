"use client";

import Link from "next/link";
import { MessageCircle, Mail, FileText, ArrowRight } from "lucide-react";
import type { HelpCenterArticle } from "@/lib/api";
import { localizedHref } from "@/lib/route-mapping";

interface ArticleFooterProps {
  lang: string;
  /** Currently displayed article — used to filter it out of related results. */
  currentArticle: HelpCenterArticle;
  /** Full article catalog so we can derive related items client-side. */
  allArticles: HelpCenterArticle[];
  /** URL builder for an article slug. */
  buildHref: (article: HelpCenterArticle) => string;
}

const VI = {
  ctaTitle: "Bạn vẫn cần hỗ trợ?",
  ctaSubtitle:
    "Đội ngũ tư vấn của esim.vn luôn sẵn sàng giúp bạn — chat trực tiếp hoặc gửi yêu cầu hỗ trợ chỉ trong vài giây.",
  ctaChat: "Chat với tư vấn viên",
  ctaTicket: "Gửi yêu cầu hỗ trợ",
  relatedTitle: "Bài viết liên quan",
  relatedSubtitle: "Khám phá thêm các nội dung cùng chủ đề.",
  readMore: "Đọc tiếp",
};

const EN = {
  ctaTitle: "Still need a hand?",
  ctaSubtitle:
    "Our support team is one click away — start a live chat or send us a support ticket and we'll take it from there.",
  ctaChat: "Chat with us",
  ctaTicket: "Submit a ticket",
  relatedTitle: "Related articles",
  relatedSubtitle: "Keep exploring topics close to this one.",
  readMore: "Read more",
};

/**
 * Open the global support chat bubble. The chat widget is mounted via
 * `layout-client-widgets` and registers a button with `id="chat-bubble-toggle"`
 * which toggles the conversation pane.
 */
function openChatBubble() {
  if (typeof document === "undefined") return;
  const toggle = document.getElementById("chat-bubble-toggle") as HTMLButtonElement | null;
  toggle?.click();
}

/**
 * Pick 3–5 articles related to the current one. Priority:
 *   1. Same category + same parent (closest siblings)
 *   2. Same category, different parent
 *   3. Same parent across categories
 * Always excludes the current article and trims to a max of 5 entries.
 */
function selectRelated(
  current: HelpCenterArticle,
  pool: HelpCenterArticle[],
  max = 5
): HelpCenterArticle[] {
  if (!current || pool.length === 0) return [];

  const others = pool.filter((a) => a.id !== current.id);
  const byScore = others
    .map((a) => {
      let score = 0;
      if (a.category === current.category) score += 2;
      if (a.parent === current.parent) score += 3;
      return { article: a, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.article.order - b.article.order);

  return byScore.slice(0, max).map((x) => x.article);
}

export function ArticleFooter({
  lang,
  currentArticle,
  allArticles,
  buildHref,
}: ArticleFooterProps) {
  const t = lang === "vi" ? VI : EN;
  const related = selectRelated(currentArticle, allArticles, 5);
  const ticketHref = `${localizedHref(lang, "help-center")}/support`;

  return (
    <div className="mt-12 pt-10 border-t border-gray-200 space-y-10">
      {/* === 1. Call-to-Action === */}
      <section
        aria-labelledby="article-cta-title"
        className="rounded-2xl border border-gray-200 bg-gradient-to-br from-amber-50 via-white to-amber-50/40 p-6 sm:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <h3
              id="article-cta-title"
              className="text-xl md:text-2xl font-semibold text-gray-900 mb-2"
            >
              {t.ctaTitle}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
              {t.ctaSubtitle}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              type="button"
              onClick={openChatBubble}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              {t.ctaChat}
            </button>
            <Link
              href={ticketHref}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {t.ctaTicket}
            </Link>
          </div>
        </div>
      </section>

      {/* === 2. Related Articles === */}
      {related.length >= 3 && (
        <section aria-labelledby="article-related-title">
          <div className="mb-5">
            <h3
              id="article-related-title"
              className="text-xl md:text-2xl font-semibold text-gray-900 mb-1"
            >
              {t.relatedTitle}
            </h3>
            <p className="text-sm text-gray-500">{t.relatedSubtitle}</p>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
            {related.map((article) => (
              <li key={article.id}>
                <Link
                  href={buildHref(article)}
                  className="group flex flex-col h-full p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all no-underline"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 shrink-0">
                      <FileText className="w-4 h-4 text-amber-700" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-3 group-hover:text-gray-700">
                      {article.title}
                    </p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    {t.readMore}
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
