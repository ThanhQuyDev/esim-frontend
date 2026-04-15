import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Section } from "@/components/ui/section";

interface SecurityFeaturesProps {
  dict: Record<string, any>;
}

export function SecurityFeatures({ dict }: SecurityFeaturesProps) {
  return (
    <Section background="secondary">
      <div className="text-center mb-12">
        <h2 className="heading-xl text-text-primary mb-6">{dict.title}</h2>
        <a
          href="#"
          className="inline-flex items-center gap-2 px-6 py-3 bg-bg-accent text-text-primary-on-color body-md-medium rounded-full hover:bg-bg-accent-hover transition-colors"
        >
          {dict.cta}
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>

      {/* Desktop: 2-column grid */}
      <div className="hidden md:grid grid-cols-2 gap-4 mb-4">
        {/* Tile 1 - Connect instantly */}
        {dict.features[0] && (
          <div className="flex flex-col rounded-md lg:rounded-lg h-full overflow-hidden bg-[#eef1f6]">
            <div className="md:p-10 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
              <div className="flex flex-col gap-y-4">
                <h3 className="heading-lg text-text-primary">{dict.features[0].title}</h3>
                <p className="body-md text-text-secondary">{dict.features[0].description}</p>
              </div>
            </div>
            <div className="flex flex-1">
              <div className="mx-auto flex items-end">
                <Image
                  alt={dict.features[0].title}
                  src="https://sb.nordcdn.com/m/5f5e15f2fe290a34/original/homepage-display-tile-1.png"
                  width={570}
                  height={555}
                  loading="lazy"
                  style={{ color: "transparent" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tile 2 - Avoid waiting in line */}
        {dict.features[1] && (
          <div className="flex flex-col rounded-md lg:rounded-lg h-full overflow-hidden" style={{ backgroundColor: "rgb(159, 207, 242)" }}>
            <div className="flex-1">
              <div className="md:p-10 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                <div className="flex flex-col gap-y-4">
                  <h3 className="heading-lg text-text-primary">{dict.features[1].title}</h3>
                  <p className="body-md text-text-secondary">{dict.features[1].description}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-1">
              <div className="mx-auto flex items-end">
                <Image
                  alt={dict.features[1].title}
                  src="https://sb.nordcdn.com/m/7b18929dcd6459c9/original/homepage-display-tile-2.png"
                  width={609}
                  height={609}
                  loading="lazy"
                  style={{ color: "transparent" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: stacked */}
      <div className="md:hidden grid grid-cols-1 gap-y-8">
        {dict.features.slice(0, 2).map((feature: any, i: number) => (
          <div key={i} className={`flex flex-col rounded-sm overflow-hidden ${i === 0 ? "bg-[#eef1f6]" : ""}`} style={i === 1 ? { backgroundColor: "rgb(159, 207, 242)" } : undefined}>
            <div className="px-6 py-8 w-full flex flex-col gap-6">
              <h3 className="heading-lg text-text-primary">{feature.title}</h3>
              <p className="body-md text-text-secondary">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Full-width tile 3 */}
      {dict.features[2] && (
        <div className="mt-4 flex flex-col lg:flex-row rounded-sm md:rounded-md lg:rounded-lg overflow-hidden bg-[#e8f4fd]">
          <div className="flex-1 flex items-center">
            <div className="md:p-16 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
              <h3 className="heading-lg text-text-primary">{dict.features[2].title}</h3>
              <p className="body-md text-text-secondary max-w-lg">{dict.features[2].description}</p>
            </div>
          </div>
          <div className="flex flex-1">
            <div className="mx-auto flex items-end lg:items-center">
              <Image
                alt={dict.features[2].title}
                src="https://sb.nordcdn.com/m/174fc00da8400ee5/original/homepage-display-tile-3.png"
                width={570}
                height={555}
                loading="lazy"
                style={{ color: "transparent" }}
              />
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
