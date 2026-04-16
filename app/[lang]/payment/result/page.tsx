"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CheckCircle, XCircle, Clock, AlertTriangle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { parsePaymentResponse, getResponseCodeMessage, type PaymentStatus } from "@/lib/onepay";

const statusConfig: Record<
  PaymentStatus,
  { icon: typeof CheckCircle; color: string; bgColor: string; label: { en: string; vi: string } }
> = {
  success: {
    icon: CheckCircle,
    color: "text-primary",
    bgColor: "bg-primary/15",
    label: { en: "Payment Successful", vi: "Thanh toán thành công" },
  },
  pending: {
    icon: Clock,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/15",
    label: { en: "Payment Pending", vi: "Đang xử lý thanh toán" },
  },
  failed: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-400/15",
    label: { en: "Payment Failed", vi: "Thanh toán thất bại" },
  },
  cancelled: {
    icon: AlertTriangle,
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
    label: { en: "Payment Cancelled", vi: "Đã hủy thanh toán" },
  },
};

export default function PaymentResultPage({
  params,
}: {
  params: { lang: "en" | "vi" };
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" /></div>}>
      <PaymentResultContent lang={params.lang} />
    </Suspense>
  );
}

function PaymentResultContent({ lang }: { lang: "en" | "vi" }) {
  const searchParams = useSearchParams();

  const result = useMemo(() => {
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    return parsePaymentResponse(queryParams);
  }, [searchParams]);

  const config = statusConfig[result.status];
  const Icon = config.icon;
  const responseMessage = getResponseCodeMessage(result.responseCode, lang);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="glass-card max-w-md w-full p-8 md:p-10 text-center">
        {/* Status icon */}
        <div
          className={`w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-6`}
        >
          <Icon className={`w-10 h-10 ${config.color}`} />
        </div>

        {/* Status title */}
        <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-2">
          {config.label[lang]}
        </h1>

        {/* Response message */}
        <p className="text-muted-foreground mb-8">{responseMessage}</p>

        {/* Transaction details */}
        {(result.orderId || result.transactionNo) && (
          <div className="space-y-3 mb-8 text-left">
            {result.orderId && (
              <div className="flex justify-between items-center py-2.5 border-b border-white/[0.06]">
                <span className="text-sm text-muted-foreground">
                  {lang === "vi" ? "Mã đơn hàng" : "Order ID"}
                </span>
                <span className="text-sm font-medium text-white font-mono">
                  {result.orderId}
                </span>
              </div>
            )}
            {result.transactionNo && (
              <div className="flex justify-between items-center py-2.5 border-b border-white/[0.06]">
                <span className="text-sm text-muted-foreground">
                  {lang === "vi" ? "Mã giao dịch" : "Transaction No"}
                </span>
                <span className="text-sm font-medium text-white font-mono">
                  {result.transactionNo}
                </span>
              </div>
            )}
            {result.amount > 0 && (
              <div className="flex justify-between items-center py-2.5 border-b border-white/[0.06]">
                <span className="text-sm text-muted-foreground">
                  {lang === "vi" ? "Số tiền" : "Amount"}
                </span>
                <span className="text-sm font-bold text-white">
                  {formatAmount(result.amount)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Hash validation warning */}
        {!result.isValid && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-400">
              {lang === "vi"
                ? "⚠️ Chữ ký bảo mật không hợp lệ. Vui lòng liên hệ hỗ trợ."
                : "⚠️ Security signature is invalid. Please contact support."}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {result.status === "success" ? (
            <Button
              asChild
              className="flex-1 gradient-bg-green text-white font-semibold rounded-full h-12 hover:opacity-90"
            >
              <Link href={`/${lang}`}>
                <Home className="w-4 h-4 mr-2" />
                {lang === "vi" ? "Về trang chủ" : "Back to Home"}
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                className="flex-1 rounded-full h-12 border-white/[0.1] bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
              >
                <Link href={`/${lang}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {lang === "vi" ? "Quay lại" : "Go Back"}
                </Link>
              </Button>
              <Button
                asChild
                className="flex-1 gradient-bg-green text-white font-semibold rounded-full h-12 hover:opacity-90"
              >
                <Link href={`/${lang}#pricing`}>
                  {lang === "vi" ? "Thử lại" : "Try Again"}
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
