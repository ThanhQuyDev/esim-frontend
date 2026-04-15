"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Loader2, X, ChevronRight } from "lucide-react";
import { useTopDestinations, useSearchDestinations } from "@/lib/hooks";
import { useDebounce } from "@/lib/use-debounce";
import type { Locale } from "@/lib/i18n-config";

export interface DestinationSearchProps {
  lang: Locale;
  open: boolean;
  onClose: () => void;
  placeholder?: string;
}

export function DestinationSearch({
  lang,
  open,
  onClose,
  placeholder = "Search for a country or region",
}: DestinationSearchProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"top" | "country" | "region">("top");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the search query by 300ms
  // When debouncedQuery changes, React Query fires a new request
  // and automatically cancels the previous in-flight request via AbortController
  const debouncedQuery = useDebounce(query, 300);

  // React Query hooks - search uses AbortController signal for cancellation
  const { data: topDestinations = [], isLoading: isLoadingTop } =
    useTopDestinations(10);

  const {
    data: searchResults = [],
    isFetching: isSearchFetching,
  } = useSearchDestinations(
    debouncedQuery,
    debouncedQuery.trim().length > 0
  );

  // Focus input when modal opens
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
    (dest: { name: string }) => {
      onClose();
      const el = document.getElementById("destinations");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    },
    [onClose]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  if (!open) return null;

  const isActiveSearch = debouncedQuery.trim().length > 0;
  const displayDestinations = isActiveSearch ? searchResults : topDestinations;
  const showLoading = isActiveSearch ? isSearchFetching : isLoadingTop;

  const tabs = [
    { key: "top" as const, label: "Top 10" },
    { key: "country" as const, label: lang === "vi" ? "Quốc gia" : "Country" },
    { key: "region" as const, label: lang === "vi" ? "Khu vực" : "Region" },
  ];

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative mx-auto mt-20 w-full max-w-2xl px-4">
        <div className="bg-bg-primary rounded-lg shadow-lg overflow-hidden animate-fade-in-up">
          {/* Search Input */}
          <div className="p-4 border-b border-border-primary">
            <div className="relative">
              {showLoading ? (
                <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary animate-spin" />
              ) : (
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-bg-secondary border border-border-primary rounded-lg body-md text-text-primary placeholder:text-text-disabled outline-none pl-12 pr-12 py-3 focus:border-border-focus focus:ring-1 focus:ring-border-focus/20 transition-all"
                aria-label="Search destinations"
              />
              {query ? (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-bg-secondary flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-border-primary transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs - only show when not actively searching */}
          {!isActiveSearch && (
            <div className="px-4 pt-4">
              <div className="relative flex bg-bg-secondary rounded-full p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative z-10 body-sm-medium whitespace-nowrap px-4 py-1.5 rounded-full min-w-[60px] transition-colors ${
                      activeTab === tab.key
                        ? "bg-bg-primary text-text-primary shadow-sm"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search status indicator */}
          {isActiveSearch && (
            <div className="px-4 pt-3">
              <p className="body-xs text-text-tertiary">
                {isSearchFetching
                  ? lang === "vi" ? "Đang tìm kiếm..." : "Searching..."
                  : `${searchResults.length} ${lang === "vi" ? "kết quả" : "result"}${searchResults.length !== 1 && lang === "en" ? "s" : ""}`}
              </p>
            </div>
          )}

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {showLoading && displayDestinations.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-text-tertiary animate-spin" />
              </div>
            ) : displayDestinations.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-8 h-8 text-text-disabled mx-auto mb-2" />
                <p className="body-sm text-text-tertiary">
                  {isActiveSearch
                    ? lang === "vi" ? "Không tìm thấy điểm đến" : "No destinations found"
                    : lang === "vi" ? "Đang tải..." : "Loading destinations..."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1">
                {displayDestinations.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => handleSelect(dest)}
                    className="w-full flex items-center gap-3 p-3 rounded-sm text-left hover:bg-bg-secondary transition-colors group"
                  >
                    <div className="w-8 h-6 rounded overflow-hidden flex-shrink-0 bg-bg-secondary">
                      {dest.flagUrl ? (
                        <img
                          src={dest.flagUrl}
                          alt={`${dest.name} flag`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-text-tertiary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="body-md-medium text-text-primary truncate">
                        {dest.name}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-disabled group-hover:text-text-secondary transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
