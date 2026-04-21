interface CouponHowToUseProps {
  dict: Record<string, any>;
  lang: string;
}

export function CouponHowToUse({ dict, lang }: CouponHowToUseProps) {
  const steps = dict.steps || [
    { text: 'Choose a plan and click on "Go to checkout."' },
    { text: 'Click the "Got a coupon?" button.' },
    { text: 'Enter the coupon code and click "Apply."' },
  ];

  return (
    <div data-section="HowToUse" data-testid="section-HowToUse" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="heading-xl text-start scroll-mt-20 xl:scroll-mt-24">
                  {dict.title || "How to use the esim.vn coupon code"}
                </h2>
                <p className="body-md text-secondary text-start scroll-mt-20 xl:scroll-mt-24">
                  {dict.description || "If you have a coupon code, you can redeem it in the app as well as on the web:"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="grid sm:gap-x-8 md:grid-cols-3 grid-cols-1 gap-y-8">
              {steps.map((step: any, index: number) => (
                <div key={index}>
                  <div className="flex flex-col items-start text-left rtl:text-right relative h-full word-break-word transform-gpu border-none p-0 gap-0 overflow-hidden rounded-sm bg-blue-100">
                    <div className="p-6">
                      <div className="pb-4 lg:pb-6">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary">
                          <p className="body-md-medium text-primary scroll-mt-20 xl:scroll-mt-24">
                            {index + 1}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 lg:gap-4 w-full h-full">
                        <p className="body-lg-medium text-primary scroll-mt-20 xl:scroll-mt-24">
                          {step.text}
                        </p>
                      </div>
                    </div>
                    <div className="hidden md:flex justify-center items-end w-full h-full pt-3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
