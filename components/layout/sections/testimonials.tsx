import Image from "next/image";
import { Section } from "@/components/ui/section";

interface TestimonialsSectionProps {
  dict: Record<string, any>;
}

const sourceLogos: Record<string, { src: string; width: number; height: number }> = {
  Trustpilot: { src: "https://sb.nordcdn.com/m/582657296a71bcc7/original/trustpilot-logo.svg", width: 65, height: 16 },
  YouTube: { src: "https://sb.nordcdn.com/m/523124913b21ba80/original/youtube-logo.svg", width: 80, height: 18 },
  "Lonely Planet": { src: "https://sb.nordcdn.com/m/3fe35db6f7e93a89/original/lonely-planet-logo.svg", width: 144, height: 20 },
  CyberNews: { src: "https://sb.nordcdn.com/m/40568438e8c1f323/original/cybernews-logo.svg", width: 80, height: 20 },
  TechRadar: { src: "https://sb.nordcdn.com/m/5c98bec1f4a1a9ea/original/techradar-logo.svg", width: 80, height: 20 },
};

const avatarImages: Record<string, string> = {
  PewDiePie: "https://sb.nordcdn.com/m/35591c102a63732b/original/pewdiepie.png",
  DutchPilotGirl: "https://sb.nordcdn.com/m/6a028523fe8e4546/original/dutchpilotgirl.png",
};

export function TestimonialsSection({ dict }: TestimonialsSectionProps) {
  return (
    <div className="relative group/section">
      <div className="absolute top-0 group-first/section:-top-24 bottom-0 w-full">
        <div className="w-full h-full" style={{ backgroundColor: "rgb(228, 234, 244)" }} />
      </div>
      <div className="relative">
        <div className="py-16">
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              <div className="flex flex-col gap-y-10">
                {/* Header */}
                <div className="flex flex-col gap-y-6">
                  <h2 className="heading-xl text-center text-text-primary">{dict.title}</h2>
                  {dict.subtitle && (
                    <p className="text-text-secondary text-center">{dict.subtitle}</p>
                  )}
                </div>

                {/* Reviews Grid */}
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                  {dict.reviews.map((review: any, i: number) => {
                    const logo = sourceLogos[review.source];
                    const avatar = avatarImages[review.name];

                    return (
                      <div
                        key={i}
                        className="break-inside-avoid bg-bg-secondary rounded-sm p-6"
                      >
                        {/* Source & Author row */}
                        <div className="flex flex-row gap-4 items-center justify-between mb-4">
                          {/* Author with avatar */}
                          <div className="flex flex-row gap-2 items-center">
                            {avatar && (
                              <div className="w-12 h-12 rounded-full overflow-hidden relative flex-shrink-0">
                                <Image
                                  src={avatar}
                                  alt={review.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                  style={{ backgroundColor: "rgb(244, 0, 0)" }}
                                />
                              </div>
                            )}
                            {review.name && !avatar && (
                              <span className="body-sm-medium text-text-primary">{review.name}</span>
                            )}
                            {avatar && (
                              <span className="body-sm-medium text-text-primary">{review.name}</span>
                            )}
                          </div>

                          {/* Source logo */}
                          {logo && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={logo.src}
                              alt={`${review.source} logo`}
                              width={logo.width}
                              height={logo.height}
                              loading="lazy"
                              style={{ color: "transparent" }}
                            />
                          )}
                        </div>

                        {/* Quote icon for featured */}
                        {review.source === "Lonely Planet" && (
                          <div className="grid gap-3 order-first mb-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="https://sb.nordcdn.com/m/2aff85ac5e98399b/original/quote-left-sharp-solid.svg"
                              alt=""
                              width={20}
                              height={22}
                              loading="lazy"
                              style={{ color: "transparent" }}
                            />
                          </div>
                        )}

                        {/* Rating stars */}
                        {review.rating && (
                          <div className="flex gap-0.5 items-center mb-3">
                            <p className="body-xs-medium mr-1 text-text-tertiary">{review.rating}</p>
                            {[...Array(review.rating)].map((_, j) => (
                              <svg key={j} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                        )}

                        {/* Text */}
                        {review.source === "Lonely Planet" ? (
                          <p className="body-lg-medium text-text-primary">{review.text}</p>
                        ) : (
                          <p className="body-sm text-text-secondary">{review.text}</p>
                        )}
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
  );
}
