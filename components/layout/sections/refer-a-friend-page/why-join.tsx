interface ReferWhyJoinProps {
  dict: Record<string, any>;
}

export function ReferWhyJoin({ dict }: ReferWhyJoinProps) {
  return (
    <div
      data-section="why-saily"
      data-testid="section-why-saily"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="mx-auto">
              <div className="mx-auto container">
                <div className="grid sm:gap-x-16 gap-y-8 grid-cols-1 md:grid-cols-2">
                  <div className="h-full flex flex-col justify-center gap-y-4">
                    <div className="h-full w-full flex flex-col justify-center gap-y-4">
                      <div className="flex flex-col justify-start gap-y-6">
                        <h2 className="heading-xl text-primary scroll-mt-20 xl:scroll-mt-24">
                          {dict.title}
                        </h2>

                        <div className="flex flex-col justify-start gap-y-6">
                          <div className="body-md text-secondary">
                            <p className="text-secondary scroll-mt-20 xl:scroll-mt-24">
                              {dict.paragraph1}
                            </p>
                          </div>
                          <div className="body-md text-secondary">
                            <p className="text-secondary scroll-mt-20 xl:scroll-mt-24">
                              <b>{dict.noteLabel}</b>
                              {dict.noteBody}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:row-start-1">
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={dict.imageAlt}
                        loading="lazy"
                        width={555}
                        height={555}
                        decoding="async"
                        src="https://sb.nordcdn.com/asset/e1a678a2-a104-4321-b390-1ddf95118eb1/join-referral-program-asset.png"
                        style={{ color: "transparent" }}
                      />
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
