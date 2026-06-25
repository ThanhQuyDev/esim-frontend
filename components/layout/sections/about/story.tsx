interface AboutStoryProps {
  dict: Record<string, any>;
}

export function AboutStory({ dict }: AboutStoryProps) {
  return (
    <section data-section="Story" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="grid sm:gap-x-16 gap-y-8 grid-cols-1 md:grid-cols-2">
              {/* Text column */}
              <div className="h-full flex flex-col justify-center gap-y-4">
                <div className="flex flex-col justify-start gap-y-6">
                  <h2 className="heading-xl text-text-primary">{dict.title}</h2>
                  {dict.paragraphs.map((p: string, i: number) => (
                    <div key={i} className="body-md text-text-secondary">
                      <p>{p}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Image column */}
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={dict.imageAlt}
                  loading="lazy"
                  width={555}
                  height={555}
                  className="rounded-lg w-full"
                  src="https://res.cloudinary.com/deqfcfcwf/image/upload/v1782062656/about-us-esimvn_iabfiq.webp"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
