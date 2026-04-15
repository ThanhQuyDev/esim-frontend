import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import type { Dictionary } from "@/lib/dictionaries";

interface PricingSectionProps {
  dict: Dictionary["pricing"];
}

export const PricingSection = ({ dict }: PricingSectionProps) => {
  const popularIndex = 2; // Asia plan

  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-accent/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/[0.08] border border-accent/[0.15] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-sm text-accent font-medium">{dict.badge}</span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-5 tracking-tight">
            {dict.title}<span className="gradient-text-purple">{dict.titleHighlight}</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">{dict.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-16">
          {dict.plans.map((plan, index) => {
            const isPopular = index === popularIndex;
            return (
              <div
                key={plan.region}
                className={`relative group glass-card p-6 md:p-7 flex flex-col transition-all duration-500 hover:border-white/[0.14] ${
                  isPopular ? "border-primary/25 glow-green bg-white/[0.06]" : "hover:bg-white/[0.06]"
                }`}
                style={{ transform: isPopular ? "scale(1.02)" : undefined }}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-bg-green text-xs font-semibold text-white shadow-[0_4px_12px_hsla(160,84%,44%,0.3)]">
                    {dict.mostPopular}
                  </div>
                )}
                <div className="text-4xl mb-3">{plan.flag}</div>
                <h3 className="font-display font-semibold text-lg text-white mb-1">{plan.region}</h3>
                <p className="text-sm text-muted-foreground mb-5">{plan.data} · {plan.validity}</p>
                <div className="mb-6">
                  <span className="font-display font-bold text-3xl text-white">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-2">{plan.pricePerGB}</span>
                </div>
                <Button
                  className={`w-full rounded-full font-semibold mt-auto h-11 transition-all duration-300 ${
                    isPopular
                      ? "gradient-bg-green text-white hover:opacity-90 hover:shadow-[0_0_24px_hsla(160,84%,44%,0.3)]"
                      : "bg-white/[0.05] text-white border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.18]"
                  }`}
                >
                  {dict.getPlan}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="glass-card p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display font-bold text-2xl text-white mb-2">{dict.allPlansTitle}</h3>
              <p className="text-muted-foreground leading-relaxed">{dict.allPlansSubtitle}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3.5">
              {dict.benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-white/80">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
