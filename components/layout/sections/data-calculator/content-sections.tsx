import Image from "next/image";

interface ContentSectionsProps {
  dict: Record<string, any>;
}

export function ContentSections({ dict }: ContentSectionsProps) {
  return (
    <>
      {/* What is mobile data usage? */}
      <section className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            {/* Mobile */}
            <div className="block md:hidden">
              <div className="flex flex-col gap-y-8">
                <Image
                  alt={dict.whatIsMobileData.imageAlt}
                  src="https://sb.nordcdn.com/m/79249764050ec4c1/original/hero-what-is-esim-woman-sky-phone.png"
                  width={555}
                  height={555}
                  loading="lazy"
                  className="w-full h-auto"
                />
                <div className="flex flex-col gap-y-6">
                  <h2 className="heading-2xl text-text-primary">
                    {dict.whatIsMobileData.title}
                  </h2>
                  <p className="body-lg text-text-primary">
                    {dict.whatIsMobileData.description}
                  </p>
                </div>
              </div>
            </div>
            {/* Desktop */}
            <div className="hidden md:block">
              <div className="grid sm:gap-x-16 gap-y-8 grid-cols-1 md:grid-cols-2">
                <div className="h-full flex flex-col justify-center gap-y-6">
                  <h2 className="heading-2xl text-text-primary">
                    {dict.whatIsMobileData.title}
                  </h2>
                  <p className="body-lg text-text-primary">
                    {dict.whatIsMobileData.description}
                  </p>
                </div>
                <div>
                  <Image
                    alt={dict.whatIsMobileData.imageAlt}
                    src="https://sb.nordcdn.com/m/79249764050ec4c1/original/hero-what-is-esim-woman-sky-phone.png"
                    width={555}
                    height={555}
                    loading="lazy"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to calculate data usage */}
      <section className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            {/* Mobile */}
            <div className="block md:hidden">
              <div className="flex flex-col gap-y-8">
                <Image
                  alt={dict.howToCalculate.imageAlt}
                  src="https://sb.nordcdn.com/m/3fa0cb063dcbfdb4/original/airport-bench-select-plan.png"
                  width={555}
                  height={555}
                  loading="lazy"
                  className="w-full h-auto"
                />
                <div className="flex flex-col gap-y-6">
                  <h2 className="heading-2xl text-text-primary">
                    {dict.howToCalculate.title}
                  </h2>
                  <p className="body-lg text-text-primary">
                    {dict.howToCalculate.description1}
                  </p>
                  <p className="body-lg text-text-primary">
                    {dict.howToCalculate.description2}
                  </p>
                </div>
              </div>
            </div>
            {/* Desktop */}
            <div className="hidden md:block">
              <div className="grid sm:gap-x-16 gap-y-8 grid-cols-1 md:grid-cols-2">
                <div className="h-full flex flex-col justify-center gap-y-6">
                  <h2 className="heading-2xl text-text-primary">
                    {dict.howToCalculate.title}
                  </h2>
                  <p className="body-lg text-text-primary">
                    {dict.howToCalculate.description1}
                  </p>
                  <p className="body-lg text-text-primary">
                    {dict.howToCalculate.description2}
                  </p>
                </div>
                <div className="md:row-start-1">
                  <Image
                    alt={dict.howToCalculate.imageAlt}
                    src="https://sb.nordcdn.com/m/3fa0cb063dcbfdb4/original/airport-bench-select-plan.png"
                    width={555}
                    height={555}
                    loading="lazy"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
