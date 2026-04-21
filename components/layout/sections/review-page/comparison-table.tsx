interface ReviewComparisonTableProps {
  dict: Record<string, any>;
  lang: string;
}

const TICK_DARK = "https://sb.nordcdn.com/m/4ead107a892b3597/original/tick-dark-mode.svg";
const TICK_LIGHT = "https://sb.nordcdn.com/m/3b17835a072bfc71/original/tick.svg";
const X_MARK = "https://sb.nordcdn.com/m/1e89028e3dc88cc6/original/x-mark.svg";

interface CompanyLogo {
  alt: string;
  src: string;
  width: number;
  height: number;
  isSrcSet?: boolean;
  srcSet?: string;
}

const companyLogos: CompanyLogo[] = [
  { alt: "esim.vn logo", src: "/logo.png", width: 76, height: 26 },
  { alt: "Airalo logo", src: "https://sb.nordcdn.com/m/77cc5cef50c57f8b/original/airalo-logo.svg", width: 59, height: 64 },
  { alt: "Holafly logo", src: "https://sb.nordcdn.com/m/43e603916e183a9c/original/holafly-logo.svg", width: 91, height: 28 },
  { alt: "Nomad logo", src: "https://sb.nordcdn.com/m/5c39fbbb13daf567/original/nomad-logo.svg", width: 57, height: 48 },
  { alt: "Ubigi logo", src: "https://sb.nordcdn.com/m/1b50adef9b466b66/original/ubigi-logo.png", width: 76, height: 40, isSrcSet: true },
];

type CellValue = "tick-dark" | "tick" | "x" | string;

interface TableRow {
  label: string;
  hasTooltip?: boolean;
  values: CellValue[];
}

const tableRows: TableRow[] = [
  {
    label: "One eSIM for supported destinations",
    hasTooltip: true,
    values: ["tick-dark", "x", "x", "x", "tick"],
  },
  {
    label: "24/7 live chat support",
    values: ["tick-dark", "tick", "tick", "tick", "x"],
  },
  {
    label: "Refunds",
    hasTooltip: true,
    values: ["tick-dark", "tick", "tick", "tick", "tick"],
  },
  {
    label: "Security features",
    values: ["tick-dark", "x", "x", "x", "x"],
  },
  {
    label: "Virtual locations",
    values: ["115+", "0", "0", "0", "0"],
  },
  {
    label: "Blocks malicious URLs",
    values: ["tick-dark", "x", "x", "x", "x"],
  },
  {
    label: "Data saver (ad blocker)",
    hasTooltip: true,
    values: ["tick-dark", "x", "x", "x", "x"],
  },
];

function CellIcon({ value, isSaily }: { value: CellValue; isSaily: boolean }) {
  if (value === "tick-dark") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt="" loading="lazy" width={24} height={24} decoding="async" className="min-w-6 w-6 min-h-6 h-6" style={{ color: "transparent" }} src={TICK_DARK} />
    );
  }
  if (value === "tick") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt="" loading="lazy" width={24} height={24} decoding="async" className="min-w-6 w-6 min-h-6 h-6" style={{ color: "transparent" }} src={TICK_LIGHT} />
    );
  }
  if (value === "x") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt="" loading="lazy" width={24} height={24} decoding="async" className="min-w-6 w-6 min-h-6 h-6" style={{ color: "transparent" }} src={X_MARK} />
    );
  }
  // Text value
  if (isSaily) {
    return <p className="body-md text-center text-primary-on-color scroll-mt-20 xl:scroll-mt-24">{value}</p>;
  }
  return <p className="body-md text-center scroll-mt-20 xl:scroll-mt-24">{value}</p>;
}

