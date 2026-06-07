"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PaymentResultContent } from "@/components/layout/sections/payment-result";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { useLocale } from "next-intl";

export default function PaymentResultPage() {
  const locale = useLocale() as "vi" | "en";

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: locale === "vi" ? "Kết quả thanh toán" : "Payment Result" }]}
        lang={locale}
      />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        }
      >
        <PaymentResultContent lang={locale} />
      </Suspense>
    </main>
  );
}
