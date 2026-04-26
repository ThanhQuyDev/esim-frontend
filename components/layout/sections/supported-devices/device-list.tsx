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

const DEVICE_TYPE_CONFIG = [
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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

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

  // When user selects a search result, expand the manufacturer and scroll to it
  const handleSelectResult = useCallback(
    (result: { device: string; manufacturer: string; type: string }) => {
      const accordionId = `${result.type}-${result.manufacturer}`;
      setExpandedItems((prev) =>
        prev.includes(accordionId) ? prev : [...prev, accordionId]
      );
      setShowDropdown(false);
      setSearchQuery("");

      // Scroll to the manufacturer section
      setTimeout(() => {
        const el = document.getElementById(accordionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
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
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-sm shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto z-50">
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

      {/* Device List Section — All types stacked vertically */}
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
                  <div className="flex flex-col gap-y-16">
                    {DEVICE_TYPE_CONFIG.map((typeConfig) => {
                      const deviceData = dataByType[typeConfig.apiType];
                      if (!deviceData) return null;

                      const TabIcon = typeConfig.icon;
                      const tabDict = dict.tabs[typeConfig.key];

                      return (
                        <div key={typeConfig.key} className="sm:mx-auto w-full">
                          <div className="container mx-auto">
                            <div className="pt-6">
                              <div className="h-full w-full flex flex-col gap-y-4">
                                <div>
                                  <div className="flex w-fit p-2 rounded-sm bg-accent">
                                    <TabIcon className="w-6 h-6" />
                                  </div>
                                </div>
                                <div>
                                  <h2 className="heading-xl scroll-mt-20 xl:scroll-mt-24">
                                    {tabDict.label}
                                  </h2>
                                </div>
                                <div>
                                  <p className="scroll-mt-20 xl:scroll-mt-24">
                                    {tabDict.description}
                                  </p>
                                </div>
                                <div>
                                  {/* Manufacturers Accordion — Radix */}
                                  <AccordionPrimitive.Root
                                    type="multiple"
                                    value={expandedItems}
                                    onValueChange={setExpandedItems}
                                  >
                                    {deviceData.manufacturers.map(
                                      (manufacturer) => {
                                        const accordionId = `${typeConfig.apiType}-${manufacturer.manufacturer}`;

                                        return (
                                          <AccordionPrimitive.Item
                                            key={accordionId}
                                            value={accordionId}
                                            id={accordionId}
                                            className="border-b border-gray-200"
                                          >
                                            <AccordionPrimitive.Header className="flex">
                                              <AccordionPrimitive.Trigger className="flex w-full items-center justify-between py-4 font-medium transition-all outline-none group">
                                                <h3 className="body-lg-medium text-left text-primary">
                                                  {manufacturer.manufacturer}
                                                </h3>
                                                <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                              </AccordionPrimitive.Trigger>
                                            </AccordionPrimitive.Header>
                                            <AccordionPrimitive.Content className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                                              <div className="pb-4">
                                                <ul className="flex flex-col gap-0">
                                                  {manufacturer.devices.map(
                                                    (device) => (
                                                      <li
                                                        key={device.id}
                                                        className="flex items-center text-primary py-1.5"
                                                      >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0 mr-3" />
                                                        <p className="text-sm">
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
                      );
                    })}
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
