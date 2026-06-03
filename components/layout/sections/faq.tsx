"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useFaqs } from "@/lib/hooks";
import { interpolate } from "@/lib/utils";
import type { Faq } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";

interface FAQSectionProps {
  dict: Record<string, any>;
  lang: Locale;
  initialFaqs?: Faq[];
  /**
   * Current page URL/pathname forwarded to `/api/v1/faqs/by-context` so the
   * backend returns only FAQs scoped to this page. Defaults to the current
   * pathname when omitted.
   */
  url?: string;
  /**
   * Blog id — pass when the FAQ block is rendered inside a blog detail page
   * so the API returns FAQs attached to that post.
   */
  blogId?: string;
  /**
   * Variables used to replace `${name}`-style placeholders in the FAQ
   * question/answer text. Useful on destination/region pages where the CMS
   * stores templates like `"Test with name ${name}"` and we want to inject
   * the localized destination name.
   */
  templateVars?: Record<string, string | number | null | undefined>;
}

export function FAQSection({
  dict,
  lang,
  initialFaqs,
  url,
  blogId,
  templateVars,
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const resolvedUrl = url ?? pathname ?? "";
  const { data: apiFaqs } = useFaqs(lang, initialFaqs, {
    url: resolvedUrl,
    blogId,
  });

  const rawItems =
    apiFaqs && apiFaqs.length > 0
      ? apiFaqs.map((f: any) => ({ question: f.question, answer: f.answer }))
      : dict.items;

  const faqItems = templateVars
    ? rawItems.map((item: any) => ({
        question: interpolate(item.question ?? "", templateVars),
        answer: interpolate(item.answer ?? "", templateVars),
      }))
    : rawItems;

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div
      data-section="FAQ"
      data-testid="section-FAQ"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="grid sm:gap-x-8 grid-cols-12 gap-y-8">
              <div className="col-span-12 lg:col-start-3 lg:col-span-8">
                <div className="h-full w-full flex flex-col gap-y-10">
                  <div>
                    <h2 className="heading-xl text-center scroll-mt-20 xl:scroll-mt-24">
                      {dict.title}
                    </h2>
                  </div>
                  <div>
                    <div>
                      <div>
                        <div className="grid grid-cols-1 gap-y-3">
                          {faqItems.map((item: any, i: number) => (
                            <div key={i}>
                              <div className="flex flex-col items-start text-left gap-4 relative h-full break-words border-md transition-colors duration-300 p-0 rounded-sm bg-white border-border-secondary hover:border-border-focus">
                                <li className="cursor-pointer p-4 lg:p-6 list-none w-full">
                                  <button
                                    onClick={() => toggle(i)}
                                    className="flex w-full items-center justify-between font-medium mb-0 outline-0 group transition-all focus-visible:outline-hidden focus-visible:shadow-focus"
                                    aria-expanded={openIndex === i}
                                  >
                                    <h3 className="body-lg-medium text-left text-text-primary scroll-mt-20 xl:scroll-mt-24">
                                      {item.question}
                                    </h3>
                                    <span className="ml-4">
                                      <ChevronDown
                                        className={`w-5 h-5 text-text-primary transition-transform duration-200 ${
                                          openIndex === i ? "-rotate-180" : ""
                                        }`}
                                      />
                                    </span>
                                  </button>
                                  {openIndex === i && (
                                    <section
                                      className="overflow-hidden transition-all body-md text-text-secondary mt-3 prose prose-sm max-w-none"
                                      dangerouslySetInnerHTML={{ __html: item.answer }}
                                    />
                                  )}
                                </li>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
