"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useFaqs } from "@/lib/hooks";
import type { Locale } from "@/lib/i18n-config";

interface FAQSectionProps {
  dict: Record<string, any>;
  lang: Locale;
}

export function FAQSection({ dict, lang }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { data: apiFaqs } = useFaqs(lang);

  const faqItems =
    apiFaqs && apiFaqs.length > 0
      ? apiFaqs.map((f: any) => ({ question: f.question, answer: f.answer }))
      : dict.items;

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
                              <div className="flex flex-col items-start text-left gap-4 relative h-full break-words border-md transition-colors duration-300 p-0 rounded-sm bg-bg-secondary border-border-secondary hover:border-border-focus">
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
                                        className={`w-3 h-3 text-text-primary transition-transform duration-200 ${
                                          openIndex === i ? "-rotate-180" : ""
                                        }`}
                                      />
                                    </span>
                                  </button>
                                  {openIndex === i && (
                                    <section className="overflow-hidden transition-all body-md text-text-secondary mt-3">
                                      {item.answer}
                                    </section>
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
