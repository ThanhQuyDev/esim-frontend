"use client";

import { useState } from "react";

interface ReviewCountryListProps {
  dict: Record<string, any>;
  lang: string;
}

interface CountryItem {
  id: string;
  code: string;
  name: string;
  flagUrl: string;
  href: string;
  price: string;
  hiddenOnMobile?: boolean;
}

const countries: CountryItem[] = [
  { id: "ES", code: "ES", name: "Spain", flagUrl: "/flags/es_flag.webp", href: "/esim-spain/", price: "From US$3.99" },
  { id: "GR", code: "GR", name: "Greece", flagUrl: "/flags/gr_flag.webp", href: "/esim-greece/", price: "From US$4.49" },
  { id: "IT", code: "IT", name: "Italy", flagUrl: "/flags/it_flag.webp", href: "/esim-italy/", price: "From US$3.99" },
  { id: "TR", code: "TR", name: "Turkey", flagUrl: "/flags/tr_flag.webp", href: "/esim-turkey/", price: "From US$3.99" },
  { id: "GB", code: "GB", name: "United Kingdom", flagUrl: "/flags/gb_flag.webp", href: "/esim-united-kingdom/", price: "From US$4.49", hiddenOnMobile: true },
  { id: "PT", code: "PT", name: "Portugal", flagUrl: "/flags/pt_flag.webp", href: "/esim-portugal/", price: "From US$3.99", hiddenOnMobile: true },
  { id: "FR", code: "FR", name: "France", flagUrl: "/flags/fr_flag.webp", href: "/esim-france/", price: "From US$3.99", hiddenOnMobile: true },
  { id: "DE", code: "DE", name: "Germany", flagUrl: "/flags/de_flag.webp", href: "/esim-germany/", price: "From US$4.49", hiddenOnMobile: true },
  { id: "NL", code: "NL", name: "Netherlands", flagUrl: "/flags/nl_flag.webp", href: "/esim-netherlands/", price: "From US$3.99", hiddenOnMobile: true },
];

const tabs = [
  { id: "Country", label: "Country" },
  { id: "Region", label: "Region" },
  { id: "Ultra", label: "Ultra Plan", isNew: true },
];

function ChevronRight() {
  return (
    <svg role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" className="mt-1 ltr:-rotate-90 rtl:rotate-90 pointer-events-none text-tertiary">
      <title>Chevron right</title>
      <path fill="currentColor" fillRule="evenodd" d="M13.2151 6.8326L8.43758 11.4101C8.27758 11.5451 8.12758 11.6001 8.00008 11.6001C7.87258 11.6001 7.70083 11.5446 7.58533 11.4329L2.78533 6.8326C2.54543 6.6051 2.53763 6.2026 2.76733 5.9851C2.99546 5.74447 3.37683 5.73665 3.61508 5.96713L8.00008 10.1701L12.3851 5.9701C12.6226 5.73962 13.0046 5.74745 13.2328 5.98807C13.4626 6.2026 13.4551 6.6051 13.2151 6.8326Z"></path>
    </svg>
  );
}

