"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const NAVBAR_OFFSET = 120; // px — sticky offset for help-center
const VISIBLE_COUNT = 5;

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
 * Extract <h2> headings from article HTML and ensure each one has a stable id.
 * Returns the processed HTML (with ids injected when missing) and the heading list.
 */
export function processArticleContent(html: string): {
  headings: TocItem[];
  html: string;
} {
  const headings: TocItem[] = [];
  const usedIds = new Set<string>();

  const processedHtml = html.replace(
    /<h2([^>]*)>([\s\S]*?)<\/h2>/gi,
    (_full, attrs: string, inner: string) => {
      const text = inner
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const idMatch = attrs.match(/\sid="([^"]*)"/i);
      let id = idMatch ? idMatch[1] : slugify(text);
      if (!id) id = `section-${headings.length + 1}`;

      let unique = id;
      let counter = 2;
      while (usedIds.has(unique)) {
        unique = `${id}-${counter++}`;
      }
      usedIds.add(unique);
      id = unique;

      headings.push({ id, text, level: 2 });

      let newAttrs = idMatch
        ? attrs.replace(/\sid="([^"]*)"/i, ` id="${id}"`)
        : `${attrs} id="${id}"`;

      const scrollClass = "scroll-mt-24 xl:scroll-mt-32";
      if (/\sclass="/i.test(newAttrs)) {
        newAttrs = newAttrs.replace(
          /\sclass="([^"]*)"/i,
          (_m, c) => ` class="${c} ${scrollClass}"`
        );
      } else {
        newAttrs = `${newAttrs} class="${scrollClass}"`;
      }

      return `<h2${newAttrs}>${inner}</h2>`;
    }
  );

  return { headings, html: processedHtml };
}

interface ArticleTocProps {
  /** Pre-extracted headings (preferred) */
  headings?: TocItem[];
  /** Raw HTML — will be parsed if headings is not supplied */
  content?: string;
  lang?: string;
}

