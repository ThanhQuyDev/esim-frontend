import Link from "next/link";

interface EsimHeroProps {
  dict: Record<string, any>;
  lang: string;
}

export function EsimHero({ dict, lang }: EsimHeroProps) {
  return (
    <section data-section="What is Saily" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="grid sm:gap-x-16 gap-y-8 grid-cols-1 md:grid-cols-2">
              <div className="h-full flex flex-col justify-center gap-y-4">
                <div className="flex flex-col justify-start gap-y-6">
                  <h1 className="heading-xl text-text-primary">{dict.title}</h1>
                  <p className="body-md text-text-secondary">{dict.subtitle}</p>
                  <div>
                    <Link
                      href={`/${lang}/`}
                      className="max-md:w-full md:w-auto text-center inline-block text-text-primary bg-accent hover:bg-accent/90 border border-accent rounded-full transition-colors py-[11px] body-md-medium px-7"
                    >
                      {dict.cta}
                    </Link>
                  </div>
                </div>
              </div>
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={dict.imageAlt}
                  loading="eager"
                  width={600}
                  height={600}
                  className="w-full rounded-lg"
                  src="https://sb.nordcdn.com/m/79249764050ec4c1/original/hero-what-is-esim-woman-sky-phone.png"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
