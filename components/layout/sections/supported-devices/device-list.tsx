"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { DeviceType, searchSupportedDevices } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Search,
  Smartphone,
  Watch,
  Tablet,
  Laptop,
  ChevronDown,
  Info,
  Loader2,
} from "lucide-react";
import { useDebounce } from "@/lib/use-debounce";

interface TabDict {
  label: string;
  description: string;
}

interface DeviceListProps {
  initialData: DeviceType[];
  lang: string;
  dict: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    infoNote?: string;
    tabs: {
      smartphones: TabDict;
      smartwatches: TabDict;
      tablets: TabDict;
      laptops: TabDict;
    };
  };
}

type TabKey = "smartphones" | "smartwatches" | "tablets" | "laptops";

const DEVICE_TYPE_CONFIG: {
  key: TabKey;
  icon: typeof Smartphone;
  apiType: string;
}[] = [
    { key: "smartphones", icon: Smartphone, apiType: "Smart Phones" },
    { key: "smartwatches", icon: Watch, apiType: "Smart Watches" },
    { key: "tablets", icon: Tablet, apiType: "Tablets" },
    { key: "laptops", icon: Laptop, apiType: "Laptops" },
  ];

interface SearchResultGroup {
  type: string;
  icon: typeof Smartphone;
  results: { device: string; manufacturer: string; type: string }[];
}

const TYPE_ICON_MAP: Record<string, typeof Smartphone> = {
  "Smart Phones": Smartphone,
  "Smart Watches": Watch,
  Tablets: Tablet,
  Laptops: Laptop,
};

/**
 * Reverse lookup from the API `type` string ("Smart Phones") back to our
 * internal tab key ("smartphones") so a search-result selection can switch
 * the active tab before scrolling to the manufacturer.
 */
const API_TYPE_TO_TAB: Record<string, TabKey> = DEVICE_TYPE_CONFIG.reduce(
  (acc, cfg) => {
    acc[cfg.apiType] = cfg.key;
    return acc;
  },
  {} as Record<string, TabKey>
);

