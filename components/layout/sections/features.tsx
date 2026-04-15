"use client";

import { Globe, Smartphone, Ban, CreditCard, Bell, Map } from "lucide-react";
import { Section } from "@/components/ui/section";
import { useWhyChooseUs } from "@/lib/hooks";
import type { Locale } from "@/lib/i18n-config";

interface FeaturesSectionProps {
  dict: Record<string, any>;
  lang: Locale;
}

const iconMap: Record<string, React.ElementType> = {
  globe: Globe,
  smartphone: Smartphone,
  ban: Ban,
  sim: CreditCard,
  bell: Bell,
  map: Map,
};

export function FeaturesSection({ dict, lang }: FeaturesSectionProps) {
  const { data: apiFeatures } = useWhyChooseUs(lang);

  const features = apiFeatures && apiFeatures.length > 0
    ? apiFeatures.map((f: any) => ({
        icon: f.icon || "globe",
        title: f.title,
        description: f.description,
      }))
    : dict.features;

  return (
    <Section background="primary">
      <div className="text-center mb-12">
        <h2 className="heading-xl text-text-primary mb-4">{dict.title}</h2>
        <p className="body-lg text-text-secondary max-w-2xl mx-auto">
          {dict.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature: any, i: number) => {
          const Icon = iconMap[feature.icon] || Globe;
          return (
            <div
              key={i}
              className="p-6 bg-bg-secondary rounded-md border border-border-primary hover:border-border-focus transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Icon className="w-6 h-6 text-text-primary" />
              </div>
              <h3 className="heading-sm text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="body-md text-text-secondary">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
