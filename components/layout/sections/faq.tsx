"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Section } from "@/components/ui/section";
import { useFaqs } from "@/lib/hooks";
import type { Locale } from "@/lib/i18n-config";

interface FAQSectionProps {
  dict: Record<string, any>;
  lang: Locale;
}

export function FAQSection({ dict, lang }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { data: apiFaqs } = useFaqs(lang);

  const faqItems = apiFaqs && apiFaqs.length > 0
    ? apiFaqs.map((f: any) => ({ question: f.question, answer: f.answer }))
    : dict.items;

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <Section id="faq" background="secondary">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="heading-xl text-text-primary">{dict.title}</h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((item: any, i: number) => (
            <div
              key={i}
              className={`bg-bg-primary rounded-md border-md transition-colors ${
                openIndex === i
                  ? "border-border-focus"
                  : "border-border-secondary hover:border-border-focus"
              }`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between p-5 text-left"
                aria-expanded={openIndex === i}
              >
                <span className="body-md-medium text-text-primary pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-text-tertiary flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 -mt-1">
                  <p className="body-md text-text-secondary">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
