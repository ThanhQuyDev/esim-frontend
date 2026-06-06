"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Home,
  Mail,
  User,
  Clock,
  Wallet,
  Coins,
  Loader2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { localizedHref } from "@/lib/route-mapping";
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

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PaymentResultContent({ lang }: PaymentResultContentProps) {
  const searchParams = useSearchParams();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [lastOrderInfo, setLastOrderInfo] = useState<{
    exuUsed?: number;
    referralDiscount?: number;
    referralCode?: string | null;
  } | null>(null);
  const t = paymentResultTranslations[lang];

  // Parse OnePay callback query params
  const responseCode = searchParams.get("vpc_TxnResponseCode") || "";
  const orderNumber = searchParams.get("vpc_MerchTxnRef") || searchParams.get("orderNumber") || "";
  const transactionNo = searchParams.get("vpc_TransactionNo") || "";
  const amount = parseInt(searchParams.get("vpc_Amount") || "0", 10) / 100;
  const message = searchParams.get("vpc_Message") || "";

  const isSuccess = responseCode === "0";
  const isPending = responseCode === "" && !!orderNumber;
  const responseMessage = getResponseCodeMessage(responseCode, lang);

  // Detect topup orders by the `TOPUP-` orderNumber prefix.
  const isTopup = orderNumber.startsWith("TOPUP-");

  // Fetch order details when payment succeeded OR when checking pending order status
  const {
    data: orderData,
    isFetching: isPolling,
    dataUpdatedAt,
  } = useOrderByNumber(orderNumber, isSuccess || isPending);

  // Check if a "pending" page visit is actually a paid order
  const isOrderPaid = orderData?.status === "paid";
  const showSuccess = isSuccess || (isPending && isOrderPaid);

  // Topup-specific status flags driven by polling
  const orderStatus = orderData?.status;
  const isTopupCompleted = isTopup && orderStatus === "completed";
  const isTopupFailed = isTopup && orderStatus === "failed";
  const isTopupManual = isTopup && orderStatus === "MANUAL_INTERVENTION";
  const isTopupAwaiting =
    isTopup && (isPolling || orderStatus === "pending" || orderStatus === "paid");

  // Flatten all eSIMs from order items
  const allEsims = useMemo(() => {
    if (!orderData?.items) return [];
    return orderData.items.flatMap((item) => item.esims || []);
  }, [orderData]);

  const hasEsims = allEsims.length > 0;
  const pollingFinished = !isPolling && dataUpdatedAt > 0 && !hasEsims;

  // Load last order info for eXU/referral display
  useEffect(() => {
    try {
      const raw = localStorage.getItem("esim_last_order");
      if (raw) {
        const parsed = JSON.parse(raw);
        setLastOrderInfo({
          exuUsed: parsed.exuUsed,
          referralDiscount: parsed.referralDiscount,
          referralCode: parsed.referralCode,
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // Calculate cashback (2% of payable amount)
  const orderVndPrice = orderData?.vndPrice || 0;
  const cashbackAmount = orderVndPrice > 0 ? Math.round(orderVndPrice * 0.02) : 0;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* ignore */
    }
  };

  // ===== Pending state (order not yet paid) =====
  if (isPending && !isOrderPaid) {
    return (
      <PaymentFailedState
        status="pending"
        responseMessage={lang === "vi" ? "Giao dịch đang chờ xử lý" : "Transaction is pending"}
        orderId={orderNumber}
        transactionNo={transactionNo}
        amount={amount}
        isValid={true}
        lang={lang}
      />
    );
  }

  if (!showSuccess) {
    return (
      <PaymentFailedState
        status="failed"
        responseMessage={responseMessage}
        orderId={orderNumber}
        transactionNo={transactionNo}
        amount={amount}
        isValid={true}
        lang={lang}
      />
    );
  }

  // ===== Topup success / processing / manual / failed states =====
  if (isTopup) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50/80 via-white to-white">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          {/* Header — varies by topup state */}
          <div className="text-center mb-8">
            {isTopupCompleted ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h1 className="text-[1.7rem] md:text-3xl font-medium text-gray-900 mb-3">
                  {t.topupSuccessTitle}
                </h1>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                  {t.topupSuccessSubtitle}
                </p>
              </>
            ) : isTopupManual ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-6">
                  <AlertTriangle className="w-10 h-10 text-amber-600" />
                </div>
                <h1 className="text-[1.7rem] md:text-3xl font-medium text-gray-900 mb-3">
                  {t.topupManualTitle}
                </h1>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                  {t.topupManualDesc}
                </p>
              </>
            ) : isTopupFailed ? (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-[1.7rem] md:text-3xl font-medium text-gray-900 mb-3">
                  {t.topupFailedTitle}
                </h1>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                  {t.topupFailedDesc}
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
                <h1 className="text-[1.7rem] md:text-3xl font-medium text-gray-900 mb-3">
                  {t.topupProcessingTitle}
                </h1>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                  {t.topupProcessingDesc}
                </p>
              </>
            )}
          </div>

          {/* Order Info */}
          <OrderInfoCard
            orderNumber={orderNumber}
            transactionNo={transactionNo}
            amount={amount}
            t={t}
          />

          {/* Awaiting hint while polling */}
          {isTopupAwaiting && !isTopupCompleted && !isTopupFailed && !isTopupManual && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 mb-6 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-base sm:text-sm text-blue-800">
                {lang === "vi"
                  ? "Đang đợi xác nhận từ nhà cung cấp. Trang sẽ tự động cập nhật."
                  : "Waiting for provider confirmation. This page will refresh automatically."}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              asChild
              className="flex-1 h-12 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Link href={localizedHref(lang, "profile")}>
                <Zap className="w-4 h-4 mr-2" />
                {t.topupBackToProfile}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 h-12 rounded-full border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Link href={`/${lang}`}>
                <Home className="w-4 h-4 mr-2" />
                {t.backHome}
              </Link>
            </Button>
          </div>
        </div>
      </main>
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
          <h1 className="text-[1.7rem] md:text-3xl font-medium text-gray-900 mb-3">
            {t.successTitle}
          </h1>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            {t.successSubtitle}
          </p>
          <p className="text-base sm:text-sm text-gray-500 mt-2">{t.checkProfile}</p>
        </div>

        {/* Order Info */}
        <OrderInfoCard
          orderNumber={orderNumber}
          transactionNo={transactionNo}
          amount={amount}
          t={t}
        />

        {/* eXU Cashback Banner */}
        {cashbackAmount > 0 && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 flex-shrink-0">
                <Coins className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-base sm:text-sm font-semibold text-emerald-800">
                  {lang === "vi" ? "Bạn đã nhận được" : "You earned"} {formatVnd(cashbackAmount)} eXU!
                </p>
                <p className="text-base sm:text-sm text-emerald-600 mt-0.5">
                  {lang === "vi"
                    ? "Số dư eXU sẽ được cộng vào ví của bạn."
                    : "eXU balance has been added to your wallet."}
                </p>
              </div>
            </div>
          </div>
        )}

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
            <p className="text-base sm:text-sm text-blue-800">{t.emailSent}</p>
          </div>
        )}

        {/* Polling finished but no eSIM yet */}
        {pollingFinished && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 mb-6 text-center">
            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <p className="text-amber-800 font-medium mb-1">{t.esimProcessing}</p>
            <p className="text-base sm:text-sm text-amber-600">{t.esimProcessingDesc}</p>
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
            <Link href={localizedHref(lang, "profile")}>
              <User className="w-4 h-4 mr-2" />
              {t.myProfile}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 h-12 rounded-full border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <Link href={localizedHref(lang, "profile")}>
              <Wallet className="w-4 h-4 mr-2" />
              {lang === "vi" ? "Xem ví" : "View Wallet"}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
