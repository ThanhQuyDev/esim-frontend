"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTopDestinations, useSearchDestinations, useSearchRegions, useRegions } from "@/lib/hooks";
import { useDebounce } from "@/lib/use-debounce";
import type { Locale } from "@/lib/i18n-config";

interface DestinationSearchModalProps {
  lang: Locale;
  open: boolean;
  onClose: () => void;
}

export function DestinationSearchModal({
  lang,
  open,
  onClose,
}: DestinationSearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const hasSearch = debouncedQuery.trim().length > 0;

  // Fetch top/popular destinations
  const { data: topDestinations = [], isLoading: isLoadingTop } =
    useTopDestinations(10);

  // Fetch regions (for combining popular ones in Top 10)
  const { data: allRegions = [], isLoading: isLoadingRegions } = useRegions(
    JSON.stringify({ isPopular: true }),
    "name",
    "ASC",
    20
  );

  // Search destinations
  const { data: searchDestinations = [], isFetching: isSearchingDest } =
    useSearchDestinations(debouncedQuery, hasSearch);

  // Search regions
  const { data: searchRegions = [], isFetching: isSearchingReg } =
    useSearchRegions(debouncedQuery, hasSearch);

  // Combined Top 10: popular destinations + regions
  const top10Combined = (() => {
    const countryItems = topDestinations.map((d: any) => ({ ...d, _type: "destination" as const }));
    const regionItems = allRegions.map((r: any) => ({ ...r, _type: "region" as const }));
    return [...countryItems, ...regionItems].slice(0, 10);
  })();

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [open]);

  // Close on Escape + lock body scroll
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleSelect = useCallback(
    (slug: string) => {
      onClose();
      // Navigate to destination page
      window.location.href = `/${lang}/${slug}`;
    },
    [lang, onClose]
  );

  const handleSelectRegion = useCallback(
    (slug: string) => {
      onClose();
      window.location.href = `/${lang}/${slug}`;
    },
    [lang, onClose]
  );

  if (!open) return null;

  const isLoading = hasSearch
    ? isSearchingDest || isSearchingReg
    : isLoadingTop || isLoadingRegions;

  // Format price helper
  const formatPrice = (price: number | string | undefined) => {
    const num = Number(price);
    if (!num || isNaN(num)) return null;
    return `${num.toLocaleString("vi-VN")}₫`;
  };

  // Merge search results: destinations first, then regions
  const mergedResults = hasSearch
    ? [
      ...searchDestinations.map((d: any) => ({
        ...d,
        _type: "destination" as const,
      })),
      ...searchRegions.map((r: any) => ({
        ...r,
        _type: "region" as const,
        name: r.name,
        slug: r.slug,
        flagUrl: r.avatarUrl || r.flagUrl,
        destinationCount: r.destinationCount,
      })),
    ]
    : [];

  return (
    <div
      data-testid="search-destinations-modal"
      className="fixed inset-0 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-[4px] z-50 animate-fade-in"
      tabIndex={-1}
    >
      <div className="w-full md:w-[640px] shadow-lg text-text-primary">
        <div
          className="rounded-t-md md:rounded-md overflow-hidden py-6 md:py-8 max-h-[99dvh] md:max-h-[80vh] flex flex-col h-[99dvh] md:h-[554px] bg-white"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          {/* Header */}
          <div className="flex justify-between items-start px-4 sm:px-6 md:px-8 pb-6">
            <p className="heading-lg w-full mr-4 scroll-mt-20 xl:scroll-mt-24">
              {lang === "vi" ? "Đi đâu?" : "Where?"}
            </p>
            <button
              type="button"
              data-testid="general-modal-close-button"
              aria-label="Close"
              className="ml-auto"
              onClick={onClose}
            >
              <svg
                className="w-6 h-6 text-text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-x-hidden overflow-y-auto relative flex flex-col h-full px-4 sm:px-6 md:px-8 w-[calc(100%+.75rem)] [&>*]:pr-3">
            {/* Search Input */}
            <div id="input-wrapper" className="relative mb-6">
              <input
                data-testid="search-input"
                placeholder={
                  lang === "vi" ? "Nhập điểm đến của bạn" : "Enter your destination"
                }
                autoComplete="off"
                className="outline-hidden focus-visible:outline-none appearance-none w-full leading-md py-[11px] px-4 pr-10 text-text-primary placeholder-text-tertiary border border-border-primary border-md hover:border-border-focus active:border-border-focus focus:border-border-focus transition rounded-sm"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                name="search-input"
                ref={inputRef}
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-1 text-text-tertiary bg-bg-secondary rounded-full hover:text-text-primary transition-colors"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Results */}
            <div
              id="country-list-items"
              className="grid gap-3 lg:gap-6 w-full md:grid-cols-2 lg:grid-cols-3 md:h-[363px] overflow-y-auto"
            >
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <svg
                    className="animate-spin h-6 w-6 text-text-tertiary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </div>
              ) : hasSearch ? (
                mergedResults.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 gap-4">
                    <p className="body-sm-medium text-text-secondary">
                      {lang === "vi"
                        ? "Không tìm thấy điểm đến"
                        : "No destinations found"}
                    </p>
                    <a
                      role="button"
                      href={`/${lang}/destinations`}
                      className="text-center inline-block text-primary pointer-fine:hover:bg-brand-black pointer-fine:hover:text-primary-on-color border-md border-black active:bg-brand-black active:text-primary-on-color box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
                    >
                      {lang === "vi"
                        ? "Xem tất cả điểm đến"
                        : "View all destinations"}
                    </a>
                  </div>
                ) : (
                  mergedResults.map((item: any) => {
                    const isRegion = item._type === "region";
                    const href = `/${lang}/${item.slug}`;
                    const priceStr = item.minPrice || item.fromPrice
                      ? formatPrice(item.minPrice || item.fromPrice)
                      : null;
                    const subtitle = isRegion
                      ? [
                        `${item.destinationCount || 0} ${lang === "vi"
                          ? "quốc gia"
                          : (item.destinationCount === 1 ? "country" : "countries")
                        }`,
                        priceStr ? `${lang === "vi" ? "Từ" : "From"} ${priceStr}` : null,
                      ].filter(Boolean).join(" · ")
                      : priceStr
                        ? `${lang === "vi" ? "Từ" : "From"} ${priceStr}`
                        : null;

                    return (
                      <div key={`${item._type}-${item.id}`}>
                        <a
                          href={href}
                          className="align-bottom focus-visible:outline-hidden focus-visible:shadow-focus text-text-primary active:text-text-primary hover:text-text-secondary block h-full group ease-out rounded-[8px] transition-colors duration-medium hover:bg-bg-primary active:bg-bg-primary"
                          data-ga-slug="N/A"
                          data-testid={item.countryCode || item.slug}
                          data-anchor-link="true"
                          onClick={(e) => {
                            e.preventDefault();
                            if (isRegion) handleSelectRegion(item.slug);
                            else handleSelect(item.slug);
                          }}
                        >
                          <div
                            className="flex flex-col items-start text-left rtl:text-right gap-4 relative h-full bg-white word-break-word transform-gpu border-none p-0 rounded-[8px] transition-colors duration-medium hover:bg-bg-secondary active:bg-bg-primary"
                            data-testid="destination-card-minified-undefined"
                          >
                            <div className="flex gap-3 items-center p-3">
                              <div className="w-[24px] h-[24px] relative overflow-hidden shrink-0 rounded-full">
                                {item.flagUrl ? (
                                  <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      alt={`${item.countryCode || item.slug} flag`}
                                      loading="lazy"
                                      decoding="async"
                                      className="w-full h-full object-cover"
                                      src={item.flagUrl}
                                      style={{
                                        position: "absolute",
                                        height: "100%",
                                        width: "100%",
                                        inset: 0,
                                        color: "transparent",
                                      }}
                                    />
                                    <div className="absolute inset-0 border-md rounded-full pointer-events-none border-[rgba(0,0,0,0.1)]" />
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-bg-blue-100 rounded-full">
                                    <svg
                                      className="w-3 h-3 text-text-tertiary"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <p className="body-md-medium text-text-primary! scroll-mt-20 xl:scroll-mt-24">
                                  {(lang === "vi" ? item.titleVi : item.title) || item.name}
                                </p>
                                {subtitle && (
                                  <p className="text-xs text-text-tertiary scroll-mt-20 xl:scroll-mt-24">
                                    <span className="whitespace-normal">
                                      {subtitle}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    );
                  })
                )
              ) : (
                /* Default: Most popular destinations + regions */
                <>
                  <p className="body-sm-medium text-text-secondary mb-2 md:mb-3 col-span-full scroll-mt-20 xl:scroll-mt-24">
                    {lang === "vi"
                      ? "Điểm đến phổ biến nhất"
                      : "Most popular destinations"}
                  </p>
                  {top10Combined.map((item: any) => {
                    const isRegionItem = item._type === "region";
                    const priceStr = (item.minPrice || item.fromPrice)
                      ? formatPrice(item.minPrice || item.fromPrice)
                      : null;
                    const subtitle = isRegionItem
                      ? [
                        `${item.destinationCount || 0} ${lang === "vi" ? "quốc gia" : (item.destinationCount === 1 ? "country" : "countries")}`,
                        priceStr ? `${lang === "vi" ? "Từ" : "From"} ${priceStr}` : null,
                      ].filter(Boolean).join(" · ")
                      : priceStr
                        ? `${lang === "vi" ? "Từ" : "From"} ${priceStr}`
                        : null;
                    const href = lang === 'vi' ? `/${item.slug}` : `/${lang}/${item.slug}`;

                    return (
                      <div key={`${item._type}-${item.id}`}>
                        <a
                          href={href}
                          className="align-bottom focus-visible:outline-hidden focus-visible:shadow-focus text-text-primary active:text-text-primary hover:text-text-secondary block h-full group ease-out rounded-[8px] transition-colors duration-medium hover:bg-bg-primary active:bg-bg-primary"
                          data-ga-slug="N/A"
                          data-testid={item.countryCode || item.slug}
                          data-anchor-link="true"
                          onClick={(e) => {
                            e.preventDefault();
                            if (isRegionItem) handleSelectRegion(item.slug);
                            else handleSelect(item.slug);
                          }}
                        >
                          <div
                            className="flex flex-col items-start text-left rtl:text-right gap-4 relative h-full bg-white hover:bg-bg-secondary word-break-word transform-gpu border-none p-0 rounded-[8px] transition-colors duration-medium active:bg-bg-primary"
                            data-testid="destination-card-minified-undefined"
                          >
                            <div className="flex gap-3 items-center p-3">
                              <div className="w-[24px] h-[24px] relative overflow-hidden shrink-0 rounded-full">
                                {(item.flagUrl || item.iconUrl) ? (
                                  <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      alt={`${item.countryCode || item.slug} ${isRegionItem ? 'avatar' : 'flag'}`}
                                      loading="lazy"
                                      decoding="async"
                                      className="w-full h-full object-cover"
                                      src={item.flagUrl || item.iconUrl}
                                      style={{
                                        position: "absolute",
                                        height: "100%",
                                        width: "100%",
                                        inset: 0,
                                        color: "transparent",
                                      }}
                                    />
                                    <div className="absolute inset-0 border-md rounded-full pointer-events-none border-[rgba(0,0,0,0.1)]" />
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-bg-blue-100 rounded-full">
                                    <svg
                                      className="w-3 h-3 text-text-tertiary"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <p className="body-md-medium text-text-primary! scroll-mt-20 xl:scroll-mt-24">
                                    {(lang === "vi" ? item.titleVi : item.title) || item.name}
                                  </p>
                                  {isRegionItem && (
                                    <span className="text-center whitespace-nowrap rounded-full inline-block bg-blue-100 text-blue-700 py-0 px-1.5 body-2xs-medium">
                                      {lang === "vi" ? "Khu vực" : "Region"}
                                    </span>
                                  )}
                                </div>
                                {subtitle && (
                                  <p className="body-xs text-text-tertiary scroll-mt-20 xl:scroll-mt-24">
                                    <span className="whitespace-normal">
                                      {subtitle}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
