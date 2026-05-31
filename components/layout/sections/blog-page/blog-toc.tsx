"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const NAVBAR_OFFSET = 96; // px — adjust to your navbar height

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Extract h1–h6 headings from the article HTML and ensure every heading has an id.
 * Returns the processed HTML (with ids injected where missing) plus the list of headings.
 */
export function processBlogContent(html: string): {
  headings: TocItem[];
  html: string;
} {
  const headings: TocItem[] = [];
  const usedIds = new Set<string>();

  const processedHtml = html.replace(
    /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_full, levelStr: string, attrs: string, inner: string) => {
      const level = parseInt(levelStr, 10);
      const text = inner
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const idMatch = attrs.match(/\sid="([^"]*)"/i);
      let id = idMatch ? idMatch[1] : slugify(text);
      if (!id) id = `section-${headings.length + 1}`;

      // Ensure uniqueness
      let unique = id;
      let counter = 2;
      while (usedIds.has(unique)) {
        unique = `${id}-${counter++}`;
      }
      usedIds.add(unique);
      id = unique;

      headings.push({ id, text, level });

      // Inject id (if missing) and append scroll-margin classes for native anchor jumps
      let newAttrs = idMatch
        ? attrs.replace(/\sid="([^"]*)"/i, ` id="${id}"`)
        : `${attrs} id="${id}"`;

      const scrollClass = "scroll-mt-20 xl:scroll-mt-24";
      if (/\sclass="/i.test(newAttrs)) {
        newAttrs = newAttrs.replace(
          /\sclass="([^"]*)"/i,
          (_m, c) => ` class="${c} ${scrollClass}"`
        );
      } else {
        newAttrs = `${newAttrs} class="${scrollClass}"`;
      }

      return `<h${level}${newAttrs}>${inner}</h${level}>`;
    }
  );

  return { headings, html: processedHtml };
}

interface BlogTableOfContentsProps {
  /** Either pass raw content (will be parsed) or a pre-extracted headings list */
  content?: string;
  headings?: TocItem[];
}

export function BlogTableOfContents({ content, headings: headingsProp }: BlogTableOfContentsProps) {
  const [expanded, setExpanded] = useState(false);
  const hiddenRef = useRef<HTMLDivElement | null>(null);
  const [hiddenHeight, setHiddenHeight] = useState(0);

  const headings = useMemo<TocItem[]>(() => {
    if (headingsProp && headingsProp.length > 0) return headingsProp;
    if (content) return processBlogContent(content).headings;
    return [];
  }, [headingsProp, content]);

  const VISIBLE_COUNT = 3;
  const visibleHeadings = headings.slice(0, VISIBLE_COUNT);
  const hiddenHeadings = headings.slice(VISIBLE_COUNT);

  // Measure hidden section so the CSS variable matches actual content height
  useEffect(() => {
    if (!hiddenRef.current) return;
    const measure = () => {
      if (hiddenRef.current) {
        setHiddenHeight(hiddenRef.current.scrollHeight);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hiddenRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [hiddenHeadings.length]);

  if (headings.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
    if (typeof window !== "undefined" && window.history?.pushState) {
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-secondary border-secondary border-md rounded-md pb-6">
      <p className="body-lg-medium scroll-mt-20 xl:scroll-mt-24">Table of Contents</p>
      <ul>
        {visibleHeadings.map((h) => (
          <li
            key={h.id}
            className="relative pt-2"
            style={{ paddingLeft: `calc(${(h.level - 1) * 1}rem)` }}
          >
            <a
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className="body-sm md:body-md"
            >
              {h.text}
            </a>
          </li>
        ))}
        {hiddenHeadings.length > 0 && (
          <div
            ref={hiddenRef}
            className="overflow-hidden transition-all duration-300 ease-out max-h-[var(--list-expanded-height)]"
            style={{
              ["--list-expanded-height" as any]: expanded ? `${hiddenHeight}px` : "0px",
            }}
          >
            {hiddenHeadings.map((h) => (
              <li
                key={h.id}
                className="relative pt-2"
                style={{ paddingLeft: `calc(${(h.level - 1) * 1}rem)` }}
              >
                <a
                  href={`#${h.id}`}
                  onClick={(e) => handleClick(e, h.id)}
                  className="body-sm md:body-md"
                >
                  {h.text}
                </a>
              </li>
            ))}
          </div>
        )}
      </ul>
      {hiddenHeadings.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="max-md:w-full text-secondary pointer-fine:hover:text-neutral-800 border-md border-transparent active:text-neutral-1000! box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus inline-flex gap-2 text-start justify-center py-[11px] body-md-medium px-0 self-center"
        >
          <span>
            {expanded ? "Close" : "Show All"}
            <span className="whitespace-nowrap ms-2">
              ⁠
              <span className="inline-flex items-center align-bottom">
                <span className="inline-flex items-center h-0">
                  <span
                    className={`transition-transform duration-200 ${
                      expanded ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown size={14} />
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
