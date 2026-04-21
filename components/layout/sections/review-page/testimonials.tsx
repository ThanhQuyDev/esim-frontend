"use client";

import { useState } from "react";

interface ReviewTestimonialsProps {
  dict: Record<string, any>;
  lang: string;
}

// Testimonial card types
interface UserReview {
  type: "user";
  author: string;
  platform: "trustpilot" | "youtube";
  platformLogo: string;
  review: string;
  rating?: number;
  avatar?: string;
  avatarBg?: string;
}

interface EditorialReview {
  type: "editorial";
  platform: string;
  platformLogo: string;
  review: string;
  isQuote?: boolean;
}

type TestimonialCard = UserReview | EditorialReview;

const testimonials: TestimonialCard[] = [
  {
    type: "editorial",
    platform: "lonely planet",
    platformLogo: "https://sb.nordcdn.com/m/3fe35db6f7e93a89/original/lonely-planet-logo.svg",
    review: "esim.vn is an affordable, easy-to-use, and sustainable eSIM service that gives reliable mobile and internet connections from anywhere in the world. That\u2019s why we recommend esim.vn as our eSIM partner.",
    isQuote: true,
  },
  {
    type: "user",
    author: "Jorge A.",
    platform: "trustpilot",
    platformLogo: "https://sb.nordcdn.com/m/582657296a71bcc7/original/trustpilot-logo.svg",
    review: "Easy, cheap and fast. Easy step to step setup and troubleshooting, super fast speed (around 100 mbps). Cheap, great coverage and helpful chat/assistance. Keep up the good work.",
    rating: 5,
  },
  {
    type: "user",
    author: "PewDiePie",
    platform: "youtube",
    platformLogo: "https://sb.nordcdn.com/m/523124913b21ba80/original/youtube-logo.svg",
    review: "I can set it up at home right now, activate it when I\u2019m ready (it takes literally just a couple of minutes, I\u2019ve tried it myself), and boom! I have internet on my phone when traveling, as it should be\u2026 So I recommend checking out esim.vn next time you\u2019re traveling \u2014 it\u2019s a must!",
    avatar: "https://sb.nordcdn.com/m/35591c102a63732b/original/pewdiepie.png",
    avatarBg: "#f40000",
  },
  {
    type: "user",
    author: "DutchPilotGirl",
    platform: "youtube",
    platformLogo: "https://sb.nordcdn.com/m/523124913b21ba80/original/youtube-logo.svg",
    review: "There\u2019s so much you can\u2019t do abroad without a proper internet connection. esim.vn takes care of everything. It\u2019s simple to buy and easy to install. I love it.",
    avatar: "https://sb.nordcdn.com/m/6a028523fe8e4546/original/dutchpilotgirl.png",
    avatarBg: "#f40000",
  },
  {
    type: "user",
    author: "Domas R.",
    platform: "trustpilot",
    platformLogo: "https://sb.nordcdn.com/m/582657296a71bcc7/original/trustpilot-logo.svg",
    review: "Awesome \u2014 used esim.vn across 3 countries already (UK, Netherlands and Belgium). Took me like 1min to buy esim and activate it. My internet was way better than my friends\u2019 who remained connected to their local providers and used roaming plans instead.",
    rating: 5,
  },
  {
    type: "editorial",
    platform: "cybernews",
    platformLogo: "https://sb.nordcdn.com/m/40568438e8c1f323/original/cybernews-logo.svg",
    review: "With comprehensive coverage and affordable prices, esim.vn is the best eSIM for Europe. Activating esim.vn is straightforward. Download the app, choose your plan, and surf the internet. You can contact the esim.vn customer support team via live chat or email if you encounter any issues.",
  },
  {
    type: "editorial",
    platform: "techradar",
    platformLogo: "https://sb.nordcdn.com/m/5c98bec1f4a1a9ea/original/techradar-logo.svg",
    review: "As a product backed by the reputable NordVPN brand, esim.vn benefits from the company\u2019s focus on security and privacy. Users praise its easy installation process, affordable pricing, and reliable coverage across the world.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      <p className="body-xs-medium mr-1 text-tertiary scroll-mt-20 xl:scroll-mt-24">{rating}</p>
      {Array.from({ length: rating }).map((_, i) => (
        <i key={i} className="kitIcon text-center w-[1em] fa-star fa-solid text-[12px] text-warning-subtle"></i>
      ))}
    </div>
  );
}