export function DeviceList({ initialData, dict, lang }: DeviceListProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("smartphones");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Search dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResultGroups, setSearchResultGroups] = useState<SearchResultGroup[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tab pill highlight slider — keep one ref per tab so we can size and
  // translate the absolute background to match the active button.
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
    smartphones: null,
    smartwatches: null,
    tablets: null,
    laptops: null,
  });
  // Outer scroll wrapper for the tab strip — needed so we can keep the
  // active pill visible on narrow viewports.
  const tabsScrollerRef = useRef<HTMLDivElement>(null);
  const [sliderStyle, setSliderStyle] = useState<{
    width: number;
    height: number;
    transform: string;
    top: number;
  }>({ width: 0, height: 0, transform: "translateX(0px)", top: 0 });

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Recalculate the slider position whenever the active tab changes (and on
  // resize, since pill widths can shift on font load / breakpoint flips).
  const updateSlider = useCallback(() => {
    const target = tabRefs.current[activeTab];
    if (!target) return;
    const parent = target.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setSliderStyle({
      width: targetRect.width,
      height: targetRect.height,
      top: targetRect.top - parentRect.top,
      transform: `translateX(${targetRect.left - parentRect.left}px)`,
    });
  }, [activeTab]);

  useEffect(() => {
    updateSlider();
    window.addEventListener("resize", updateSlider);
    return () => window.removeEventListener("resize", updateSlider);
  }, [updateSlider]);

  // When the active tab changes, ensure its pill scrolls into view inside
  // the horizontally-scrollable strip so users on small screens always see
  // the option they just picked.
  useEffect(() => {
    const target = tabRefs.current[activeTab];
    const scroller = tabsScrollerRef.current;
    if (!target || !scroller) return;
    const targetRect = target.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    if (
      targetRect.left < scrollerRect.left ||
      targetRect.right > scrollerRect.right
    ) {
      const offset =
        target.offsetLeft -
        (scroller.clientWidth - target.clientWidth) / 2;
      scroller.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
    }
  }, [activeTab]);

  // Call API when debounced search changes
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResultGroups([]);
      setShowDropdown(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    searchSupportedDevices(debouncedSearch, lang)
      .then((response) => {
        if (cancelled) return;
        const groups: SearchResultGroup[] = [];
        for (const deviceType of response.data) {
          const results: SearchResultGroup["results"] = [];
          for (const manufacturer of deviceType.manufacturers) {
            for (const device of manufacturer.devices) {
              results.push({
                device: device.device,
                manufacturer: manufacturer.manufacturer,
                type: deviceType.type,
              });
            }
          }
          if (results.length > 0) {
            groups.push({
              type: deviceType.type,
              icon: TYPE_ICON_MAP[deviceType.type] || Smartphone,
              results,
            });
          }
        }
        setSearchResultGroups(groups);
        setShowDropdown(true);
      })
      .catch(() => {
        if (!cancelled) {
          setSearchResultGroups([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, lang]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build a map from API type name to its data
  const dataByType = useMemo(() => {
    const map: Record<string, DeviceType> = {};
    for (const deviceType of initialData) {
      map[deviceType.type] = deviceType;
    }
    return map;
  }, [initialData]);

  // When user selects a search result, switch to the right tab, expand the
  // manufacturer accordion, and scroll to its anchor.
  const handleSelectResult = useCallback(
    (result: { device: string; manufacturer: string; type: string }) => {
      const targetTab = API_TYPE_TO_TAB[result.type];
      if (targetTab && targetTab !== activeTab) {
        setActiveTab(targetTab);
      }
      const accordionId = `${result.type}-${result.manufacturer}`;
      setExpandedItems((prev) =>
        prev.includes(accordionId) ? prev : [...prev, accordionId]
      );
      setShowDropdown(false);
      setSearchQuery("");

      setTimeout(() => {
        const el = document.getElementById(accordionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 200);
    },
    [activeTab]
  );

  const activeConfig =
    DEVICE_TYPE_CONFIG.find((c) => c.key === activeTab) ?? DEVICE_TYPE_CONFIG[0];
  const activeData = dataByType[activeConfig.apiType];
  const ActiveTabIcon = activeConfig.icon;
  const activeTabDict = dict.tabs[activeConfig.key];

  return (
    <>
      {/* Header Section */}
      <div
        data-section="header"
        data-testid="section-header"
        className="relative scroll-mt-20 xl:scroll-mt-24 group/section"
      >
        <div className="absolute top-[-116px] group-first/section:-top-24 bottom-0 w-full">
          <div className="background w-full h-full bg-blue-100"></div>
        </div>
        <div className="relative">
          <div className="py-16">
            <div className="mx-4 sm:mx-auto">
              <div className="container mx-auto">
                <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col gap-y-6">
                  <div>
                    <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col items-center gap-y-4">
                      <div>
                        <h1 className="heading-xl text-center scroll-mt-20 xl:scroll-mt-24">
                          {dict.title}
                        </h1>
                      </div>
                      <div>
                        <p className="body-md text-secondary text-center scroll-mt-20 xl:scroll-mt-24">
                          {dict.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* UI 6.2: Larger search bar — wider container, taller
                       padding, bigger font for better discoverability. */}
                  <div>
                    <div
                      className="z-20 max-w-[640px] mx-auto relative w-full"
                      ref={searchContainerRef}
                    >
                      <div className="relative w-full">
                        <Input
                          ref={inputRef}
                          placeholder={dict.searchPlaceholder}
                          autoComplete="off"
                          className="z-20 h-14 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 appearance-none w-full leading-md py-4 pr-12 pl-14 text-base md:text-lg text-primary placeholder-primary border-input border-md hover:border-focus active:border-focus focus:border-focus rounded-full shadow-sm"
                          data-testid="search-supported-devices-input"
                          name="search-input"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => {
                            if (searchResultGroups.length > 0) {
                              setShowDropdown(true);
                            }
                          }}
                        />
                        {isSearching ? (
                          <Loader2 className="w-6 h-6 z-30 absolute top-1/2 -translate-y-1/2 left-5 text-tertiary animate-spin" />
                        ) : (
                          <Search className="w-6 h-6 z-30 absolute top-1/2 -translate-y-1/2 left-5 text-tertiary" />
                        )}
                        {searchQuery && (
                          <button
                            type="button"
                            aria-label="Clear search"
                            className="absolute right-5 top-1/2 -translate-y-1/2 z-30 p-1 text-text-tertiary bg-bg-secondary rounded-full hover:text-text-primary transition-colors"
                            onClick={() => {
                              setSearchQuery("");
                              setShowDropdown(false);
                              inputRef.current?.focus();
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Search Dropdown — grouped by device type */}
                      {showDropdown && searchResultGroups.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 max-h-[420px] overflow-y-auto z-50">
                          {searchResultGroups.map((group) => {
                            const GroupIcon = group.icon;
                            return (
                              <div key={group.type}>
                                <div className="sticky top-0 bg-gray-50 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
                                  <GroupIcon className="w-4 h-4 text-gray-500" />
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {group.type}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    ({group.results.length})
                                  </span>
                                </div>
                                {group.results.map((result, index) => (
                                  <button
                                    key={`${result.manufacturer}-${result.device}-${index}`}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                                    onClick={() => handleSelectResult(result)}
                                  >
                                    <div className="min-w-0">
                                      <p className="text-base font-medium text-gray-900 truncate">
                                        {result.device}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {result.manufacturer}
                                      </p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* No results */}
                      {showDropdown &&
                        searchResultGroups.length === 0 &&
                        !isSearching &&
                        debouncedSearch.trim() && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 z-50 px-4 py-6 text-center text-sm text-gray-500">
                            No devices found
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active-tab Device List Section */}
      <div
        data-section="device-list"
        data-testid="section-device-list"
        className="relative scroll-mt-20 xl:scroll-mt-24"
      >
        <div className="py-12">
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              <div className="grid sm:gap-x-8 grid-cols-12 gap-y-8">
                <div className="col-span-12 lg:col-start-3 lg:col-span-8">
                  {/* UI/UX 6.1: Tabs live INSIDE the device-list section
                       (white background) per the reference template. On
                       mobile, the strip left-aligns and scrolls; the active
                       pill auto-scrolls into view via the activeTab effect. */}
                  <div className="container mx-auto">
                    <div
                      ref={tabsScrollerRef}
                      className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-1 pb-4 scrollbar-none overflow-x-auto justify-start"
                      data-testid="tabs-container"
                    >
                      <div className="relative flex items-center gap-1 w-fit p-1 border border-gray-200 bg-white rounded-full shadow-sm">
                        <div
                          aria-hidden="true"
                          className="absolute pointer-events-none z-0 bg-gray-900 rounded-full"
                          style={{
                            transform: sliderStyle.transform,
                            width: `${sliderStyle.width}px`,
                            height: `${sliderStyle.height}px`,
                            top: `${sliderStyle.top}px`,
                            left: 0,
                            transition:
                              "transform 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, top 0.3s ease-in-out",
                          }}
                        />
                        {DEVICE_TYPE_CONFIG.map((cfg, idx) => {
                          const isActive = activeTab === cfg.key;
                          const TabIcon = cfg.icon;
                          return (
                            <button
                              key={cfg.key}
                              ref={(el: HTMLButtonElement | null) => {
                                tabRefs.current[cfg.key] = el;
                              }}
                              type="button"
                              onClick={() => setActiveTab(cfg.key)}
                              data-tab-index={`tab-${idx}`}
                              data-testid={`tabs-button-${idx + 1}`}
                              data-is-tab="true"
                              data-is-active={isActive}
                              className={`relative z-10  inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium md:text-base transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/10 ${isActive
                                  ? "text-white"
                                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                }`}
                              aria-pressed={isActive}
                            >
                              <TabIcon className="w-4 h-4" />
                              {dict.tabs[cfg.key].label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div
                    key={activeTab}
                    className="flex flex-col gap-y-6 animate-in fade-in duration-300"
                  >
                    {activeData ? (
                      <div className="sm:mx-auto w-full">
                        <div className="container mx-auto">
                          <div className="pt-4">
                            <div className="h-full w-full flex flex-col gap-y-4">
                              <div>
                                <div className="flex w-fit p-2 rounded-sm bg-accent">
                                  <ActiveTabIcon className="w-6 h-6" />
                                </div>
                              </div>
                              <div>
                                <h2 className="heading-xl scroll-mt-20 xl:scroll-mt-24">
                                  {activeTabDict.label}
                                </h2>
                              </div>
                              <div>
                                <p className="scroll-mt-20 xl:scroll-mt-24">
                                  {activeTabDict.description}
                                </p>
                              </div>
                              <div>
                                <AccordionPrimitive.Root
                                  type="multiple"
                                  value={expandedItems}
                                  onValueChange={setExpandedItems}
                                >
                                  {activeData.manufacturers.map(
                                    (manufacturer) => {
                                      const accordionId = `${activeConfig.apiType}-${manufacturer.manufacturer}`;
                                      return (
                                        <AccordionPrimitive.Item
                                          key={accordionId}
                                          value={accordionId}
                                          id={accordionId}
                                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                        >
                                          <AccordionPrimitive.Header className="flex">
                                            <AccordionPrimitive.Trigger className="flex w-full items-center justify-between py-4 font-medium transition-all outline-none group">
                                              {/* UI 6.2: bigger manufacturer label */}
                                              <h3 className="text-lg md:text-xl font-semibold text-left text-primary">
                                                {manufacturer.manufacturer}
                                              </h3>
                                              <ChevronDown className="w-5 h-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                            </AccordionPrimitive.Trigger>
                                          </AccordionPrimitive.Header>
                                          <AccordionPrimitive.Content className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                                            <div className="pb-4">
                                              <ul className="flex flex-col gap-0">
                                                {manufacturer.devices.map(
                                                  (device) => (
                                                    <li
                                                      key={device.id}
                                                      className="flex items-center text-primary py-2"
                                                    >
                                                      <span className="w-1.5 h-1.5 rounded-full bg-gray-900 shrink-0 mr-3" />
                                                      {/* UI 6.2: bigger device font for easier scanning */}
                                                      <p className="text-sm md:text-base">
                                                        {device.device}
                                                      </p>
                                                    </li>
                                                  )
                                                )}
                                              </ul>
                                              {dict.infoNote &&
                                                manufacturer.manufacturer ===
                                                "iPhone" && (
                                                  <div className="mt-3">
                                                    <div
                                                      data-testid="notification-neutral"
                                                      className="flex items-center w-full p-4 rounded-sm border border-gray-200"
                                                    >
                                                      <Info className="w-4 h-4 text-primary shrink-0" />
                                                      <div className="flex flex-col ml-2 text-primary">
                                                        <span className="body-xs-medium">
                                                          {dict.infoNote}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                            </div>
                                          </AccordionPrimitive.Content>
                                        </AccordionPrimitive.Item>
                                      );
                                    }
                                  )}
                                </AccordionPrimitive.Root>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-gray-500 text-base">
                        {lang === "vi"
                          ? "Chưa có dữ liệu cho danh mục này."
                          : "No devices in this category yet."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
