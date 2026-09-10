"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AffiliateFaqProps {
  dict: Record<string, any>;
}

/**
 * Programme FAQ (#095, ý 4).
 *
 * Written into the dictionary rather than pulled from the CMS FAQ endpoint on
 * purpose: the brief asks for a static page, and a CMS-backed block would ship
 * empty until somebody adds rows for this URL. Thọ can still add extra
 * questions in the CMS later — that block renders nothing when it has none.
 */
export function AffiliateFaq({ dict }: AffiliateFaqProps) {
  const items: { question: string; answer: string }[] = dict.items ?? [];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <div
      data-section="affiliate-faq"
      data-testid="section-affiliate-faq"
      className="relative scroll-mt-20 xl:scroll-mt-24 bg-gray-50/70"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="mx-auto max-w-3xl">
              <h2 className="heading-xl text-primary text-center">
                {dict.title}
              </h2>

              <div className="mt-10 grid grid-cols-1 gap-y-3">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-sm border border-gray-200 bg-white transition-colors duration-300 hover:border-gray-300"
                  >
                    <div className="p-4 lg:p-6">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenIndex(openIndex === i ? null : i)
                        }
                        className="group flex w-full items-center justify-between font-medium outline-0"
                        aria-expanded={openIndex === i}
                      >
                        <h3 className="body-lg-medium text-primary text-left">
                          {item.question}
                        </h3>
                        <span className="ml-4">
                          <ChevronDown
                            className={`h-6 w-6 text-primary transition-transform duration-200 ${
                              openIndex === i ? "-rotate-180" : ""
                            }`}
                            aria-hidden="true"
                          />
                        </span>
                      </button>
                      {openIndex === i && (
                        <p className="body-md text-secondary mt-4">
                          {item.answer}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