function UserCard({ item }: { item: UserReview }) {
  return (
    <div className="grid grid-rows-[min-content_1fr_min-content] gap-4 p-6 content-start bg-secondary rounded-sm">
      <div className="flex flex-row gap-4 items-center justify-between">
        <div className="flex flex-row gap-2 items-center">
          {item.avatar && (
            <div className="relative rounded-full overflow-hidden w-[24px] min-w-[24px] h-[24px]">
              <div className="relative overflow-hidden w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={item.author.toLowerCase()}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center"
                  style={{
                    position: "absolute",
                    height: "100%",
                    width: "100%",
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    color: "transparent",
                    backgroundColor: item.avatarBg || "#f40000",
                  }}
                  src={item.avatar}
                />
              </div>
            </div>
          )}
          <address className="body-sm-medium not-italic scroll-mt-20 xl:scroll-mt-24">{item.author}</address>
        </div>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`${item.platform} logo`}
            loading="lazy"
            width={item.platform === "trustpilot" ? 65 : 23}
            height={16}
            decoding="async"
            style={{ color: "transparent" }}
            src={item.platformLogo}
          />
        </div>
      </div>
      <div className="grid gap-3">
        <p className="body-sm text-secondary scroll-mt-20 xl:scroll-mt-24">{item.review}</p>
      </div>
      {item.rating && <StarRating rating={item.rating} />}
    </div>
  );
}

function EditorialCard({ item, isLarge }: { item: EditorialReview; isLarge?: boolean }) {
  if (isLarge) {
    return (
      <div className="grid grid-rows-[min-content_1fr_min-content] p-6 content-start bg-secondary rounded-sm gap-6 lg:mt-8 lg:pt-[200px]">
        <div className="flex flex-row gap-4 items-center justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${item.platform} logo`}
              loading="lazy"
              width={144}
              height={20}
              decoding="async"
              style={{ color: "transparent" }}
              src={item.platformLogo}
            />
          </div>
        </div>
        <div className="grid gap-3 order-first">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            loading="lazy"
            width={20}
            height={22}
            decoding="async"
            style={{ color: "transparent" }}
            src="https://sb.nordcdn.com/m/2aff85ac5e98399b/original/quote-left-sharp-solid.svg"
          />
          <p className="body-lg-medium scroll-mt-20 xl:scroll-mt-24">{item.review}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[min-content_1fr_min-content] gap-4 p-6 content-start bg-secondary rounded-sm">
      <div className="flex flex-row gap-4 items-center justify-between">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`${item.platform} logo`}
            loading="lazy"
            width={107}
            height={16}
            decoding="async"
            style={{ color: "transparent" }}
            src={item.platformLogo}
          />
        </div>
      </div>
      <div className="grid gap-3">
        <p className="body-sm text-secondary scroll-mt-20 xl:scroll-mt-24">{item.review}</p>
      </div>
    </div>
  );
}