export function ReviewComparisonTable({ dict, lang }: ReviewComparisonTableProps) {
  return (
    <div data-section="ComparisonTable" data-testid="section-ComparisonTable" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="heading-xl scroll-mt-20 xl:scroll-mt-24">
                  {dict.title || "How does esim.vn compare with other eSIM providers?"}
                </h2>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="h-full w-full flex [&>div:empty]:hidden flex-col gap-y-8">
              <div>
                <div className="h-full w-full flex [&>div:empty]:hidden flex-col gap-y-8">
                  <div>
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-left rtl:text-right">
                        <thead>
                          <tr>
                            <th className="min-w-[150px] lg:min-w-[314px] w-[314px]"></th>
                            {companyLogos.map((logo, i) => (
                              <th
                                key={i}
                                scope="col"
                                className={`align-center text-center px-3 py-4 md:p-5 [&_img]:mx-auto [&_a]:whitespace-nowrap${i === 0 ? " bg-dark border-neutral-200/20 rounded-t-md" : ""}`}
                              >
                                <div>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    alt={logo.alt}
                                    loading="lazy"
                                    width={logo.width}
                                    height={logo.height}
                                    decoding="async"
                                    style={{ color: "transparent" }}
                                    src={logo.src}
                                  />
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tableRows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              <th className="align-center py-3 pr-3 md:pr-6 font-normal body-md break-words min-w-[150px] lg:min-w-[314px] w-[314px] border-neutral-200 border-b-md border-t-md">
                                {row.hasTooltip ? (
                                  <div className="h-full w-full flex [&>div:empty]:hidden flex-row items-center gap-x-2">
                                    <div>
                                      {row.label}{" "}
                                      <span className="inline-block relative">
                                        <i className="kitIcon text-center w-[1em] fa-circle-info fa-sharp fa-regular text-[16px] text-tertiary"></i>
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  row.label
                                )}
                              </th>
                              {row.values.map((value, colIndex) => (
                                <td
                                  key={colIndex}
                                  className={`align-center p-6 [&_img]:mx-auto border-b-md border-t-md${colIndex === 0 ? " bg-dark border-neutral-200/20" : " border-neutral-200"}`}
                                >
                                  <CellIcon value={value} isSaily={colIndex === 0} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <th className="min-w-[150px] lg:min-w-[314px] w-[314px]"></th>
                            <th scope="col" className="align-center text-center px-3 py-4 md:p-5 [&_img]:mx-auto [&_a]:whitespace-nowrap bg-dark border-neutral-200/20 rounded-b-md">
                              <a
                                role="button"
                                className="max-md:w-full text-center inline-block text-primary bg-accent pointer-fine:hover:bg-accent-hover border-md border-accent pointer-fine:hover:border-accent-hover active:bg-accent-active! active:border-accent-active! box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7"
                                data-ga-slug="View Plans"
                                href={`/${lang}/destination`}
                              >
                                View Plans
                              </a>
                            </th>
                            <th scope="col" className="align-center text-center px-3 py-4 md:p-5 [&_img]:mx-auto [&_a]:whitespace-nowrap"></th>
                            <th scope="col" className="align-center text-center px-3 py-4 md:p-5 [&_img]:mx-auto [&_a]:whitespace-nowrap"></th>
                            <th scope="col" className="align-center text-center px-3 py-4 md:p-5 [&_img]:mx-auto [&_a]:whitespace-nowrap"></th>
                            <th scope="col" className="align-center text-center px-3 py-4 md:p-5 [&_img]:mx-auto [&_a]:whitespace-nowrap"></th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                  <div>
                    <div className="grid sm:gap-x-8 grid-cols-12 gap-y-8">
                      <div className="col-span-12 lg:col-span-9">
                        <p className="body-xs text-tertiary scroll-mt-20 xl:scroll-mt-24">
                          *This data was taken from competitors&apos; official English-language sites on August 22, 2025, and the West Coast Labs product comparison report. For additional info, contact{" "}
                          <a className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus underline" href="mailto:support@saily.com">
                            support@saily.com
                          </a>.
                        </p>
                      </div>
                      <div className="col-span-12 lg:col-span-9">
                        <p className="body-xs text-tertiary scroll-mt-20 xl:scroll-mt-24">
                          ** esim.vn® is unaffiliated with the goods or services to which it is being compared.
                        </p>
                      </div>
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
