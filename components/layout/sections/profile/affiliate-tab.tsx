"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  Link2,
  Loader2,
  MousePointerClick,
  Plus,
  ShoppingBag,
  Wallet,
} from "lucide-react";

import {
  useCreatePartnerLink,
  usePartnerLinks,
  usePartnerOrders,
  usePartnerWallet,
  type PartnerLink,
  type PartnerOrderRow,
  type PartnerProfile,
} from "@/lib/hooks";

/** Mirrors the API's minimum for a self-chosen code. */
const CODE_MIN_LENGTH = 6;
const CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

const TEXT = {
  vi: {
    heading: "Chương trình Affiliate",
    statusPending:
      "Hồ sơ đối tác của bạn đang chờ duyệt. Bạn sẽ nhận email ngay khi có kết quả.",
    statusRejected:
      "Hồ sơ đối tác của bạn chưa được duyệt. Kiểm tra email để xem lý do và nộp lại.",
    statusBlocked:
      "Tài khoản đối tác của bạn đang tạm dừng. Liên hệ hỗ trợ để biết thêm chi tiết.",
    walletTitle: "Ví hoa hồng",
    walletPending: "Chờ đối soát",
    walletAvailable: "Khả dụng",
    walletWithdrawn: "Đã rút luỹ kế",
    walletPendingHelp:
      "Hoa hồng đã phát sinh, sẽ chuyển sang Khả dụng sau khi đơn được đối soát.",
    walletPayoutRequested:
      "Đang có yêu cầu rút {amount} chờ xử lý — phần này đã trừ khỏi số Khả dụng.",
    walletWithdrawHelp:
      "Muốn rút tiền? Liên hệ hỗ trợ để tạo yêu cầu — chúng tôi chuyển về tài khoản ngân hàng trong hồ sơ đối tác của bạn.",
    linksTitle: "Link và mã giới thiệu",
    linksEmpty:
      "Bạn chưa có link nào. Tạo link đầu tiên để bắt đầu nhận hoa hồng.",
    newLink: "Tạo link mới",
    labelField: "Tên gợi nhớ",
    labelPlaceholder: "Ví dụ: Video review Nhật Bản",
    codeField: "Mã giới thiệu",
    codeOptional: "để trống để hệ thống tự tạo",
    codePlaceholder: "VIDUMINHHOA",
    codeHelp: `Tối thiểu ${CODE_MIN_LENGTH} ký tự, chỉ gồm chữ, số, dấu - và _`,
    targetField: "Trang đích",
    targetOptional: "để trống là về trang chủ",
    targetPlaceholder: "/esim-nhat-ban",
    create: "Tạo link",
    creating: "Đang tạo...",
    cancel: "Huỷ",
    copy: "Sao chép",
    copied: "Đã sao chép",
    clicks: "lượt bấm",
    orders: "đơn",
    ordersTitle: "Đơn hàng từ link của bạn",
    ordersEmpty: "Chưa có đơn hàng nào từ link giới thiệu của bạn.",
    filterAll: "Tất cả",
    filterValid: "Hợp lệ",
    filterPending: "Đang chờ",
    filterInvalid: "Không hợp lệ",
    commission: "Hoa hồng",
    validityValid: "Hợp lệ",
    validityPending: "Đang chờ đối soát",
    validityInvalid: "Không hợp lệ",
    reasonSelfReferral:
      "Đơn do chính bạn đặt qua link của mình — không được tính hoa hồng",
    reasonOrderCancelled: "Đơn đã huỷ hoặc hoàn tiền",
    reasonCommissionReversed: "Hoa hồng đã bị thu hồi",
    reasonNoCommission: "Đơn không phát sinh hoa hồng",
    validationLabel: "Vui lòng nhập tên gợi nhớ.",
    validationCodeShort: `Mã giới thiệu cần ít nhất ${CODE_MIN_LENGTH} ký tự.`,
    validationCodeChars:
      "Mã giới thiệu chỉ gồm chữ, số, dấu gạch ngang và gạch dưới.",
    loadError: "Không tải được dữ liệu đối tác. Vui lòng thử lại.",
  },
  en: {
    heading: "Affiliate programme",
    statusPending:
      "Your partner application is waiting for review. We will email you as soon as it is decided.",
    statusRejected:
      "Your partner application was not approved. Check your email for the reason and apply again.",
    statusBlocked:
      "Your partner account is on hold. Contact support for details.",
    walletTitle: "Commission wallet",
    walletPending: "Awaiting reconciliation",
    walletAvailable: "Available",
    walletWithdrawn: "Withdrawn to date",
    walletPendingHelp:
      "Commission you have earned. It moves to Available once the order is reconciled.",
    walletPayoutRequested:
      "A withdrawal of {amount} is being processed — it is already deducted from Available.",
    walletWithdrawHelp:
      "Want to withdraw? Contact support to raise a request — we pay out to the bank account on your partner profile.",
    linksTitle: "Links and referral codes",
    linksEmpty:
      "You have no links yet. Create your first one to start earning commission.",
    newLink: "New link",
    labelField: "Name it",
    labelPlaceholder: "e.g. Japan review video",
    codeField: "Referral code",
    codeOptional: "leave empty to generate one",
    codePlaceholder: "MYCODE01",
    codeHelp: `At least ${CODE_MIN_LENGTH} characters — letters, digits, - and _ only`,
    targetField: "Landing page",
    targetOptional: "empty goes to the homepage",
    targetPlaceholder: "/japan",
    create: "Create link",
    creating: "Creating...",
    cancel: "Cancel",
    copy: "Copy",
    copied: "Copied",
    clicks: "clicks",
    orders: "orders",
    ordersTitle: "Orders from your links",
    ordersEmpty: "No orders have come through your links yet.",
    filterAll: "All",
    filterValid: "Valid",
    filterPending: "Pending",
    filterInvalid: "Invalid",
    commission: "Commission",
    validityValid: "Valid",
    validityPending: "Awaiting reconciliation",
    validityInvalid: "Not valid",
    reasonSelfReferral:
      "You placed this order through your own link — it earns no commission",
    reasonOrderCancelled: "Order cancelled or refunded",
    reasonCommissionReversed: "Commission was reversed",
    reasonNoCommission: "This order earned no commission",
    validationLabel: "Please name this link.",
    validationCodeShort: `A referral code needs at least ${CODE_MIN_LENGTH} characters.`,
    validationCodeChars:
      "A referral code may only contain letters, digits, - and _.",
    loadError: "Could not load your partner data. Please try again.",
  },
} as const;