export function ReviewTestimonials({ dict, lang }: ReviewTestimonialsProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = testimonials.length;

  const lonelyPlanet = testimonials[0] as EditorialReview;
  const jorgeA = testimonials[1] as UserReview;
  const pewdiepie = testimonials[2] as UserReview;
  const dutchpilotgirl = testimonials[3] as UserReview;
  const domasR = testimonials[4] as UserReview;
  const cybernews = testimonials[5] as EditorialReview;
  const techradar = testimonials[6] as EditorialReview;

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  return (
    <div
      data-section="Testimonials"
      data-testid="section-Testimonials"
      className="relative scroll-mt-20 xl:scroll-mt-24 group/section"
    >
      <div className="absolute top-0 group-first/section:-top-24 bottom-0 w-full">
        <div className="background w-full h-full bg-blue-100" style={{ backgroundColor: "#E4EAF4" }}></div>
      </div>
      <div className="relative">
        <div className="py-16">
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              <div className="h-full w-full flex [&>div:empty]:hidden flex-col gap-y-10">
                <div>
                  <h2 className="heading-xl text-center scroll-mt-20 xl:scroll-mt-24">
                    {dict.title || "What do customers say about esim.vn?"}
                  </h2>
                </div>
                <div>
                  <div>
                    {/* Mobile carousel */}
                    <div className="md:hidden">
                      <div className="relative w-full mx-auto overflow-hidden">
                        <div
                          className="flex transition-transform duration-300"
                          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                          {/* Slide 0: Lonely Planet (large) */}
                          <div className={`flex shrink-0 w-full transition-opacity ${currentSlide === 0 ? "opacity-100" : "opacity-0"}`}>
                            <EditorialCard item={lonelyPlanet} isLarge />
                          </div>
                          {/* Slide 1: Jorge A. */}
                          <div className={`flex shrink-0 w-full transition-opacity ${currentSlide === 1 ? "opacity-100" : "opacity-0"}`}>
                            <UserCard item={jorgeA} />
                          </div>
                          {/* Slide 2: PewDiePie */}
                          <div className={`flex shrink-0 w-full transition-opacity ${currentSlide === 2 ? "opacity-100" : "opacity-0"}`}>
                            <UserCard item={pewdiepie} />
                          </div>
                          {/* Slide 3: DutchPilotGirl */}
                          <div className={`flex shrink-0 w-full transition-opacity ${currentSlide === 3 ? "opacity-100" : "opacity-0"}`}>
                            <UserCard item={dutchpilotgirl} />
                          </div>
                          {/* Slide 4: Domas R. */}
                          <div className={`flex shrink-0 w-full transition-opacity ${currentSlide === 4 ? "opacity-100" : "opacity-0"}`}>
                            <UserCard item={domasR} />
                          </div>
                          {/* Slide 5: Cybernews */}
                          <div className={`flex shrink-0 w-full transition-opacity ${currentSlide === 5 ? "opacity-100" : "opacity-0"}`}>
                            <EditorialCard item={cybernews} />
                          </div>
                          {/* Slide 6: TechRadar */}
                          <div className={`flex shrink-0 w-full transition-opacity ${currentSlide === 6 ? "opacity-100" : "opacity-0"}`}>
                            <EditorialCard item={techradar} />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-[min-content_1fr_min-content] mt-6">
                        <button
                          className="flex items-center justify-center h-8 w-8 rounded-full shrink-0 bg-secondary"
                          aria-label="Previous slide"
                          onClick={handlePrev}
                        >
                          <i className="kitIcon text-center w-[1em] fa-chevron-left fa-sharp fa-light"></i>
                        </button>
                        <div className="flex items-center justify-center">
                          <p className="body-xs text-secondary scroll-mt-20 xl:scroll-mt-24">
                            {currentSlide + 1} / {totalSlides}
                          </p>
                        </div>
                        <button
                          className="flex items-center justify-center h-8 w-8 rounded-full shrink-0 bg-secondary"
                          aria-label="Next slide"
                          onClick={handleNext}
                        >
                          <i className="kitIcon text-center w-[1em] fa-chevron-right fa-sharp fa-light"></i>
                        </button>
                      </div>
                    </div>

                    {/* Tablet: md but not lg */}
                    <div className="hidden md:grid lg:hidden gap-6">
                      <EditorialCard item={lonelyPlanet} isLarge />
                      <div className="grid grid-cols-2 gap-6">
                        <UserCard item={jorgeA} />
                        <UserCard item={pewdiepie} />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <UserCard item={dutchpilotgirl} />
                        <UserCard item={domasR} />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <EditorialCard item={cybernews} />
                        <EditorialCard item={techradar} />
                      </div>
                    </div>

                    {/* Desktop: lg - 4 column masonry */}
                    <div className="hidden lg:grid grid-cols-4 gap-6">
                      {/* Column 1 */}
                      <div className="flex flex-col gap-6">
                        <UserCard item={jorgeA} />
                        <UserCard item={pewdiepie} />
                      </div>
                      {/* Column 2: Lonely Planet large */}
                      <div className="flex flex-col justify-end">
                        <EditorialCard item={lonelyPlanet} isLarge />
                      </div>
                      {/* Column 3 */}
                      <div className="flex flex-col gap-6">
                        <UserCard item={dutchpilotgirl} />
                        <UserCard item={domasR} />
                      </div>
                      {/* Column 4 */}
                      <div className="flex flex-col gap-6 justify-end">
                        <EditorialCard item={cybernews} />
                        <EditorialCard item={techradar} />
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
  );
}
