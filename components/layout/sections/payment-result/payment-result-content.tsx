"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Home, Mail, User, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getResponseCodeMessage } from "@/lib/onepay";
import { useOrderByNumber } from "@/lib/hooks";
import { OrderInfoCard } from "./order-info-card";
import { EsimLoadingState } from "./esim-loading-state";
import { EsimCard } from "./esim-card";
import { PaymentFailedState } from "./payment-failed-state";
import { paymentResultTranslations } from "./translations";

interface PaymentResultContentProps {
  lang: "en" | "vi";
}

export function PaymentResultContent({ lang }: PaymentResultContentProps) {
  const searchParams = useSearchParams();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const t = paymentResultTranslations[lang];

  // Parse OnePay callback query params
  const responseCode = searchParams.get("vpc_TxnResponseCode") || "";
  const orderNumber = searchParams.get("vpc_MerchTxnRef") || "";
  const transactionNo = searchParams.get("vpc_TransactionNo") || "";
  const amount = parseInt(searchParams.get("vpc_Amount") || "0", 10) / 100;
  const message = searchParams.get("vpc_Message") || "";

  const isSuccess = responseCode === "0";
  const responseMessage = getResponseCodeMessage(responseCode, lang);

  // Fetch order details (only when payment succeeded)
  const {
    data: orderData,
    isFetching: isPolling,
    dataUpdatedAt,
  } = useOrderByNumber(orderNumber, isSuccess);

  // Flatten all eSIMs from order items
  const allEsims = useMemo(() => {
    if (!orderData?.items) return [];
    return orderData.items.flatMap((item) => item.esims || []);
  }, [orderData]);

  const hasEsims = allEsims.length > 0;
  const pollingFinished = !isPolling && dataUpdatedAt > 0 && !hasEsims;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* ignore */
    }
  };

  // ===== Non-success states =====
  if (!isSuccess) {
    return (
      <PaymentFailedState
        status={responseCode === "" ? "pending" : "failed"}
        responseMessage={responseMessage}
        orderId={orderNumber}
        transactionNo={transactionNo}
        amount={amount}
        isValid={true}
        lang={lang}
      />
    );
  }

  // ===== Success state =====
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/80 via-white to-white">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {t.successTitle}
          </h1>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            {t.successSubtitle}
          </p>
          <p className="text-sm text-gray-500 mt-2">{t.checkProfile}</p>
        </div>

        {/* Order Info */}
        <OrderInfoCard
          orderNumber={orderNumber}
          transactionNo={transactionNo}
          amount={amount}
          t={t}
        />

        {/* eSIM Loading */}
        {isPolling && !hasEsims && <EsimLoadingState t={t} />}

        {/* eSIM Cards */}
        {hasEsims &&
          allEsims.map((esim, idx) => (
            <EsimCard
              key={esim.iccid || idx}
              esim={esim}
              index={idx}
              totalCount={allEsims.length}
              copiedField={copiedField}
              onCopy={copyToClipboard}
              t={t}
            />
          ))}

        {/* Email notice */}
        {hasEsims && (
          <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 p-4 mb-6">
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">{t.emailSent}</p>
          </div>
        )}

        {/* Polling finished but no eSIM yet */}
        {pollingFinished && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 mb-6 text-center">
            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <p className="text-amber-800 font-medium mb-1">{t.esimProcessing}</p>
            <p className="text-sm text-amber-600">{t.esimProcessingDesc}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button
            asChild
            className="flex-1 h-12 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <Link href={`/${lang}`}>
              <Home className="w-4 h-4 mr-2" />
              {t.backHome}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 h-12 rounded-full border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Link href={`/${lang}/profile`}>
              <User className="w-4 h-4 mr-2" />
              {t.myProfile}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
