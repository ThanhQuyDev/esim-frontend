"use client";

import { useState } from "react";

interface EsimSetupProps {
  dict: Record<string, any>;
}

const stepImages: Record<string, string[]> = {
  iphone: [
    "https://sb.nordcdn.com/m/2e23689ebdcc105/original/1-step.svg",
    "https://sb.nordcdn.com/m/2a28e7fa0cb54961/original/2-step.svg",
    "https://sb.nordcdn.com/m/3f8ce32d6d5693d3/original/3-step.svg",
  ],
  android: [
    "https://sb.nordcdn.com/m/5404d702d27288fe/original/card-choose-data-plan.svg",
    "https://sb.nordcdn.com/m/33e36bb6782200d1/original/card-setup-instructions.svg",
    "https://sb.nordcdn.com/m/6857537a7e59a70c/original/card-activate-plan.svg",
  ],
};

export function EsimSetup({ dict }: EsimSetupProps) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = dict.tabs as Array<{
    label: string;
    appTitle: string;
    steps: Array<{ title: string; description: string }>;
    manualTitle: string;
    manualSteps: string[];
  }>;

  return (
    <section data-section="how-to-setup-esim" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        {/* Header */}
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="heading-xl">{dict.title}</h2>
                <p className="body-md text-text-secondary">{dict.subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            {/* Tab buttons */}
            <div className="flex gap-1 pb-4 scrollbar-none overflow-auto">
              <div className="relative flex gap-1 w-fit p-1 border border-border-secondary rounded-full">
                {tabs.map((tab, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`relative z-[1] body-sm-medium whitespace-nowrap md:body-md-medium px-4 py-1 rounded-full transition-colors ${
                      activeTab === i
                        ? "text-text-primary-on-color bg-bg-dark"
                        : "text-text-primary hover:bg-bg-primary"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="pt-6">
              <div className="flex flex-col gap-y-10">
                {/* App setup steps */}
                <h3 className="heading-lg">{tabs[activeTab].appTitle}</h3>
                <div className="grid sm:gap-x-8 md:grid-cols-3 grid-cols-1 gap-y-8">
                  {tabs[activeTab].steps.map((step, i) => {
                    const imgKey = activeTab === 0 ? "iphone" : "android";
                    const images = stepImages[imgKey] || stepImages.iphone;
                    return (
                      <div key={i} className="flex flex-col items-start text-left relative h-full overflow-hidden rounded-sm bg-blue-100">
                        <div className="p-6 lg:pb-3">
                          <div className="pb-4 lg:pb-6">
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white">
                              <p className="body-md-medium text-text-primary">{i + 1}</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3 lg:gap-4 w-full h-full">
                            <span className="!text-[1.25rem] body-lg-medium text-text-primary">{step.title}</span>
                            <p className="body-md text-text-secondary">{step.description}</p>
                          </div>
                        </div>
                        {activeTab < 2 && images[i] && (
                          <div className="hidden md:flex justify-center items-end w-full h-full pt-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt={step.title}
                              loading="lazy"
                              width={368}
                              height={240}
                              src={images[i]}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Manual steps */}
                {tabs[activeTab].manualSteps && tabs[activeTab].manualSteps.length > 0 && (
                  <div className="flex flex-col gap-y-10">
                    <h3 className="heading-lg">{tabs[activeTab].manualTitle}</h3>
                    <ol className="flex flex-col list-inside gap-2 body-md">
                      {tabs[activeTab].manualSteps.map((step: string, i: number) => (
                        <li key={i} className="flex text-text-primary">
                          <span className="whitespace-nowrap mr-2 inline-block text-right min-w-[0.85em]">
                            {i + 1}.
                          </span>
                          <p>{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
