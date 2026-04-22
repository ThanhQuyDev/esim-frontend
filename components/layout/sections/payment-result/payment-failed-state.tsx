"use client";

import { ArrowLeft, XCircle, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PaymentStatus } from "@/lib/onepay";

const failedStatusConfig: Record<
  Exclude<PaymentStatus, "success">,
  {
    icon: typeof XCircle;
    color: string;
    bgColor: string;
    label: { en: string; vi: string };
  }
> = {
  pending: {
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    label: { en: "Payment Pending", vi: "Đang xử lý thanh toán" },
  },
  failed: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: { en: "Payment Failed", vi: "Thanh toán thất bại" },
  },
  cancelled: {
    icon: AlertTriangle,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    label: { en: "Payment Cancelled", vi: "Đã hủy thanh toán" },
  },
};

interface PaymentFailedStateProps {
  status: Exclude<PaymentStatus, "success">;
  responseMessage: string;
  orderId: string;
  transactionNo: string;
  amount: number;
  isValid: boolean;
  lang: "en" | "vi";
}

export function PaymentFailedState({
  status,
  responseMessage,
  orderId,
  transactionNo,
  amount,
  isValid,
  lang,
}: PaymentFailedStateProps) {
  const config = failedStatusConfig[status];
  const Icon = config.icon;

  const formatAmount = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20 bg-gray-50">
      <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white p-8 md:p-10 text-center shadow-sm">
        {/* Status icon */}
        <div
          className={`w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-6`}
        >
          <Icon className={`w-10 h-10 ${config.color}`} />
        </div>

        <h1 className="font-bold text-2xl md:text-3xl text-gray-900 mb-2">
          {config.label[lang]}
        </h1>

        <p className="text-gray-500 mb-8">{responseMessage}</p>

        {/* Transaction details */}
        {(orderId || transactionNo) && (
          <div className="space-y-3 mb-8 text-left">
            {orderId && (
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500">
                  {lang === "vi" ? "Mã đơn hàng" : "Order ID"}
                </span>
                <span className="text-sm font-medium text-gray-900 font-mono">{orderId}</span>
              </div>
            )}
            {transactionNo && (
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500">
                  {lang === "vi" ? "Mã giao dịch" : "Transaction No"}
                </span>
                <span className="text-sm font-medium text-gray-900 font-mono">{transactionNo}</span>
              </div>
            )}
            {amount > 0 && (
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500">
                  {lang === "vi" ? "Số tiền" : "Amount"}
                </span>
                <span className="text-sm font-bold text-gray-900">{formatAmount(amount)}</span>
              </div>
            )}
          </div>
        )}

        {/* Hash validation warning */}
        {!isValid && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700">
              {lang === "vi"
                ? "⚠️ Chữ ký bảo mật không hợp lệ. Vui lòng liên hệ hỗ trợ."
                : "⚠️ Security signature is invalid. Please contact support."}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            variant="outline"
            className="flex-1 rounded-full h-12 border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <Link href={`/${lang}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {lang === "vi" ? "Quay lại" : "Go Back"}
            </Link>
          </Button>
          <Button
            asChild
            className="flex-1 rounded-full h-12 bg-emerald-600 text-white font-semibold hover:bg-emerald-700 cursor-pointer"
          >
            <Link href={`/${lang}#pricing`}>
              {lang === "vi" ? "Thử lại" : "Try Again"}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
