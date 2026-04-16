import Link from "next/link";

interface EsimCtaBannerProps {
  dict: Record<string, any>;
  lang: string;
}

export function EsimCtaBanner({ dict, lang }: EsimCtaBannerProps) {
  return (
    <section data-section="destinations-cta" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="flex lg:flex-row flex-col rounded-sm md:rounded-md lg:rounded-lg h-full overflow-hidden bg-accent">
              <div className="flex-1 flex items-center">
                <div className="md:p-16 px-6 py-8 w-full flex flex-col gap-6 lg:gap-8">
                  <div className="flex flex-col text-center items-center gap-y-4">
                    <h2 className="heading-xl">{dict.title}</h2>
                    <p className="body-md text-text-primary">{dict.subtitle}</p>
                    <Link
                      href={`/${lang}/`}
                      className="max-md:w-full md:w-auto text-center inline-block text-text-primary-on-color bg-bg-dark hover:bg-neutral-800 border border-bg-dark rounded-full transition-colors py-[11px] body-md-medium px-7"
                    >
                      {dict.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
