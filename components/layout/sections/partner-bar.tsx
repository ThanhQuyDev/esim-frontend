interface PartnerBarProps {
  dict: Record<string, any>;
}

const partners = [
  { name: "lonely planet", src: "https://sb.nordcdn.com/m/562433fbceba707b/original/lonely-planet.svg", width: 197, height: 50, minWidth: 197 },
  { name: "national geographic", src: "https://sb.nordcdn.com/m/359b9dcf0f8dcd42/original/national-geographic.svg", width: 117, height: 50, minWidth: 117 },
  { name: "forbes", src: "https://sb.nordcdn.com/m/4ecefc719b278237/original/forbes.svg", width: 128, height: 50, minWidth: 128 },
  { name: "cnn", src: "https://sb.nordcdn.com/m/5603e64f4548183a/original/cnn.svg", width: 95, height: 50, minWidth: 95 },
  { name: "pcmag", src: "https://sb.nordcdn.com/m/60d274d782dd9789/original/pcmag.svg", width: 76, height: 50, minWidth: 76 },
  { name: "techradar", src: "https://sb.nordcdn.com/m/235a0b392cdb70c6/original/techradar.svg", width: 175, height: 50, minWidth: 175 },
];

export function PartnerBar({ dict }: PartnerBarProps) {
  return (
    <div data-section="PartnerBar" data-testid="section-PartnerBar" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="lg:container mx-auto">
          <div className="lg:flex lg:justify-between lg:items-center lg:py-6 lg:pl-12 xl:pr-12 border-none lg:border-md border-border-secondary lg:rounded-full">
            <div className="max-lg:container max-sm:px-4 sm:mx-auto lg:mx-0 max-lg:mb-4 lg:mr-16 lg:shrink-0">
              <p className="text-black body-sm-medium lg:body-md-medium scroll-mt-20 xl:scroll-mt-24">
                {dict.title}
              </p>
            </div>
            <div className="overflow-hidden">
              <div className="flex lg:mx-auto w-max gap-2 animate-marquee">
                {partners.map((partner) => (
                  <div
                    key={partner.name}
                    className="flex items-center justify-center"
                    style={{ height: 50, minWidth: partner.minWidth }}
                  >
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={partner.src}
                        alt={partner.name}
                        width={partner.width}
                        height={partner.height}
                        loading="lazy"
                        decoding="async"
                        style={{ color: "transparent" }}
                      />
                    </div>
                  </div>
                ))}
                {/* Duplicate set for marquee */}
                {partners.map((partner) => (
                  <div
                    key={`${partner.name}-dup`}
                    className="flex items-center justify-center"
                    style={{ height: 50, minWidth: partner.minWidth }}
                  >
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={partner.src}
                        alt={partner.name}
                        width={partner.width}
                        height={partner.height}
                        loading="lazy"
                        decoding="async"
                        style={{ color: "transparent" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
