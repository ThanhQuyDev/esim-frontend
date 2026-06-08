"use client";

import { useState } from "react";

interface Step {
  number: string;
  title: string;
  description: string;
  imageAlt: string;
  image: string;
  termsLink?: string;
  termsHref?: string;
}

interface ReferHowItWorksProps {
  dict: Record<string, any>;
}

function StepCard({ step }: { step: Step }) {
  return (
    <div>
      <div className="flex flex-col items-start text-left rtl:text-right relative h-full break-words p-0 gap-0 overflow-hidden rounded-sm bg-blue-100">
        <div className="p-6 lg:pb-3">
          <div className="pb-4 lg:pb-6">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary">
              <p className="body-md-medium text-primary scroll-mt-20 xl:scroll-mt-24">
                {step.number}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:gap-4 w-full h-full">
            <h3 className="!text-[1.25rem] body-lg-medium text-primary scroll-mt-20 xl:scroll-mt-24">
              {step.title}
            </h3>
            <p className="body-md text-secondary scroll-mt-20 xl:scroll-mt-24">
              {step.description}
              {step.termsLink && step.termsHref && (
                <>
                  {" "}
                  <a
                    className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus underline"
                    rel="noopener noreferrer nofollow"
                    target="_blank"
                    href={step.termsHref}
                  >
                    {step.termsLink}
                  </a>
                  .
                </>
              )}
            </p>
          </div>
        </div>
        <div className="hidden md:flex justify-center items-end w-full h-full pt-3">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={step.imageAlt}
              loading="lazy"
              width={368}
              height={240}
              decoding="async"
              src={step.image}
              style={{ color: "transparent" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReferHowItWorks({ dict }: ReferHowItWorksProps) {
  const [activeTab, setActiveTab] = useState<"sprint" | "regular">("sprint");
  const tabs = dict.tabs ?? {};
  const sprintSteps: Step[] = dict.sprintSteps ?? [];
  const regularSteps: Step[] = dict.regularSteps ?? [];

  return (
    <div
      data-section="HowReferAFriendWorks"
      data-testid="section-HowReferAFriendWorks"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="heading-xl scroll-mt-20 xl:scroll-mt-24">
                  {dict.title}
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div>
              <div className="container mx-auto">
                <div className="flex gap-1 pb-4 scrollbar-none overflow-auto">
                  <div className="relative flex gap-1 w-fit p-1 border border-secondary rounded-full">
                    <button
                      type="button"
                      onClick={() => setActiveTab("sprint")}
                      className={`relative z-10 body-sm-medium whitespace-nowrap md:body-md-medium px-4 py-1 focus-visible:outline-hidden focus-visible:shadow-focus rounded-full transition-colors ${
                        activeTab === "sprint"
                          ? "bg-dark text-white"
                          : "bg-transparent text-primary hover:bg-secondary/40"
                      }`}
                    >
                      {tabs.sprint}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("regular")}
                      className={`relative z-10 body-sm-medium whitespace-nowrap md:body-md-medium px-4 py-1 focus-visible:outline-hidden focus-visible:shadow-focus rounded-full transition-colors ${
                        activeTab === "regular"
                          ? "bg-dark text-white"
                          : "bg-transparent text-primary hover:bg-secondary/40"
                      }`}
                    >
                      {tabs.regular}
                    </button>
                  </div>
                </div>
              </div>

              <div className="sm:mx-auto">
                <div className="container mx-auto">
                  {activeTab === "sprint" && (
                    <div className="pt-6">
                      <div className="grid sm:gap-x-8 md:grid-cols-3 grid-cols-1 gap-y-8">
                        {sprintSteps.map((step, i) => (
                          <StepCard key={i} step={step} />
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "regular" && (
                    <div className="pt-6">
                      <div className="grid sm:gap-x-8 md:grid-cols-3 grid-cols-1 gap-y-8">
                        {regularSteps.map((step, i) => (
                          <StepCard key={i} step={step} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
