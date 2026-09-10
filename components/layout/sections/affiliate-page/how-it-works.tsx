interface Step {
  title: string;
  description: string;
}

interface AffiliateHowItWorksProps {
  dict: Record<string, any>;
}

/**
 * The three steps of the programme (#095, ý 4).
 *
 * The 30-day rule lives here rather than in the small print: it is the single
 * thing an affiliate most needs to understand about when they get paid.
 */
export function AffiliateHowItWorks({ dict }: AffiliateHowItWorksProps) {
  const steps: Step[] = dict.steps ?? [];

  return (
    <div
      id="how-it-works"
      data-section="affiliate-how-it-works"
      data-testid="section-affiliate-how-it-works"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <h2 className="heading-xl text-primary">{dict.title}</h2>
            <p className="body-md text-secondary mt-3 max-w-2xl">
              {dict.subtitle}
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex h-full flex-col rounded-2xl bg-blue-100 p-6"
                >
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <p className="body-md-medium text-primary">{index + 1}</p>
                  </div>
                  <h3 className="body-lg-medium text-primary mt-4 !text-[1.25rem]">
                    {step.title}
                  </h3>
                  <p className="body-md text-secondary mt-3">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {dict.windowNote && (
              <p className="body-md text-secondary mt-6 max-w-3xl rounded-xl border border-gray-200 bg-white p-5">
                {dict.windowNote}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
