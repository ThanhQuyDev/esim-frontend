"use client";

interface AboutHeroProps {
  dict: Record<string, any>;
}

const heroImages = [
  {
    src: "https://sb.nordcdn.com/m/6e538b5819aa776a/original/about-us-hero-1.png",
    alt: "People taking photos of the cake as they celebrate Esim.vn's birthday at the eSIM company's HQ.",
    className: "w-[498px] lg:w-[454px] h-[300px] order-2 lg:order-1 hidden md:block",
  },
  {
    src: "https://sb.nordcdn.com/m/7ac8fe62dbb6b416/original/about-us-hero-2.png",
    alt: "Vykintas Maknickas, Esim.vn CEO, speaking at an event.",
    className: "w-[214px] h-[300px] order-3 hidden md:block",
  },
  {
    src: "https://sb.nordcdn.com/m/6f01957e31cad5fc/original/about-us-hero-3.png",
    alt: "A member of the Esim.vn team hugging a dog at the office.",
    className: "w-[214px] h-[300px] order-4 hidden lg:block",
  },
  {
    src: "https://sb.nordcdn.com/m/6cb130e8717d215/original/about-us-hero-4.png",
    alt: "Esim.vn employees gathered around a phone during a business event.",
    className: "w-[454px] h-[300px] order-5 hidden lg:block",
  },
  {
    src: "https://sb.nordcdn.com/m/69280afade2466f4/original/about-us-hero-5.png",
    alt: "Presenter giving a talk at a Esim.vn event.",
    className: "w-[214px] h-[300px] max-xl:hidden order-6 hidden xl:block",
  },
  {
    src: "https://sb.nordcdn.com/m/69f9250792426abb/original/about-us-hero-6.png",
    alt: "A traveler wearing a backpack with a Esim.vn sticker.",
    className: "w-[214px] h-[300px] max-xl:hidden order-7 hidden xl:block",
  },
];

export function AboutHero({ dict }: AboutHeroProps) {
  return (
    <section data-section="Hero" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="relative w-full max-w-[1600px] mx-auto">
        {/* Yellow wave backgrounds */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" loading="lazy" width={320} height={471} className="absolute md:hidden w-full mt-16" src="https://sb.nordcdn.com/m/388c325a471abf1e/original/two-sections-wave-xs-yellow.svg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" loading="lazy" width={768} height={650} className="absolute hidden md:block lg:hidden w-full mt-16" src="https://sb.nordcdn.com/m/67df3b7d6f2da96/original/two-sections-wave-md-yellow.svg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" loading="lazy" width={1000} height={734} className="absolute hidden lg:block xl:hidden w-full mt-16" src="https://sb.nordcdn.com/m/59b4f650c9fe680b/original/two-sections-wave-lg-yellow.svg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" loading="lazy" width={1400} height={937} className="absolute hidden xl:block w-full mt-16" src="https://sb.nordcdn.com/m/2fd26ed9ca08f89a/original/two-sections-wave-xl-yellow.svg" />

        <div className="relative py-16">
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              <div className="relative flex gap-6 flex-wrap">
                {/* Glassmorphism card */}
                <div className="w-[452px] max-lg:w-full order-1 lg:order-2">
                  <div className="flex flex-col items-start text-left gap-4 relative h-full bg-[rgba(0,0,0,0.01)] backdrop-blur-[25px] border border-[rgba(0,0,0,0.32)] rounded-lg p-6 lg:p-8">
                    <div className="h-full w-full flex flex-col gap-y-3">
                      <h1 className="heading-xl text-start">{dict.title}</h1>
                      <p className="body-md">{dict.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Photo grid */}
                {heroImages.map((img, i) => (
                  <div key={i} className={img.className}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={img.alt}
                      loading={i < 3 ? "eager" : "lazy"}
                      width={img.className.includes("w-[454px]") || img.className.includes("w-[498px]") ? 454 : 214}
                      height={300}
                      className="rounded-lg w-full h-full object-cover"
                      src={img.src}
                    />
                  </div>
                ))}

                {/* Sticker: plane */}
                <div className="absolute hidden md:block rotate-[15deg] md:top-[160px] md:left-[430px] lg:top-[280px] lg:left-[180px] xl:top-[271px] xl:left-[55px] z-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="plane sticker" loading="lazy" width={88} height={82} src="https://sb.nordcdn.com/m/452227169e641f28/original/about-us-life-at-saily-sticker-plane.svg" />
                </div>
                {/* Sticker: sailboat */}
                <div className="absolute hidden md:block md:-bottom-[25px] md:right-[152px] lg:right-[210px] xl:-bottom-[25px] xl:-right-[15px] z-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="sailboat sticker" loading="lazy" width={88} height={82} src="https://sb.nordcdn.com/m/1428c68ddf902277/original/about-us-hero-sticker-sailboat.svg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
