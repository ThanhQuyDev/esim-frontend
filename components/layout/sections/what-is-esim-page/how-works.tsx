interface EsimHowWorksProps {
  dict: Record<string, any>;
}

export function EsimHowWorks({ dict }: EsimHowWorksProps) {
  return (
    <section data-section="how-does-it-work" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="flex flex-col gap-y-10">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={dict.imageAlt}
                  loading="lazy"
                  width={2336}
                  height={1110}
                  className="w-full rounded-lg"
                  src="https://res.cloudinary.com/deqfcfcwf/image/upload/v1782062665/man-sky-phone-status_wxgs8i.webp"
                />
              </div>
              <div className="flex flex-col gap-y-6">
                <h2 className="heading-xl">{dict.title}</h2>
                {dict.paragraphs.map((p: string, i: number) => (
                  <p key={i} className="body-md text-text-secondary">{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
