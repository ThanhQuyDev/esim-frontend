import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";

interface CTASectionProps {
  dict: Dictionary["cta"];
}

export const CTASection = ({ dict }: CTASectionProps) => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/[0.08] rounded-full blur-[180px]" />
        <div className="absolute top-1/2 right-[-10%] w-[350px] h-[350px] bg-accent/[0.06] rounded-full blur-[120px]" />
      </div>
      <div className="container relative z-10">
        <div className="glass-card p-10 md:p-16 lg:p-20 text-center max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-primary/[0.08] blur-[60px] rounded-full" />
          <h2 className="font-display font-medium text-3xl md:text-4xl lg:text-5xl text-white mb-5 tracking-tight relative">
            {dict.title}<span className="gradient-text">{dict.titleHighlight}</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed relative">{dict.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
            <Button asChild size="lg" className="gradient-bg-green text-white font-semibold rounded-full px-8 h-13 text-xl sm:text-base hover:opacity-90 transition-all duration-300 hover:shadow-[0_0_32px_hsla(160,84%,44%,0.35)]">
              <Link href="#pricing">
                {dict.ctaPrimary}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 h-13 text-xl sm:text-base border-white/[0.1] bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white hover:border-white/[0.18] transition-all duration-300">
              <Download className="mr-2 w-5 h-5" />
              {dict.ctaSecondary}
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-10 pt-8 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex -space-x-1">
                {["⭐","⭐","⭐","⭐","⭐"].map((s, i) => <span key={i} className="text-sm">{s}</span>)}
              </div>
              <span className="text-base sm:text-sm">{dict.trustRating}</span>
            </div>
            <div className="w-px h-4 bg-white/[0.08]" />
            <span className="text-base sm:text-sm text-muted-foreground">{dict.trustBrand}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
