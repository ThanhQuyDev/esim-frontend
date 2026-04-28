"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(html: string): TocItem[] {
  const regex = /<h([2-3])\s[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h[2-3]>/gi;
  const items: TocItem[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[3].replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    items.push({ id: match[2], text, level: parseInt(match[1]) });
  }
  return items;
}

export function BlogTableOfContents({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const headings = useMemo(() => extractHeadings(content), [content]);

  if (headings.length === 0) return null;

  const VISIBLE_COUNT = 3;
  const visibleHeadings = headings.slice(0, VISIBLE_COUNT);
  const hiddenHeadings = headings.slice(VISIBLE_COUNT);

  return (
    <div className="flex flex-col gap-4 p-6 bg-secondary border-secondary border-md rounded-md pb-6">
      <p className="body-lg-medium scroll-mt-20 xl:scroll-mt-24">Table of Contents</p>
      <ul>
        {visibleHeadings.map((h) => (
          <li
            key={h.id}
            style={{ paddingLeft: `calc(2rem * ${h.level - 2})` }}
            className="relative pt-2"
          >
            <a href={`#${h.id}`} className="body-sm md:body-md">
              {h.text}
            </a>
          </li>
        ))}
        {hiddenHeadings.length > 0 && (
          <div
            className={`overflow-hidden transition-all ${expanded ? "" : "max-h-0"}`}
          >
            {hiddenHeadings.map((h) => (
              <li
                key={h.id}
                style={{ paddingLeft: `calc(2rem * ${h.level - 2})` }}
                className="relative pt-2"
              >
                <a href={`#${h.id}`} className="body-sm md:body-md">
                  {h.text}
                </a>
              </li>
            ))}
          </div>
        )}
      </ul>
      {hiddenHeadings.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="max-md:w-full text-secondary pointer-fine:hover:text-neutral-800 border-md border-transparent active:text-neutral-1000! box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus inline-flex gap-2 text-start justify-center py-[11px] body-md-medium px-0 self-center"
        >
          <span>
            {expanded ? "Show Less" : "Show All"}
            <span className="whitespace-nowrap ms-2">
              ⁠
              <span className="inline-flex items-center align-bottom">
                <span className="inline-flex items-center h-0">
                  <span>
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </span>
                </span>
                ‌
              </span>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
