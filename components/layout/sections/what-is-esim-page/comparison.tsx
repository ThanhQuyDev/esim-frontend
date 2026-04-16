import { Phone, Globe, Trash2, CheckCircle, Smartphone, Signal } from "lucide-react";

interface EsimComparisonProps {
  dict: Record<string, any>;
}

const rowIcons = [Phone, Globe, Trash2, CheckCircle, Smartphone, Signal];

export function EsimComparison({ dict }: EsimComparisonProps) {
  return (
    <section data-section="table" className="relative scroll-mt-20 xl:scroll-mt-24">
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
            <div className="flex flex-col gap-y-8">
              <div className="relative overflow-x-auto rounded-md max-w-full shadow-[0_0_0_1px_#E2E2E4,0_0_1px_0_#E2E2E4]">
                <table className="w-full text-left lg:table-fixed">
                  <thead className="body-md-medium text-text-tertiary">
                    <tr>
                      <th scope="col" className="align-top p-6">
                        <p className="body-md-medium">&nbsp;</p>
                      </th>
                      <th scope="col" className="align-top p-6">
                        <p className="body-md-medium">eSIM</p>
                      </th>
                      <th scope="col" className="align-top p-6">
                        <p className="body-md-medium">SIM</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dict.rows.map((row: any, i: number) => {
                      const Icon = rowIcons[i] || Phone;
                      return (
                        <tr key={i} className="odd:bg-bg-primary even:bg-bg-secondary">
                          <th
                            scope="row"
                            className="align-top body-md font-normal whitespace-nowrap lg:whitespace-normal break-words p-6"
                          >
                            <div className="flex flex-row gap-x-4">
                              <Icon className="w-6 h-6 shrink-0" />
                              <p className="body-md">{row.label}</p>
                            </div>
                          </th>
                          <td className="align-top body-md font-normal whitespace-nowrap lg:whitespace-normal break-words p-6">
                            <p>{row.esim}</p>
                          </td>
                          <td className="align-top body-md font-normal whitespace-nowrap lg:whitespace-normal break-words p-6">
                            <p>{row.sim}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {dict.footnote && <p>{dict.footnote}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
