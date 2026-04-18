"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { DeviceType, searchSupportedDevices, Device } from "@/lib/api";
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

const TABS = [
  { key: "smartphones" as const, icon: Smartphone, apiType: "Smart Phones" },
  { key: "smartwatches" as const, icon: Watch, apiType: "Smart Watches" },
  { key: "tablets" as const, icon: Tablet, apiType: "Tablets" },
  { key: "laptops" as const, icon: Laptop, apiType: "Laptops" },
];

interface SearchResultGroup {
  type: string;
  icon: typeof Smartphone;
  results: { device: string; manufacturer: string; type: string }[];
}

export function DeviceList({ initialData, dict, lang }: DeviceListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(
    new Set()
  );

  // Search dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResultGroups, setSearchResultGroups] = useState<SearchResultGroup[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const TYPE_ICON_MAP: Record<string, typeof Smartphone> = {
    "Smart Phones": Smartphone,
    "Smart Watches": Watch,
    Tablets: Tablet,
    Laptops: Laptop,
  };

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
        // Group results by device type
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

  // Build a map from API type name to its data (no client-side filtering — tabs show full data)
  const dataByType = useMemo(() => {
    const map: Record<string, DeviceType> = {};
    for (const deviceType of initialData) {
      map[deviceType.type] = deviceType;
    }
    return map;
  }, [initialData]);

  const currentTab = TABS[activeTab];
  const currentData = dataByType[currentTab.apiType];

  const toggleAccordion = (manufacturerId: string) => {
    setOpenAccordions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(manufacturerId)) {
        newSet.delete(manufacturerId);
      } else {
        newSet.add(manufacturerId);
      }
      return newSet;
    });
  };

  // When user selects a search result, switch to the right tab and expand the manufacturer
  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      const tabIndex = TABS.findIndex((t) => t.apiType === result.type);
      if (tabIndex >= 0) {
        setActiveTab(tabIndex);
        const accordionId = `${result.type}-${result.manufacturer}`;
        setOpenAccordions((prev) => new Set(prev).add(accordionId));
      }
      setShowDropdown(false);
      setSearchQuery("");
    },
    []
  );

  return (
    <>
      {/* Header Section */}
      <div
        data-section="header"
        data-testid="section-header"
        className="relative scroll-mt-20 xl:scroll-mt-24 group/section"
      >
        <div className="absolute top-0 group-first/section:-top-24 bottom-0 w-full">
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
                  <div>
                    <div
                      className="z-20 max-w-[480px] mx-auto relative"
                      ref={searchContainerRef}
                    >
                      <div>
                        <div className="relative w-full">
                          <Input
                            ref={inputRef}
                            placeholder={dict.searchPlaceholder}
                            autoComplete="off"
                            className="z-20 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 appearance-none w-full leading-md py-[11px] pr-4 pl-12 text-primary placeholder-primary border-input border-md hover:border-focus active:border-focus focus:border-focus rounded-sm"
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
                            <Loader2 className="w-6 h-6 z-30 absolute top-1/2 -translate-y-1/2 left-4 text-tertiary animate-spin" />
                          ) : (
                            <Search className="w-6 h-6 z-30 absolute top-1/2 -translate-y-1/2 left-4 text-tertiary" />
                          )}
                        </div>
                      </div>

                      {/* Search Dropdown — grouped by device type */}
                      {showDropdown && searchResultGroups.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto z-50">
                          {searchResultGroups.map((group) => {
                            const GroupIcon = group.icon;
                            return (
                              <div key={group.type}>
                                {/* Type header */}
                                <div className="sticky top-0 bg-gray-50 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
                                  <GroupIcon className="w-4 h-4 text-gray-500" />
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {group.type}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    ({group.results.length})
                                  </span>
                                </div>
                                {/* Devices in this type */}
                                {group.results.map((result, index) => (
                                  <button
                                    key={`${result.manufacturer}-${result.device}-${index}`}
                                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                                    onClick={() => handleSelectResult(result)}
                                  >
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
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
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 px-4 py-6 text-center text-sm text-gray-500">
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

      {/* Device List Section */}
      <div
        data-section="device-list"
        data-testid="section-device-list"
        className="relative scroll-mt-20 xl:scroll-mt-24"
      >
        <div className="py-16">
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              <div className="grid sm:gap-x-8 grid-cols-12 gap-y-8">
                <div className="col-span-12 lg:col-start-3 lg:col-span-8">
                  <div>
                    <div className="container mx-auto">
                      {/* Tabs */}
                      <div
                        className="flex gap-1 pb-4 scrollbar-none overflow-auto"
                        data-testid="tabs-container"
                      >
                        <div className="relative flex gap-1 w-fit p-1 border-md border-secondary rounded-full">
                          {TABS.map((tab, index) => (
                            <button
                              key={tab.key}
                              data-tab-index={index}
                              data-testid={`tabs-button-${index + 1}`}
                              data-is-tab="true"
                              data-is-active={activeTab === index}
                              className={`relative z-1 body-sm-medium whitespace-nowrap md:body-md-medium px-4 py-1 focus-visible:outline-hidden focus-visible:shadow-focus rounded-full transition-[color] delay-250 duration-[0] ${
                                activeTab === index
                                  ? "text-white bg-dark hover:text-white"
                                  : "text-primary bg-transparent hover:bg-primary"
                              }`}
                              onClick={() => setActiveTab(index)}
                            >
                              {dict.tabs[tab.key].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Device Type Content */}
                    <div className="sm:mx-auto">
                      <div className="container mx-auto">
                        <div className="pt-6">
                          <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col gap-y-4">
                            <div>
                              <div className="flex w-fit p-2 rounded-sm bg-accent">
                                <currentTab.icon className="w-6 h-6" />
                              </div>
                            </div>
                            <div>
                              <h2 className="heading-xl scroll-mt-20 xl:scroll-mt-24">
                                {dict.tabs[currentTab.key].label}
                              </h2>
                            </div>
                            <div>
                              <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col gap-y-10">
                                <div>
                                  <p className="scroll-mt-20 xl:scroll-mt-24">
                                    {dict.tabs[currentTab.key].description}
                                  </p>
                                </div>
                                <div>
                                  {/* Manufacturers Accordion */}
                                  {currentData?.manufacturers.map(
                                    (manufacturer) => {
                                      const accordionId = `${currentTab.apiType}-${manufacturer.manufacturer}`;
                                      const isOpen =
                                        openAccordions.has(accordionId);

                                      return (
                                        <div
                                          key={accordionId}
                                          className="flex flex-col items-start text-left rtl:text-right gap-4 relative h-full word-break-word transform-gpu group-hover:border-accent transition-colors duration-medium p-0 [&:not(:first-child)>li]:pt-4 [&:not(:last-child)>li]:pb-4 [&:not(:first-child)]:pt-2 [&:not(:last-child)]:pb-2 border-0 [&:not(:last-child)]:border-b-md rounded-none bg-secondary border-secondary"
                                        >
                                          <li className="cursor-pointer list-none w-full">
                                            <button
                                              className="flex w-full items-center justify-between font-medium mb-0 lg:open:mb-4 outline-0 group transition-all focus-visible:outline-hidden focus-visible:shadow-focus open:mb-3"
                                              aria-expanded={isOpen}
                                              onClick={() =>
                                                toggleAccordion(accordionId)
                                              }
                                            >
                                              <h3 className="body-lg-medium text-left text-primary scroll-mt-20 xl:scroll-mt-24">
                                                {manufacturer.manufacturer}
                                              </h3>
                                              <span className="ml-4 rtl:ml-0 rtl:mr-4">
                                                <ChevronDown
                                                  className={`w-3 h-3 text-primary transition-transform ${
                                                    isOpen ? "-rotate-180" : ""
                                                  }`}
                                                />
                                              </span>
                                            </button>
                                            <section
                                              className={`overflow-hidden transition-all text-secondary ${
                                                isOpen ? "block" : "hidden h-0"
                                              }`}
                                            >
                                              <div className="h-full w-full flex group/stack [&>div:empty]:hidden flex-col gap-y-4">
                                                <div>
                                                  <ul className="flex flex-col list-inside gap-0 body-md">
                                                    {manufacturer.devices.map(
                                                      (device) => (
                                                        <li
                                                          key={device.id}
                                                          className="flex text-primary'"
                                                        >
                                                          <span className="whitespace-nowrap ltr:mr-2 rtl:ml-2 mt-1">
                                                            <span className="block w-4 h-4 bg-clip-content border-[5px] border-solid border-transparent rounded-full bg-[currentColor]"></span>
                                                          </span>
                                                          <p className="scroll-mt-20 xl:scroll-mt-24">
                                                            {device.device}
                                                          </p>
                                                        </li>
                                                      )
                                                    )}
                                                  </ul>
                                                </div>
                                                {dict.infoNote &&
                                                  manufacturer.manufacturer ===
                                                    "iPhone" && (
                                                    <div>
                                                      <div
                                                        data-testid="notification-neutral"
                                                        className="flex items-center w-full p-4 rounded-sm bg-primary border-tertiary"
                                                      >
                                                        <Info className="w-4 h-4 text-primary" />
                                                        <div className="flex flex-col ml-2 text-primary">
                                                          <span className="body-xs-medium scroll-mt-20 xl:scroll-mt-24">
                                                            {dict.infoNote}
                                                          </span>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  )}
                                              </div>
                                            </section>
                                          </li>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
