"use client";

import { Loader2 } from "lucide-react";
import type { PaymentResultDict } from "./translations";

interface EsimLoadingStateProps {
  t: PaymentResultDict;
}

export function EsimLoadingState({ t }: EsimLoadingStateProps) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 mb-6 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mb-4">
        <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
      </div>
      <p className="text-emerald-800 font-medium mb-2">{t.loadingEsim}</p>
      <p className="text-base text-emerald-600">{t.waitHere}</p>

      {/* Animated dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
            style={{ animationDelay: `${i * 300}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
