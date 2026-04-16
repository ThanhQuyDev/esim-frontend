"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface EsimFaqProps {
  dict: Record<string, any>;
}

export function EsimFaq({ dict }: EsimFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section data-section="faq" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="grid sm:gap-x-8 grid-cols-12 gap-y-8">
              <div className="col-span-12 lg:col-start-3 lg:col-span-8">
                <div className="flex flex-col gap-y-10">
                  <h2 className="heading-xl text-center">{dict.title}</h2>
                  <div className="grid grid-cols-1 gap-y-3">
                    {dict.items.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="flex flex-col items-start text-left relative h-full border border-border-secondary rounded-sm bg-bg-secondary hover:border-border-focus transition-colors"
                      >
                        <div className="cursor-pointer p-4 lg:p-6 list-none w-full">
                          <button
                            className="flex w-full items-center justify-between font-medium outline-0 group transition-all focus-visible:outline-none focus-visible:shadow-focus"
                            aria-expanded={openIndex === i}
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                          >
                            <h3 className="body-lg-medium text-left text-text-primary">
                              {item.question}
                            </h3>
                            <span className="ml-4 shrink-0">
                              <ChevronDown
                                className={`w-3 h-3 text-text-primary transition-transform ${
                                  openIndex === i ? "-rotate-180" : ""
                                }`}
                              />
                            </span>
                          </button>
                          {openIndex === i && (
                            <div className="mt-3 body-md text-text-secondary">
                              {item.answer}
                            </div>
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
      </div>
    </section>
  );
}
