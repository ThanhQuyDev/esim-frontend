"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useFaqs } from "@/lib/hooks";
import type { Locale } from "@/lib/i18n-config";

interface FaqTabsSectionProps {
  dict: Record<string, any>;
  lang: Locale;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqTab {
  label: string;
  items: FaqItem[];
}

export function FaqTabsSection({ dict, lang }: FaqTabsSectionProps) {
  const tabs: FaqTab[] = dict.tabs || [];
  const [activeTab, setActiveTab] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const pathname = usePathname();
  const { data: apiFaqs } = useFaqs(lang, undefined, { url: pathname ?? "" });

  // Use API data if available, otherwise fall back to dictionary tabs
  const apiItems: FaqItem[] =
    apiFaqs && apiFaqs.length > 0
      ? apiFaqs.map((f: any) => ({ question: f.question, answer: f.answer }))
      : [];

  const hasApiData = apiItems.length > 0;

  const currentItems = hasApiData
    ? apiItems
    : tabs[activeTab]?.items || [];

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="py-16">
      <div className="mx-4 sm:mx-auto">
        <div className="container mx-auto">
          <div className="grid sm:gap-x-8 grid-cols-12 gap-y-8">
            <div className="col-span-12 lg:col-start-3 lg:col-span-8">
              <h2 className="heading-xl text-center text-text-primary">
                {dict.title}
              </h2>
            </div>
            <div className="col-span-12 lg:col-start-3 lg:col-span-8">
              {/* Tabs — only show when using dictionary data (no API data) */}
              {!hasApiData && tabs.length > 0 && (
                <div className="flex gap-1 pb-4 scrollbar-none overflow-auto">
                  <div className="relative flex gap-1 w-full">
                    {tabs.map((tab, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setActiveTab(i);
                          setOpenIndex(null);
                        }}
                        className={`relative z-[1] body-md text-ellipsis flex max-w-[165px] px-6 pb-3 transition-colors ${
                          activeTab === i
                            ? "text-text-primary after:w-full"
                            : "text-text-tertiary hover:text-text-primary after:w-0"
                        } first:ml-auto last:mr-auto after:absolute after:block after:content-[''] after:bottom-0 after:inset-x-0 after:border-b-2 after:border-text-primary after:transition-[width]`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ Items */}
              <div className={!hasApiData && tabs.length > 0 ? "pt-6" : ""}>
                <div className="grid grid-cols-1 gap-y-3">
                  {currentItems.map((item, i) => (
                    <div
                      key={i}
                      className={`bg-primary rounded-sm border-md transition-colors ${
                        openIndex === i
                          ? "border-border-focus"
                          : "border-border-secondary hover:border-border-focus"
                      }`}
                    >
                      <button
                        onClick={() => toggle(i)}
                        className="w-full flex items-center justify-between p-4 lg:p-6 text-left"
                        aria-expanded={openIndex === i}
                      >
                        <h3 className="body-lg-medium text-text-primary pr-4">
                          {item.question}
                        </h3>
                        <span className="ml-4 shrink-0">
                          <ChevronDown
                            className={`w-6 h-6 text-text-primary transition-transform duration-200 ${
                              openIndex === i ? "rotate-180" : ""
                            }`}
                          />
                        </span>
                      </button>
                      {openIndex === i && (
                        <div
                          className="px-4 lg:px-6 pb-4 lg:pb-6 -mt-1 body-md text-text-secondary prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.answer }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
