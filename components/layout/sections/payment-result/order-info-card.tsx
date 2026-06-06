"use client";

import type { PaymentResultDict } from "./translations";

interface OrderInfoCardProps {
  orderNumber: string;
  transactionNo: string;
  amount: number;
  t: PaymentResultDict;
}

export function OrderInfoCard({ orderNumber, transactionNo, amount, t }: OrderInfoCardProps) {
  const formatAmount = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 mb-6 shadow-sm">
      <div className="space-y-3">
        {orderNumber && (
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-base sm:text-sm text-gray-500">{t.orderId}</span>
            <span className="text-base sm:text-sm font-mono font-medium text-gray-900">{orderNumber}</span>
          </div>
        )}
        {transactionNo && (
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-base sm:text-sm text-gray-500">{t.transactionNo}</span>
            <span className="text-base sm:text-sm font-mono font-medium text-gray-900">{transactionNo}</span>
          </div>
        )}
        {amount > 0 && (
          <div className="flex justify-between items-center py-2">
            <span className="text-base sm:text-sm text-gray-500">{t.amount}</span>
            <span className="text-base sm:text-sm font-medium text-gray-900">{formatAmount(amount)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
