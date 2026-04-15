import Image from "next/image";
import { Section } from "@/components/ui/section";

interface WhatIsEsimProps {
  dict: Record<string, any>;
}

export function WhatIsEsim({ dict }: WhatIsEsimProps) {
  return (
    <Section background="secondary">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Text - appears second on mobile, first on md+ */}
        <div className="md:order-2">
          <h2 className="heading-xl text-text-primary mb-4">{dict.title}</h2>
          <p className="body-md text-text-secondary">{dict.description}</p>
        </div>
        {/* Image - appears first on mobile, second on md+ (row-start-1 on md) */}
        <div className="md:order-1">
          <Image
            alt={dict.imageAlt || "An eSIM card with an active data plan."}
            src="https://sb.nordcdn.com/m/4b32c41c87b8ff4f/original/homepage-what-is-esim.png"
            width={555}
            height={200}
            loading="lazy"
            className="w-full h-auto"
            style={{ color: "transparent" }}
          />
        </div>
      </div>
    </Section>
  );
}
