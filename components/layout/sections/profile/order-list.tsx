"use client";

import { useState } from "react";
import { Package, Calendar, CreditCard, ChevronRight, Loader2, AlertTriangle, ArrowLeft, RefreshCw, X } from "lucide-react";
import type { ProfileDict } from "./translations";
import type { MyOrder } from "@/lib/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  return "0₫";
}

/**
 * Modal popup for failed / pending orders.
 * - "Quay lại" closes the modal.
 * - "Thử lại" routes the user to the cart so they can retry payment, since
 *   incomplete orders preserve their cart state.
 */
function RetryPaymentModal({
  order,
  open,
  onClose,
  onRetry,
  lang,
}: {
  order: MyOrder | null;
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
  lang: "en" | "vi";
}) {
  if (!open || !order) return null;

  const isFailed = order.status === "failed" || order.status === "cancelled";
  const title = isFailed
    ? lang === "vi"
      ? "Thanh toán không thành công"
      : "Payment Failed"
    : lang === "vi"
      ? "Đơn hàng đang chờ thanh toán"
      : "Pending Payment";

  const description =
    lang === "vi"
      ? "Sản phẩm trong đơn hàng vẫn được giữ trong giỏ hàng của bạn. Bạn có thể tiếp tục thanh toán lại để hoàn tất đơn hàng."
      : "The items from this order are still in your cart. You can quickly retry the checkout to complete your purchase.";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={lang === "vi" ? "Đóng" : "Close"}
      />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={lang === "vi" ? "Đóng" : "Close"}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 pt-7 pb-6 text-center">
          <div
            className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
              isFailed ? "bg-red-100" : "bg-amber-100"
            }`}
          >
            <AlertTriangle
              className={`w-7 h-7 ${isFailed ? "text-red-600" : "text-amber-600"}`}
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-base sm:text-sm text-gray-500 leading-relaxed mb-1">
            {description}
          </p>
          <p className="text-sm font-mono text-gray-400 mt-3">
            #{order.orderNumber}
          </p>
        </div>

        <div className="px-6 pb-6 flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-base sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === "vi" ? "Quay lại" : "Go Back"}
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-base sm:text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            {lang === "vi" ? "Thử lại" : "Retry"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrderList({ orders, isLoading, t, lang }: OrderListProps) {
  const router = useRouter();
  const [retryOrder, setRetryOrder] = useState<MyOrder | null>(null);

  const handleOrderClick = (order: MyOrder, e: React.MouseEvent) => {
    if (order.status === "pending" || order.status === "failed" || order.status === "cancelled") {
      e.preventDefault();
      setRetryOrder(order);
    }
  };

  const handleRetry = () => {
    setRetryOrder(null);
    // Cart state is preserved server-side; route to /cart so the user
    // can immediately reattempt the payment via the gateway.
    router.push(`/${lang}/cart`);
  };

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
        <p className="text-gray-500 text-base sm:text-sm">{t.noOrders}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/${lang}/payment/result?orderNumber=${order.orderNumber}`}
            onClick={(e) => handleOrderClick(order, e)}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 shrink-0">
              <Package className="w-5 h-5 text-blue-500" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-base sm:text-sm font-semibold text-gray-900 truncate">
                  {order.orderNumber}
                </p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}
                >
                  {getStatusLabel(order.status, t)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
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

      <RetryPaymentModal
        order={retryOrder}
        open={!!retryOrder}
        onClose={() => setRetryOrder(null)}
        onRetry={handleRetry}
        lang={lang}
      />
    </>
  );
}
