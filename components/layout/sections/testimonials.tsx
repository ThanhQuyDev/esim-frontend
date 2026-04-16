"use client";

import Image from "next/image";
import { useState, useCallback } from "react";

interface Review {
  name?: string;
  source: string;
  type?: string;
  rating?: number;
  avatar?: boolean;
  text: string;
}

interface TestimonialsSectionProps {
  dict: {
    title: string;
    subtitle?: string;
    reviews: Review[];
  };
}

const sourceLogos: Record<string, { src: string; width: number; height: number; alt: string }> = {
  Trustpilot: { src: "https://sb.nordcdn.com/m/582657296a71bcc7/original/trustpilot-logo.svg", width: 65, height: 16, alt: "trustpilot logo" },
  YouTube: { src: "https://sb.nordcdn.com/m/523124913b21ba80/original/youtube-logo.svg", width: 23, height: 16, alt: "youtube logo" },
  "Lonely Planet": { src: "https://sb.nordcdn.com/m/3fe35db6f7e93a89/original/lonely-planet-logo.svg", width: 144, height: 20, alt: "lonely planet logo" },
  CyberNews: { src: "https://sb.nordcdn.com/m/40568438e8c1f323/original/cybernews-logo.svg", width: 107, height: 16, alt: "cybernews logo" },
  TechRadar: { src: "https://sb.nordcdn.com/m/5c98bec1f4a1a9ea/original/techradar-logo.svg", width: 107, height: 16, alt: "techradar logo" },
};

const avatarImages: Record<string, string> = {
  PewDiePie: "https://sb.nordcdn.com/m/35591c102a63732b/original/pewdiepie.png",
  DutchPilotGirl: "https://sb.nordcdn.com/m/6a028523fe8e4546/original/dutchpilotgirl.png",
};

function StarIcon() {
  return (
    <svg className="w-3 h-3 text-warning-subtle fill-current" viewBox="0 0 20 20">
      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
    </svg>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      <p className="body-xs-medium mr-1 text-tertiary">{rating}</p>
      {[...Array(rating)].map((_, j) => (
        <StarIcon key={j} />
      ))}
    </div>
  );
}

function SourceLogo({ source }: { source: string }) {
  const logo = sourceLogos[source];
  if (!logo) return null;
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        loading="lazy"
        style={{ color: "transparent" }}
      />
    </div>
  );
}

function AvatarImage({ name }: { name: string }) {
  const src = avatarImages[name];
  if (!src) return null;
  return (
    <div className="relative rounded-full overflow-hidden w-[24px] min-w-[24px] h-[24px]">
      <div className="relative overflow-hidden w-full h-full">
        <Image
          src={src}
          alt={name.toLowerCase()}
          fill
          className="h-full w-full object-cover object-center"
          sizes="100vw"
          style={{ backgroundColor: "rgb(244, 0, 0)" }}
        />
      </div>
    </div>
  );
}

/** Featured card (Lonely Planet) */
function FeaturedCard({ review }: { review: Review }) {
  return (
    <div className="grid grid-rows-[min-content_1fr_min-content] p-6 content-start bg-secondary rounded-sm gap-6 lg:mt-8 lg:pt-[200px]">
      <div className="flex flex-row gap-4 items-center justify-between">
        <SourceLogo source={review.source} />
      </div>
      <div className="grid gap-3 order-first">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          loading="lazy"
          width={20}
          height={22}
          src="https://sb.nordcdn.com/m/2aff85ac5e98399b/original/quote-left-sharp-solid.svg"
          style={{ color: "transparent" }}
        />
        <p className="body-lg-medium">{review.text}</p>
      </div>
    </div>
  );
}

/** User review card (Trustpilot / YouTube) */
function UserReviewCard({ review }: { review: Review }) {
  const hasAvatar = review.avatar && review.name && avatarImages[review.name];
  return (
    <div className="grid grid-rows-[min-content_1fr_min-content] gap-4 p-6 content-start bg-secondary rounded-sm">
      <div className="flex flex-row gap-4 items-center justify-between">
        <div className="flex flex-row gap-2 items-center">
          {hasAvatar && <AvatarImage name={review.name!} />}
          {review.name && (
            <address className="body-sm-medium not-italic">{review.name}</address>
          )}
        </div>
        <SourceLogo source={review.source} />
      </div>
      <div className="grid gap-3">
        <p className="body-sm text-secondary">{review.text}</p>
      </div>
      {review.rating && <RatingStars rating={review.rating} />}
    </div>
  );
}