export function ArticleToc({ headings: headingsProp, content, lang = "en" }: ArticleTocProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  const headings = useMemo<TocItem[]>(() => {
    if (headingsProp && headingsProp.length > 0) return headingsProp;
    if (content) return processArticleContent(content).headings;
    return [];
  }, [headingsProp, content]);

  const visibleHeadings = headings.slice(0, VISIBLE_COUNT);
  const hiddenHeadings = headings.slice(VISIBLE_COUNT);

  // Memoize the heading IDs so the effect only re-runs when the actual list changes
  const headingIds = useMemo(() => headings.map((h) => h.id).join("|"), [headings]);

  // When the user clicks a TOC item we trigger smooth scroll. The native
  // scroll listener would otherwise flicker the active state through every
  // intermediate heading. We "lock" the tracker until the scroll settles.
  const lockedRef = useRef(false);
  const lockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockedTargetRef = useRef<string | null>(null);

  // Track which heading is currently active based on scroll position.
  useEffect(() => {
    if (headings.length === 0) return;

    const ACTIVATION_OFFSET = NAVBAR_OFFSET + 24;
    let rafId: number | null = null;
    let elements: { id: string; el: HTMLElement }[] = [];

    const refreshElements = () => {
      elements = headings
        .map((h) => ({ id: h.id, el: document.getElementById(h.id) }))
        .filter((x): x is { id: string; el: HTMLElement } => x.el !== null);
    };

    const updateActive = () => {
      rafId = null;
      // While a click-driven smooth scroll is in flight, freeze the active
      // state on the click target instead of tracking the scroll position.
      if (lockedRef.current) return;

      if (elements.length === 0) refreshElements();
      if (elements.length === 0) return;

      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;

      // At the bottom of the page → highlight the last heading
      if (scrollY + winHeight >= docHeight - 4) {
        setActiveId(elements[elements.length - 1].id);
        return;
      }

      // Find the last heading whose top has crossed the activation line.
      let currentId = "";
      for (const { id, el } of elements) {
        const top = el.getBoundingClientRect().top;
        if (top - ACTIVATION_OFFSET <= 0) {
          currentId = id;
        } else {
          break;
        }
      }

      // If we haven't scrolled past the first heading yet, default to the first
      if (!currentId) currentId = elements[0].id;

      setActiveId(currentId);
    };

    const requestUpdate = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(updateActive);
    };

    // Initial population — try a few times since the article HTML
    // (rendered via dangerouslySetInnerHTML) may not be in the DOM yet on first run.
    let attempts = 0;
    const tryInit = () => {
      refreshElements();
      if (elements.length > 0) {
        updateActive();
        return;
      }
      if (attempts++ < 10) {
        setTimeout(tryInit, 50);
      }
    };
    tryInit();

    // Watch the article body for DOM changes — when headings are inserted later
    // (e.g., async rich-text load), refresh the element references. We scope
    // the observer to a likely article container to avoid unnecessary work.
    const mutationTarget =
      document.querySelector(".hc-article-body") ?? document.body;
    const mutationObserver = new MutationObserver(() => {
      refreshElements();
      if (elements.length > 0) requestUpdate();
    });
    mutationObserver.observe(mutationTarget, {
      childList: true,
      subtree: true,
    });

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      mutationObserver.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headingIds]);

  if (headings.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;

    // Lock the scroll tracker so it doesn't flicker through intermediate
    // headings while the smooth scroll animation runs.
    lockedRef.current = true;
    lockedTargetRef.current = id;
    setActiveId(id);

    if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);

    // Detect when the scroll has settled. We check the position vs. the target
    // every animation frame; once it stops changing for a few frames, release.
    let lastY = window.scrollY;
    let stableFrames = 0;
    let rafId: number;

    const checkSettled = () => {
      const currentY = window.scrollY;
      const reached = Math.abs(currentY - top) < 2;
      if (reached || lastY === currentY) {
        stableFrames++;
        if (stableFrames >= 3) {
          lockedRef.current = false;
          lockedTargetRef.current = null;
          return;
        }
      } else {
        stableFrames = 0;
      }
      lastY = currentY;
      rafId = requestAnimationFrame(checkSettled);
    };

    window.scrollTo({ top, behavior: "smooth" });
    rafId = requestAnimationFrame(checkSettled);

    // Hard timeout fallback in case scroll never settles (very long pages,
    // user interrupts the scroll, etc.)
    lockTimeoutRef.current = setTimeout(() => {
      lockedRef.current = false;
      lockedTargetRef.current = null;
      cancelAnimationFrame(rafId);
    }, 1200);

    if (typeof window !== "undefined" && window.history?.pushState) {
      window.history.pushState(null, "", `#${id}`);
    }
  };

  const showAllText = lang === "vi"
    ? `Hiện tất cả (${hiddenHeadings.length} thêm)`
    : `Show all (${hiddenHeadings.length} more)`;
  const showLessText = lang === "vi" ? "Thu gọn" : "Show less";
  const tocTitle = lang === "vi" ? "Mục lục" : "Table of Contents";

  return (
    <nav
      aria-label="Table of contents"
      className="max-h-[calc(100vh-160px)] overflow-y-auto"
    >
      <div className="text-base font-semibold text-gray-900 mb-4">{tocTitle}</div>
      <ul className="list-none p-0 m-0 space-y-2 border-l border-gray-200">
        {visibleHeadings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <li key={h.id} className="leading-snug">
              <a
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
                className={`block -ml-px pl-3 py-1 text-sm border-l-2 transition-colors no-underline ${isActive
                    ? "border-[#ffdc52] !border-l-[4px] text-gray-900 font-medium"
                    : "border-l-transparent text-gray-600 hover:text-gray-900 hover:border-l-gray-300"
                  }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
        {hiddenHeadings.length > 0 && (
          <li
            className={`overflow-hidden transition-all duration-300 ease-out ${expanded ? "max-h-[2000px]" : "max-h-0"
              }`}
            aria-hidden={!expanded}
          >
            <ul className="list-none p-0 m-0 space-y-2">
              {hiddenHeadings.map((h) => {
                const isActive = activeId === h.id;
                return (
                  <li key={h.id} className="leading-snug">
                    <a
                      href={`#${h.id}`}
                      onClick={(e) => handleClick(e, h.id)}
                      tabIndex={expanded ? 0 : -1}
                      className={`block -ml-px pl-3 py-1 text-sm border-l-2 transition-colors no-underline ${isActive
                          ? "border-l-gray-900 text-gray-900 font-medium"
                          : "border-l-transparent text-gray-600 hover:text-gray-900 hover:border-l-gray-300"
                        }`}
                    >
                      {h.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </li>
        )}
      </ul>
      {hiddenHeadings.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-3 inline-flex items-center gap-1 pl-3 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer bg-transparent border-0"
        >
          <span>{expanded ? showLessText : showAllText}</span>
          <span
            className={`inline-block w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-current transition-transform duration-200 ${expanded ? "rotate-180" : ""
              }`}
            aria-hidden="true"
          />
        </button>
      )}
    </nav>
  );
}