/** Same keys in either language, values just strings. */
type AffiliateText = { [K in keyof (typeof TEXT)["vi"]]: string };

/** Which sentence explains each way an order can fail to earn (#095). */
const REASON_KEYS: Record<
  NonNullable<PartnerOrderRow["invalidReason"]>,
  keyof AffiliateText
> = {
  self_referral: "reasonSelfReferral",
  order_cancelled: "reasonOrderCancelled",
  commission_reversed: "reasonCommissionReversed",
  no_commission: "reasonNoCommission",
};

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + "đ";
}

/**
 * Affiliates tab in the customer profile (#095, ý c).
 *
 * A partner had nowhere to see their own numbers: the links, clicks and
 * commissions all existed in the API and in the CMS, but the person earning the
 * money could only ask an admin. This is their side of it — their links, and
 * which of their orders actually counted.
 */
export function AffiliateTab({
  lang,
  partner,
}: {
  lang: "en" | "vi";
  partner: PartnerProfile;
}) {
  const t: AffiliateText = TEXT[lang];
  const isActive = partner.status === "active";

  const { data: links = [], isError: linksError } = usePartnerLinks(isActive);
  const { data: orders = [], isError: ordersError } = usePartnerOrders(isActive);
  const { data: wallet } = usePartnerWallet(isActive);
  const createLink = useCreatePartnerLink();

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [code, setCode] = useState("");
  const [targetPath, setTargetPath] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "valid" | "pending" | "invalid">(
    "all"
  );

  const origin =
    typeof window === "undefined" ? "https://esim.vn" : window.location.origin;

  const counts = useMemo(
    () => ({
      all: orders.length,
      valid: orders.filter((o) => o.validity === "valid").length,
      pending: orders.filter((o) => o.validity === "pending").length,
      invalid: orders.filter((o) => o.validity === "invalid").length,
    }),
    [orders]
  );

  const visibleOrders = useMemo(
    () =>
      filter === "all" ? orders : orders.filter((o) => o.validity === filter),
    [orders, filter]
  );

  // A partner who is not active yet has nothing to manage — say why rather
  // than showing an empty screen that looks broken.
  if (!isActive) {
    const message =
      partner.status === "pending"
        ? t.statusPending
        : partner.status === "rejected"
          ? t.statusRejected
          : t.statusBlocked;
    return (
      <div
        className="bg-white rounded-2xl p-6 border border-gray-100"
        data-testid="affiliate-status-notice"
      >
        <h2 className="text-base font-medium text-gray-900 mb-2">
          {t.heading}
        </h2>
        <p className="text-base sm:text-sm text-gray-600">{message}</p>
      </div>
    );
  }

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCode(value);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      /* clipboard blocked — the code is on screen to copy by hand */
    }
  };

  const submit = () => {
    setFormError(null);
    const trimmedLabel = label.trim();
    const trimmedCode = code.trim();

    if (!trimmedLabel) {
      setFormError(t.validationLabel);
      return;
    }
    if (trimmedCode) {
      if (trimmedCode.length < CODE_MIN_LENGTH) {
        setFormError(t.validationCodeShort);
        return;
      }
      if (!CODE_PATTERN.test(trimmedCode)) {
        setFormError(t.validationCodeChars);
        return;
      }
    }

    createLink.mutate(
      {
        label: trimmedLabel,
        ...(trimmedCode ? { code: trimmedCode } : {}),
        ...(targetPath.trim() ? { targetPath: targetPath.trim() } : {}),
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setLabel("");
          setCode("");
          setTargetPath("");
        },
        onError: (err: Error) => setFormError(err.message),
      }
    );
  };

  return (
    <div className="space-y-6" data-testid="affiliate-tab">
      {(linksError || ordersError) && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-base sm:text-sm">{t.loadError}</p>
        </div>
      )}

      {/* ---- Wallet: the three buckets from the brief (#095, ý 2) ---- */}
      {wallet && (
        <div
          className="bg-white rounded-2xl p-6 border border-gray-100"
          data-testid="affiliate-wallet"
        >
          <h2 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-400" />
            {t.walletTitle}
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-sm text-amber-700">{t.walletPending}</p>
              <p
                className="mt-1 text-lg font-semibold text-amber-900 tabular-nums"
                data-testid="affiliate-wallet-pending"
              >
                {formatVnd(wallet.pendingCommissionVnd)}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">{t.walletAvailable}</p>
              <p
                className="mt-1 text-lg font-semibold text-emerald-900 tabular-nums"
                data-testid="affiliate-wallet-available"
              >
                {formatVnd(wallet.availableBalanceVnd)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-600">{t.walletWithdrawn}</p>
              <p
                className="mt-1 text-lg font-semibold text-gray-900 tabular-nums"
                data-testid="affiliate-wallet-withdrawn"
              >
                {formatVnd(wallet.withdrawnVnd)}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-500">{t.walletPendingHelp}</p>

          {/* Money already claimed is missing from Available; without saying so
              the partner reads it as money that disappeared. */}
          {wallet.pendingPayoutVnd > 0 && (
            <p
              className="mt-2 text-sm text-gray-600"
              data-testid="affiliate-wallet-payout-pending"
            >
              {t.walletPayoutRequested.replace(
                "{amount}",
                formatVnd(wallet.pendingPayoutVnd)
              )}
            </p>
          )}

          <p className="mt-3 text-sm text-gray-500">{t.walletWithdrawHelp}</p>
        </div>
      )}

      {/* ---- Links ---- */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-gray-900 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-gray-400" />
            {t.linksTitle}
          </h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-base sm:text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              data-testid="affiliate-new-link"
            >
              <Plus className="w-4 h-4" />
              {t.newLink}
            </button>
          )}
        </div>

        {showForm && (
          <div
            className="mb-5 space-y-3 rounded-xl border border-gray-200 bg-gray-50/70 p-4"
            data-testid="affiliate-link-form"
          >
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t.labelField}
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t.labelPlaceholder}
                data-testid="affiliate-link-label"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-base sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t.codeField}{" "}
                <span className="text-gray-400">({t.codeOptional})</span>
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t.codePlaceholder}
                data-testid="affiliate-link-code"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-base sm:text-sm uppercase"
              />
              <p className="mt-1 text-xs text-gray-500">{t.codeHelp}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t.targetField}{" "}
                <span className="text-gray-400">({t.targetOptional})</span>
              </label>
              <input
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                placeholder={t.targetPlaceholder}
                data-testid="affiliate-link-target"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-base sm:text-sm"
              />
            </div>

            {formError && (
              <p
                className="text-base sm:text-sm text-red-600"
                data-testid="affiliate-link-error"
              >
                {formError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={createLink.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-base sm:text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-60 rounded-lg transition-colors"
                data-testid="affiliate-link-submit"
              >
                {createLink.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {createLink.isPending ? t.creating : t.create}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormError(null);
                }}
                className="px-4 py-2 text-base sm:text-sm text-gray-500 hover:text-gray-700"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {links.length === 0 ? (
          <p className="text-base sm:text-sm text-gray-500">{t.linksEmpty}</p>
        ) : (
          <ul className="space-y-3" data-testid="affiliate-link-list">
            {links.map((link: PartnerLink) => {
              // The public form. `/api/go/...` is the handler behind a rewrite
              // (see next.config.mjs) and must never be what a partner pastes
              // into a video bio — the partner portal shares this same shape.
              const url = `${origin}/go/${link.code}`;
              return (
                <li
                  key={link.id}
                  className="rounded-xl border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base sm:text-sm font-medium text-gray-900 truncate">
                        {link.label}
                      </p>
                      <p className="mt-0.5 font-mono text-sm text-gray-500 break-all">
                        {url}
                      </p>
                    </div>
                    <button
                      onClick={() => copy(url)}
                      className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {copiedCode === url ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copiedCode === url ? t.copied : t.copy}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <MousePointerClick className="w-3.5 h-3.5" />
                      {link.clickCount} {t.clicks}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {link.conversionCount} {t.orders}
                    </span>
                    <span className="tabular-nums">
                      {formatVnd(Number(link.totalCommissionVnd) || 0)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ---- Orders ---- */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-base font-medium text-gray-900 mb-4">
          {t.ordersTitle}
        </h2>

        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ["all", t.filterAll],
              ["valid", t.filterValid],
              ["pending", t.filterPending],
              ["invalid", t.filterInvalid],
            ] as const
          ).map(([key, text]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              data-testid={`affiliate-filter-${key}`}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                filter === key
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {text} ({counts[key]})
            </button>
          ))}
        </div>

        {visibleOrders.length === 0 ? (
          <p className="text-base sm:text-sm text-gray-500">{t.ordersEmpty}</p>
        ) : (
          <ul className="space-y-3" data-testid="affiliate-order-list">
            {visibleOrders.map((order: PartnerOrderRow) => (
              <li
                key={order.orderNumber}
                className="rounded-xl border border-gray-100 p-4"
                data-testid={`affiliate-order-${order.validity}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-gray-900">
                      {order.orderNumber}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString(
                        lang === "vi" ? "vi-VN" : "en-GB"
                      )}
                      {order.linkCode ? ` · ${order.linkCode}` : ""}
                    </p>
                  </div>
                  <ValidityBadge order={order} t={t} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="text-gray-500 tabular-nums">
                    {formatVnd(order.vndPrice)}
                  </span>
                  {order.commissionVnd != null && (
                    <span className="text-gray-900 tabular-nums">
                      {t.commission}: {formatVnd(order.commissionVnd)}
                    </span>
                  )}
                </div>
                {order.invalidReason && (
                  <p
                    className="mt-2 text-sm text-gray-500"
                    data-testid={`affiliate-reason-${order.invalidReason}`}
                  >
                    {REASON_KEYS[order.invalidReason]
                      ? t[REASON_KEYS[order.invalidReason]]
                      : t.reasonNoCommission}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ValidityBadge({
  order,
  t,
}: {
  order: PartnerOrderRow;
  t: AffiliateText;
}) {
  const styles: Record<PartnerOrderRow["validity"], string> = {
    valid: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    invalid: "bg-gray-100 text-gray-500",
  };
  const labels: Record<PartnerOrderRow["validity"], string> = {
    valid: t.validityValid,
    pending: t.validityPending,
    invalid: t.validityInvalid,
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${styles[order.validity]}`}
    >
      {labels[order.validity]}
    </span>
  );
}