export function ReviewCountryList({ dict, lang }: ReviewCountryListProps) {
  const [activeTab, setActiveTab] = useState("Country");

  return (
    <div data-section="CountryList" data-testid="section-CountryList" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="heading-xl scroll-mt-20 xl:scroll-mt-24">
                  {dict.title || "Choose the best eSIM plan for your stay"}
                </h2>
              </div>
            </div>
            <div className="hidden lg:flex items-end justify-end col-span-4" data-testid="section-button-desktop">
              <a
                role="button"
                className="max-md:w-full text-center inline-block text-primary bg-accent pointer-fine:hover:bg-accent-hover border-md border-accent pointer-fine:hover:border-accent-hover active:bg-accent-active! active:border-accent-active! box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7 w-full sm:w-auto"
                data-ga-slug="see_all_destinations"
                href={`/${lang}/destination`}
              >
                {dict.viewAll || "View All Destinations"}
              </a>
            </div>
          </div>
        </div>
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div>
              {/* Tabs */}
              <div className="mb-10 overflow-x-auto scrollbar-none">
                <div className="relative flex gap-1 w-fit p-1 border-md border-secondary rounded-full">
                  <div
                    className="absolute inset-0 pointer-events-none z-[1] bg-dark"
                    style={{
                      transform: `translateX(${activeTab === "Country" ? "4px" : activeTab === "Region" ? "101px" : "170px"})`,
                      width: activeTab === "Country" ? "97px" : activeTab === "Region" ? "80px" : "120px",
                      height: "32px",
                      top: "4px",
                      borderRadius: "1536px",
                      transition: "transform 0.3s ease-in-out, width 0.3s ease-in-out",
                    }}
                  ></div>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      data-tab={tab.id}
                      data-is-tab="true"
                      data-is-active={activeTab === tab.id ? "true" : "false"}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative z-[1] body-sm-medium whitespace-nowrap md:body-md-medium px-4 py-1 hover:text-primary focus-visible:outline-hidden focus-visible:shadow-focus rounded-full bg-transparent transition-[color] delay-250 duration-[0] ${
                        activeTab === tab.id
                          ? "text-primary-on-color! bg-dark"
                          : "text-primary hover:bg-primary"
                      }${tab.isNew ? " pr-2" : ""}`}
                    >
                      {tab.isNew ? (
                        <span className="flex items-center gap-2">
                          {tab.label}
                          <span className="text-center whitespace-nowrap rounded-full inline-block bg-accent text-primary py-0.5 px-2 body-2xs-medium">New</span>
                        </span>
                      ) : (
                        tab.label
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country list */}
              <div id="country-list-items" className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 w-full">
                {countries.map((country) => (
                  <div key={country.id} id={country.id} className={country.hiddenOnMobile ? "hidden md:block" : ""}>
                    <a
                      className="align-bottom focus-visible:outline-hidden focus-visible:shadow-focus text-primary active:text-primary block group ease-out h-full rounded-sm transition-colors hover:text-primary hover:bg-tertiary bg-primary"
                      data-ga-slug="N/A"
                      data-testid={country.code}
                      href={country.href}
                    >
                      <div
                        className="flex flex-col items-start text-left rtl:text-right gap-4 relative word-break-word transform-gpu border-none p-4 h-full rounded-sm transition-colors hover:text-primary hover:bg-tertiary bg-primary"
                        data-testid={`destination-card-${country.code}`}
                      >
                        <div className="w-full h-full flex gap-4 items-center">
                          <div className="w-[36px] h-[36px] relative overflow-hidden shrink-0 rounded-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              alt={`${country.code} flag`}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                              style={{ position: "absolute", height: "100%", width: "100%", inset: "0px", color: "transparent" }}
                              src={country.flagUrl}
                            />
                            <div className="absolute inset-0 border-md rounded-full pointer-events-none border-[rgba(0,0,0,0.1)]"></div>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <p className="body-lg-medium scroll-mt-20 xl:scroll-mt-24">{country.name}</p>
                            <p className="body-md text-tertiary scroll-mt-20 xl:scroll-mt-24">
                              <span className="whitespace-nowrap">{country.price}</span>
                            </p>
                          </div>
                          <div className="ml-auto">
                            <ChevronRight />
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="flex justify-center lg:hidden mt-10" data-testid="section-button-mobile">
              <a
                role="button"
                className="max-md:w-full text-center inline-block text-primary bg-accent pointer-fine:hover:bg-accent-hover border-md border-accent pointer-fine:hover:border-accent-hover active:bg-accent-active! active:border-accent-active! box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7 w-full sm:w-auto"
                data-ga-slug="see_all_destinations"
                href={`/${lang}/destination`}
              >
                {dict.viewAll || "View All Destinations"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
