"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PaymentResultContent } from "@/components/layout/sections/payment-result";

export default function PaymentResultPage({
  params,
}: {
  params: { lang: "en" | "vi" };
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <PaymentResultContent lang={params.lang} />
    </Suspense>
  );
}
