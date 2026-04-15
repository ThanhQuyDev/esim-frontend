interface PartnerBarProps {
  dict: Record<string, any>;
}

const partners = [
  { name: "Lonely Planet", src: "https://sb.nordcdn.com/m/562433fbceba707b/original/lonely-planet.svg", width: 197, height: 50, minWidth: 197 },
  { name: "National Geographic", src: "https://sb.nordcdn.com/m/359b9dcf0f8dcd42/original/national-geographic.svg", width: 117, height: 50, minWidth: 117 },
  { name: "Forbes", src: "https://sb.nordcdn.com/m/4ecefc719b278237/original/forbes.svg", width: 128, height: 50, minWidth: 128 },
  { name: "CNN", src: "https://sb.nordcdn.com/m/5603e64f4548183a/original/cnn.svg", width: 95, height: 50, minWidth: 95 },
  { name: "PCMag", src: "https://sb.nordcdn.com/m/60d274d782dd9789/original/pcmag.svg", width: 76, height: 50, minWidth: 76 },
  { name: "TechRadar", src: "https://sb.nordcdn.com/m/235a0b392cdb70c6/original/techradar.svg", width: 110, height: 50, minWidth: 110 },
];

export function PartnerBar({ dict }: PartnerBarProps) {
  return (
    <section className="py-16">
      <div className="lg:container mx-auto">
        <div className="lg:flex lg:justify-between lg:items-center lg:py-6 lg:pl-12 xl:pr-12 lg:border lg:border-border-primary lg:rounded-full">
          <div className="max-lg:container max-sm:px-4 sm:mx-auto lg:mx-0 max-lg:mb-4 lg:mr-16 lg:shrink-0">
            <p className="text-text-primary body-sm-medium lg:body-md-medium">
              {dict.title}
            </p>
          </div>
          <div className="max-xl:overflow-hidden max-xl:overflow-x-scroll scrollbar-none">
            <div className="flex lg:mx-auto w-max gap-2 animate-marquee xl:animate-none">
              {[...partners, ...partners].map((partner, i) => (
                <div
                  key={`${partner.name}-${i}`}
                  className="flex items-center justify-center"
                  style={{ height: "50px", minWidth: `${partner.minWidth}px` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={partner.src}
                    alt={partner.name.toLowerCase()}
                    width={partner.width}
                    height={partner.height}
                    loading="lazy"
                    style={{ color: "transparent" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
