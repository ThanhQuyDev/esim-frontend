"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PaymentResultContent } from "@/components/layout/sections/payment-result";
import { Breadcrumb } from "@/components/layout/breadcrumb";

export default function PaymentResultPage({
  params,
}: {
  params: { lang: "en" | "vi" };
}) {
  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: params.lang === "vi" ? "Kết quả thanh toán" : "Payment Result" }]}
        lang={params.lang}
      />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        }
      >
        <PaymentResultContent lang={params.lang} />
      </Suspense>
    </main>
  );
}
