"use client";

import { useState } from "react";
import { ChevronRight, MapPin, Loader2 } from "lucide-react";
import { Section } from "@/components/ui/section";
import { useDestinations } from "@/lib/hooks";
import type { Locale } from "@/lib/i18n-config";

interface DestinationsSectionProps {
  dict: Record<string, any>;
  lang: Locale;
}

export function DestinationsSection({ dict, lang }: DestinationsSectionProps) {
  const [activeTab, setActiveTab] = useState<"country" | "region" | "ultra">("country");

  const { data: destinations = [], isLoading } = useDestinations(
    undefined,
    "name",
    "ASC"
  );

  const tabs = [
    { key: "country" as const, label: dict.tabs.country },
    { key: "region" as const, label: dict.tabs.region },
    { key: "ultra" as const, label: dict.tabs.ultraPlan, badge: dict.new },
  ];

  return (
    <Section id="destinations" background="secondary">
      <div className="text-center mb-10">
        <h2 className="heading-xl text-text-primary">{dict.title}</h2>
      </div>

      {/* Tab Pills */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-bg-primary rounded-full p-1 border border-border-primary">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative body-sm-medium md:body-md-medium whitespace-nowrap px-4 py-2 rounded-full min-w-[60px] transition-colors ${
                activeTab === tab.key
                  ? "bg-bg-accent text-text-primary-on-color"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <span className="flex items-center gap-1.5">
                {tab.label}
                {tab.badge && (
                  <span className="inline-flex px-1.5 py-0.5 bg-bg-brand-yellow text-text-primary body-2xs-medium rounded-full">
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Destination Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-text-tertiary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {destinations.map((dest: any) => (
            <a
              key={dest.id}
              href="#"
              className="flex items-center gap-3 p-4 bg-bg-primary rounded-sm border border-border-primary hover:border-border-focus transition-colors group"
            >
              <div className="w-10 h-7 rounded overflow-hidden flex-shrink-0 bg-bg-secondary">
                {dest.flagUrl ? (
                  <img
                    src={dest.flagUrl}
                    alt={`${dest.name} flag`}
                    loading="lazy"
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
                <p className="body-sm text-text-tertiary">
                  {dict.from} US$3.99
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-disabled group-hover:text-text-primary transition-colors flex-shrink-0" />
            </a>
          ))}
        </div>
      )}

      {/* See All Plans */}
      <div className="text-center mt-8">
        <a
          href="#"
          className="inline-flex items-center gap-2 px-6 py-3 bg-bg-accent text-text-primary-on-color body-md-medium rounded-full hover:bg-bg-accent-hover transition-colors"
        >
          {dict.seeAllPlans}
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </Section>
  );
}
