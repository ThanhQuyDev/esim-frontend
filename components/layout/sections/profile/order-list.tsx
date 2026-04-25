"use client";

import { Package, Calendar, CreditCard, ChevronRight, Loader2 } from "lucide-react";
import type { ProfileDict } from "./translations";
import type { MyOrder } from "@/lib/hooks";
import Link from "next/link";

interface OrderListProps {
  orders: MyOrder[];
  isLoading: boolean;
  t: ProfileDict;
  lang: "en" | "vi";
}

function getStatusColor(status: string) {
  switch (status) {
    case "paid":
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "cancelled":
    case "failed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function getStatusLabel(status: string, t: ProfileDict) {
  const map: Record<string, string> = {
    pending: t.pending,
    paid: t.paid,
    completed: t.completed,
    cancelled: t.cancelled,
    failed: t.failed,
  };
  return map[status] || status;
}

function formatDate(dateStr: string, lang: string) {
  return new Date(dateStr).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(order: MyOrder) {
  if (order.vndPrice > 0) {
    return new Intl.NumberFormat("vi-VN").format(order.vndPrice) + "₫";
  }
  return "$" + order.totalAmount.toFixed(2);
}

export function OrderList({ orders, isLoading, t, lang }: OrderListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">{t.noOrders}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/${lang}/payment/result?orderNumber=${order.orderNumber}`}
          className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all group"
        >
          {/* Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 shrink-0">
            <Package className="w-5 h-5 text-blue-500" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {order.orderNumber}
              </p>
              <span
                className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full ${getStatusColor(order.status)}`}
              >
                {getStatusLabel(order.status, t)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(order.createdAt, lang)}
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                {formatAmount(order)}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
        </Link>
      ))}
    </div>
  );
}