/** Press review card (CyberNews / TechRadar) */
function PressReviewCard({ review }: { review: Review }) {
  return (
    <div className="grid grid-rows-[min-content_1fr_min-content] gap-4 p-6 content-start bg-secondary rounded-sm">
      <div className="flex flex-row gap-4 items-center justify-between">
        <SourceLogo source={review.source} />
      </div>
      <div className="grid gap-3">
        <p className="body-sm text-secondary">{review.text}</p>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  if (review.type === "featured") return <FeaturedCard review={review} />;
  if (review.type === "press") return <PressReviewCard review={review} />;
  return <UserReviewCard review={review} />;
}

/** Chevron left icon */
function ChevronLeft() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

/** Chevron right icon */
function ChevronRight() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export function TestimonialsSection({ dict }: TestimonialsSectionProps) {
  const reviews = dict.reviews;
  const totalSlides = reviews.length;
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  // Separate reviews by type for structured layouts
  const featuredReview = reviews.find((r) => r.type === "featured");
  const userReviews = reviews.filter((r) => !r.type);
  const pressReviews = reviews.filter((r) => r.type === "press");

  return (
    <div
      data-section="Testimonials"
      data-testid="section-Testimonials"
      className="relative scroll-mt-20 xl:scroll-mt-24 group/section"
    >
      <div className="absolute top-0 group-first/section:-top-24 bottom-0 w-full">
        <div className="w-full h-full bg-blue-100" style={{ backgroundColor: "rgb(228, 234, 244)" }} />
      </div>
      <div className="relative">
        <div className="py-16">
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              <div className="h-full w-full flex flex-col gap-y-10">
                {/* Header */}
                <div>
                  <div className="flex flex-col gap-y-6">
                    <div>
                      <h2 className="heading-xl text-center">{dict.title}</h2>
                    </div>
                    {dict.subtitle && (
                      <div>
                        <p className="text-secondary text-center">{dict.subtitle}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <div>
                    {/* Mobile: Carousel */}
                    <div className="md:hidden">
                      <div className="relative w-full mx-auto overflow-hidden">
                        <div
                          className="flex transition-transform duration-300"
                          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                          {reviews.map((review, i) => (
                            <div
                              key={i}
                              className={`flex shrink-0 w-full transition-opacity ${
                                i === currentSlide ? "opacity-100" : "opacity-0"
                              }`}
                            >
                              <ReviewCard review={review} />
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Navigation */}
                      <div className="grid grid-cols-[min-content_1fr_min-content] mt-6">
                        <button
                          className="flex items-center justify-center h-8 w-8 rounded-full shrink-0 bg-secondary"
                          aria-label="Previous slide"
                          onClick={goToPrev}
                        >
                          <ChevronLeft />
                        </button>
                        <div className="flex items-center justify-center">
                          <p className="body-xs text-secondary">
                            {currentSlide + 1} / {totalSlides}
                          </p>
                        </div>
                        <button
                          className="flex items-center justify-center h-8 w-8 rounded-full shrink-0 bg-secondary"
                          aria-label="Next slide"
                          onClick={goToNext}
                        >
                          <ChevronRight />
                        </button>
                      </div>
                    </div>

                    {/* Tablet: md visible, lg hidden */}
                    <div className="hidden md:grid lg:hidden gap-6">
                      {/* Featured card */}
                      {featuredReview && <FeaturedCard review={featuredReview} />}

                      {/* User reviews in 2-col grid */}
                      {userReviews.length > 0 && (
                        <div className="grid grid-cols-2 gap-6">
                          {userReviews.map((review, i) => (
                            <UserReviewCard key={i} review={review} />
                          ))}
                        </div>
                      )}

                      {/* Press reviews in 2-col grid */}
                      {pressReviews.length > 0 && (
                        <div className="grid grid-cols-2 gap-6">
                          {pressReviews.map((review, i) => (
                            <PressReviewCard key={i} review={review} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Desktop: lg+ 4-column layout */}
                    <div className="hidden lg:grid grid-cols-4 gap-6">
                      {/* Column 1: Jorge A. + PewDiePie */}
                      <div className="flex flex-col gap-6">
                        {userReviews[0] && <UserReviewCard review={userReviews[0]} />}
                        {userReviews[1] && <UserReviewCard review={userReviews[1]} />}
                      </div>

                      {/* Column 2: Featured (Lonely Planet) */}
                      <div className="flex flex-col justify-end">
                        {featuredReview && <FeaturedCard review={featuredReview} />}
                      </div>

                      {/* Column 3: DutchPilotGirl + Domas R. */}
                      <div className="flex flex-col gap-6">
                        {userReviews[2] && <UserReviewCard review={userReviews[2]} />}
                        {userReviews[3] && <UserReviewCard review={userReviews[3]} />}
                      </div>

                      {/* Column 4: CyberNews + TechRadar */}
                      <div className="flex flex-col gap-6 justify-end">
                        {pressReviews[0] && <PressReviewCard review={pressReviews[0]} />}
                        {pressReviews[1] && <PressReviewCard review={pressReviews[1]} />}
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
