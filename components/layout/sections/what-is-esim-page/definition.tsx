interface EsimDefinitionProps {
  dict: Record<string, any>;
}

export function EsimDefinition({ dict }: EsimDefinitionProps) {
  return (
    <section data-section="what-is-esim" className="relative scroll-mt-20 xl:scroll-mt-24">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="grid sm:gap-x-8 md:grid-cols-2 grid-cols-1 gap-y-8">
              <div>
                <h2 className="heading-xl">{dict.title}</h2>
              </div>
              <div className="flex flex-col gap-y-6">
                {dict.paragraphs.map((p: string, i: number) => (
                  <p key={i} className="body-md text-text-secondary">{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
