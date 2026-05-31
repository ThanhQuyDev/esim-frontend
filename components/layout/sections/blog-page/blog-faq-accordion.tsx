"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Faq } from "@/lib/api";

interface BlogFaqAccordionProps {
  faqs: Faq[];
  lang?: string;
}

export function BlogFaqAccordion({ faqs, lang = "vi" }: BlogFaqAccordionProps) {
  if (!faqs || faqs.length === 0) return null;

  const heading = lang === "vi" ? "Câu hỏi thường gặp (FAQ)" : "Frequently Asked Questions (FAQ)";

  return (
    <div className="mt-8">
      <h2 className="text-[2.5rem] font-medium mb-4 scroll-mt-20 xl:scroll-mt-24">
        {heading}
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="text-left text-[1.25rem] font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>
              <div
                className="prose prose-slate max-w-none text-[1rem] leading-[1.5] text-secondary"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
