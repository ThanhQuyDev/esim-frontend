import { Section } from "@/components/ui/section";

interface HowItWorksSectionProps {
  dict: Record<string, any>;
}

const stepImages = [
  "https://sb.nordcdn.com/m/2e23689ebdcc105/original/1-step.svg",
  "https://sb.nordcdn.com/m/2a28e7fa0cb54961/original/2-step.svg",
  "https://sb.nordcdn.com/m/3f8ce32d6d5693d3/original/3-step.svg",
];

export function HowItWorksSection({ dict }: HowItWorksSectionProps) {
  return (
    <Section background="secondary">
      <div className="text-center mb-12">
        <h2 className="heading-xl text-text-primary">{dict.title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dict.steps.map((step: any, i: number) => (
          <div
            key={i}
            className="flex flex-col items-start text-left relative h-full border-none p-0 gap-0 overflow-hidden rounded-sm bg-bg-blue-100"
          >
            <div className="p-6 lg:pb-3">
              {/* Step Number */}
              <div className="pb-4 lg:pb-6">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-bg-secondary">
                  <p className="body-md-medium text-text-primary">{step.number}</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3 lg:gap-4 w-full h-full">
                <h3 className="body-lg-medium text-text-primary">{step.title}</h3>
                <p className="body-md text-text-secondary">{step.description}</p>
              </div>
            </div>

            {/* Step Image - hidden on mobile, shown on md+ */}
            <div className="hidden md:flex justify-center items-end w-full h-full pt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stepImages[i]}
                alt={step.title}
                width={368}
                height={240}
                loading="lazy"
                style={{ color: "transparent" }}
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
