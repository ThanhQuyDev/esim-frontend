"use client";

import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Wifi,
  Calendar,
  Infinity as InfinityIcon,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  useTopupPackages,
  useTopupCheckout,
  useTopupBankTransfer,
  useTopupWalletCheckout,
  useWalletMe,
  type BankTransferCheckoutResponse,
  type MyEsim,
  type TopupInvoicePayload,
  type TopupPackage,
} from "@/lib/hooks";
import type { ProfileDict } from "./translations";
import { BankTransferPanel } from "../payment/bank-transfer-panel";

interface TopupModalProps {
  esim: MyEsim;
  open: boolean;
  onClose: () => void;
  t: ProfileDict;
  lang: "en" | "vi";
}

// The supplier-name map is gone (#029): naming our wholesaler to the customer is
// a commercial leak, and nothing on this screen needs it. `provider` is still
// sent to the API — it just never reaches the page.

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}

function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Wholesaler names that must never reach a customer's screen (#029).
 *
 * The backend writes them into its own error text — "Provider MICRO_ESIM does not
 * support topup…" — and this component used to print unrecognised messages
 * verbatim, which leaked the supplier through the error channel even once the
 * badge was gone.
 */
const SUPPLIER_NAMES = [
  "airalo",
  "esim_access",
  "esimaccess",
  "gadget_korea",
  "gadgetkorea",
  "billion",
  "micro_esim",
  "microesim",
  "viettel",
];

/**
 * Map a backend error message to a user-facing translation.
 * Backend returns English messages like "Provider mismatch", "not available", "not found", etc.
 */
function mapTopupError(message: string, t: ProfileDict): string {
  const lower = message.toLowerCase();
  if (lower.includes("provider") && lower.includes("mismatch")) {
    return t.topupErrorProviderMismatch;
  }
  if (lower.includes("does not support")) {
    return t.topupNotSupported;
  }
  if (lower.includes("not available") || lower.includes("unavailable")) {
    return t.topupErrorPackageUnavailable;
  }
  if (lower.includes("not found")) {
    return t.topupErrorIccidNotFound;
  }
  // Anything unrecognised is shown as-is, so it must be checked first: a raw
  // message naming a supplier becomes the generic error instead.
  if (SUPPLIER_NAMES.some((name) => lower.includes(name))) {
    return t.topupErrorGeneric;
  }
  return message || t.topupErrorGeneric;
}

export function TopupModal({ esim, open, onClose, t, lang }: TopupModalProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: listResponse,
    isLoading: packagesLoading,
    isError: packagesError,
    error: packagesErrorObj,
    refetch,
  } = useTopupPackages(open ? esim.iccid : null, open);

  const checkoutMutation = useTopupCheckout();
  const bankTransferMutation = useTopupBankTransfer();
  // eXU pays 100% and cannot be undone, so it asks first (#028, round 4).
  const [confirmingExu, setConfirmingExu] = useState(false);
  const walletMutation = useTopupWalletCheckout();
  const [bankTransfer, setBankTransfer] =
    useState<BankTransferCheckoutResponse | null>(null);

  // eXu balance, so the button can show what is available and be disabled before
  // the customer discovers the shortfall server-side (#028).
  const { data: wallet } = useWalletMe();

  // VAT invoice, same five fields as the normal eSIM checkout (#028).
  const [wantInvoice, setWantInvoice] = useState(false);
  const [invoice, setInvoice] = useState<TopupInvoicePayload>({
    companyName: "",
    taxCode: "",
    address: "",
    invoicePhone: "",
    invoiceEmail: "",
  });

  // Reset state when modal closes/opens with different eSIM
  useEffect(() => {
    if (!open) {
      setSelectedPackageId(null);
      setErrorMessage(null);
      setBankTransfer(null);
      setConfirmingExu(false);
      setWantInvoice(false);
      setInvoice({
        companyName: "",
        taxCode: "",
        address: "",
        invoicePhone: "",
        invoiceEmail: "",
      });
      checkoutMutation.reset();
      bankTransferMutation.reset();
      walletMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, esim.iccid]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  const packages = listResponse?.packages ?? [];
  const provider = listResponse?.provider;
  const selectedPackage =
    selectedPackageId !== null
      ? packages.find((p) => p.packageId === selectedPackageId) ?? null
      : null;

  /**
   * Bank-transfer topup: creates a pending order and shows the VietQR panel.
   * The SePay webhook confirms payment asynchronously, so we stay in the modal
   * and let {@link BankTransferPanel} poll the order.
   */
  const handleBankTransfer = async () => {
    setErrorMessage(null);
    if (!selectedPackage || !provider) {
      setErrorMessage(t.topupSelectPackage);
      return;
    }

    const invoicePayload = invoiceIfRequested();
    if (invoicePayload === "invalid") return;

    try {
      const res = await bankTransferMutation.mutateAsync({
        iccid: esim.iccid,
        packageId: selectedPackage.packageId,
        provider,
        paymentMethod: "ONEPAY",
        ...(invoicePayload ? { invoice: invoicePayload } : {}),
      });
      setBankTransfer(res);

      try {
        sessionStorage.setItem(
          "esim_topup_pending",
          JSON.stringify({
            orderId: res.orderId ?? res.orderNumber,
            iccid: esim.iccid,
            provider,
            packageId: selectedPackage.packageId,
            createdAt: Date.now(),
          })
        );
      } catch {
        /* sessionStorage might be unavailable (private mode) — ignore */
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.topupErrorGeneric;
      setErrorMessage(mapTopupError(msg, t));
    }
  };

  const handleConfirm = async () => {
    setErrorMessage(null);
    if (!selectedPackage || !provider) {
      setErrorMessage(t.topupSelectPackage);
      return;
    }

    const invoicePayload = invoiceIfRequested();
    if (invoicePayload === "invalid") return;

    try {
      const res = await checkoutMutation.mutateAsync({
        iccid: esim.iccid,
        packageId: selectedPackage.packageId,
        provider,
        paymentMethod: "ONEPAY",
        ...(invoicePayload ? { invoice: invoicePayload } : {}),
      });

      // Persist orderId so the return page can poll status even if vpc_MerchTxnRef is missing.
      try {
        sessionStorage.setItem(
          "esim_topup_pending",
          JSON.stringify({
            orderId: res.orderId,
            iccid: esim.iccid,
            provider,
            packageId: selectedPackage.packageId,
            createdAt: Date.now(),
          })
        );
      } catch {
        /* sessionStorage might be unavailable (private mode) — ignore */
      }

      // Same-window redirect (OnePay does not allow iframe).
      window.location.assign(res.paymentUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.topupErrorGeneric;
      setErrorMessage(mapTopupError(msg, t));
    }
  };

  /**
   * Pay from the eXu balance (#028). No redirect: the server holds the balance,
   * marks the order paid and runs the recharge, so the result is final here.
   */
  const handleWalletPay = async () => {
    setErrorMessage(null);
    if (!selectedPackage || !provider) {
      setErrorMessage(t.topupSelectPackage);
      return;
    }
    const invoicePayload = invoiceIfRequested();
    if (invoicePayload === "invalid") return;

    try {
      const res = await walletMutation.mutateAsync({
        iccid: esim.iccid,
        packageId: selectedPackage.packageId,
        provider,
        paymentMethod: "EXU_WALLET",
        ...(invoicePayload ? { invoice: invoicePayload } : {}),
      });
      // The recharge already ran; close and let the profile page refresh.
      if (res.success) {
        onClose();
        return;
      }
      // Paid but the provider has not applied it yet — say so rather than
      // leaving the modal looking like nothing happened.
      setErrorMessage(
        lang === "vi"
          ? "Đã trừ eXU và ghi nhận đơn, nhà cung cấp đang xử lý. Vui lòng kiểm tra lại sau ít phút."
          : "Your eXU was charged and the order recorded; the provider is still applying it. Please check back in a few minutes."
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.topupErrorGeneric;
      setErrorMessage(mapTopupError(msg, t));
    }
  };

  /**
   * The invoice block, validated. Returns `undefined` when the customer did not
   * ask for one and `"invalid"` when a field is missing, so a half-filled form
   * cannot be sent as a valid invoice request.
   */
  function invoiceIfRequested(): TopupInvoicePayload | undefined | "invalid" {
    if (!wantInvoice) return undefined;
    const trimmed: TopupInvoicePayload = {
      companyName: invoice.companyName.trim(),
      taxCode: invoice.taxCode.trim(),
      address: invoice.address.trim(),
      invoicePhone: invoice.invoicePhone.trim(),
      invoiceEmail: invoice.invoiceEmail.trim(),
    };
    if (Object.values(trimmed).some((value) => !value)) {
      setErrorMessage(
        lang === "vi"
          ? "Vui lòng nhập đủ thông tin xuất hóa đơn."
          : "Please fill in every invoice field."
      );
      return "invalid";
    }
    return trimmed;
  }

  const isCheckingOut = checkoutMutation.isPending;
  const priceVnd = selectedPackage?.vndPrice ?? 0;
  // The country / region the eSIM is for, so the customer knows which trip a
  // package recharges (#028, test round 4).
  const destinationOfEsim = (() => {
    const dest = esim.plan?.destination;
    const region = esim.plan?.region;
    if (dest?.name) return { name: dest.name, flagUrl: dest.flagUrl ?? null };
    if (region?.name) return { name: region.name, flagUrl: null };
    return null;
  })();

  const walletBalance = wallet?.availableBalanceVnd ?? 0;
  const walletCovers = priceVnd > 0 && walletBalance >= priceVnd;
  const anyPending =
    isCheckingOut || bankTransferMutation.isPending || walletMutation.isPending;
  const canConfirm = !!selectedPackage && !anyPending;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={isCheckingOut ? undefined : onClose}
    >
      {/* Wider than the original `sm:max-w-lg` (#030): that had to fit four
          buttons — Huỷ / eXU / Chuyển khoản / thẻ — plus the invoice block, and
          squeezed the QR panel into a column too narrow to read. The QR step gets
          more room again, since it shows a QR code next to the bank details. */}
      <div
        data-testid="topup-modal"
        className={`relative w-full ${
          // Wide enough for "Tiếp tục thanh toán · 179.000đ" on one line beside
          // the eXU and transfer buttons (#029, test round 4).
          bankTransfer ? "sm:max-w-4xl" : "sm:max-w-3xl"
        } max-h-[92vh] sm:max-h-[85vh] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="min-w-0 flex-1">
            {/* The ICCID in the title itself (#062, test round 4):
                "Nạp thêm dữ liệu vào ICCID: 8985…". */}
            <h2
              className="text-xl sm:text-base font-semibold text-gray-900 break-all"
              data-testid="topup-title"
            >
              {lang === "vi" ? "Nạp thêm dữ liệu vào ICCID: " : "Top up data on ICCID: "}
              <span className="font-mono">{esim.iccid}</span>
            </h2>
            {/* ICCID and the product name — never the supplier (#029). The
                badge here named the wholesaler we buy from, which is ours to
                know and not the customer's. */}
            {esim.plan?.name && (
              <p className="text-sm text-gray-700 mt-0.5 truncate">{esim.plan.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isCheckingOut}
            className="ml-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t.topupCancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {bankTransfer ? (
            <>
              <BankTransferPanel info={bankTransfer} lang={lang} />
              {/* Back to the packages, or close the topup (#028, round 4). */}
              <div className="mt-4 flex justify-between gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setBankTransfer(null)}
                  data-testid="topup-bank-back"
                  className="px-4 py-2.5 rounded-xl text-base sm:text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {lang === "vi" ? "← Quay lại" : "← Back"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  data-testid="topup-bank-cancel"
                  className="px-4 py-2.5 rounded-xl text-base sm:text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  {lang === "vi" ? "Hủy" : "Cancel"}
                </button>
              </div>
            </>
          ) : confirmingExu && selectedPackage ? (
            /* Paying in eXU is final: say so, and ask (#028, test round 4). */
            <div className="space-y-4 py-2" data-testid="topup-exu-confirm">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                <p className="mb-1 font-semibold">
                  {lang === "vi" ? "Xác nhận thanh toán bằng eXU" : "Confirm paying with eXU"}
                </p>
                <p>
                  {lang === "vi"
                    ? `100% giá trị gói ${selectedPackage.name} (${formatVnd(selectedPackage.vndPrice ?? 0)}) sẽ được thanh toán bằng điểm eXU. Thao tác này không thể khôi phục, hoàn tiền hoặc hủy bỏ.`
                    : `100% of ${selectedPackage.name} (${formatVnd(selectedPackage.vndPrice ?? 0)}) will be paid with eXU points. This cannot be undone, refunded or cancelled.`}
                </p>
              </div>
              {errorMessage && <p className="text-sm text-red-700">{errorMessage}</p>}
              <div className="flex flex-wrap justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingExu(false)}
                  disabled={walletMutation.isPending}
                  data-testid="topup-exu-back"
                  className="px-4 py-2.5 rounded-xl text-base sm:text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {lang === "vi" ? "← Quay lại" : "← Back"}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={walletMutation.isPending}
                    className="px-4 py-2.5 rounded-xl text-base sm:text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    {lang === "vi" ? "Hủy" : "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={handleWalletPay}
                    disabled={walletMutation.isPending}
                    data-testid="topup-exu-confirm-btn"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-base sm:text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
                  >
                    {walletMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {lang === "vi" ? "Xác nhận thanh toán" : "Confirm payment"}
                  </button>
                </div>
              </div>
            </div>
          ) : packagesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-base sm:text-sm text-gray-500">
                {lang === "vi" ? "Đang tải gói cước..." : "Loading packages..."}
              </span>
            </div>
          ) : packagesError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-base sm:text-sm text-red-700 mb-3">
                {packagesErrorObj instanceof Error
                  ? mapTopupError(packagesErrorObj.message, t)
                  : t.topupErrorLoading}
              </p>
              <button
                onClick={() => refetch()}
                className="text-sm font-medium text-red-600 underline hover:text-red-800"
              >
                {lang === "vi" ? "Thử lại" : "Retry"}
              </button>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <Wifi className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-base sm:text-sm text-gray-500">{t.topupNoPackages}</p>
            </div>
          ) : (
            <>
              <p className="text-base sm:text-sm text-gray-500 mb-4">{t.topupSubtitle}</p>
              <div className="space-y-2.5">
                {packages.map((pkg) => (
                  <TopupPackageItem
                    key={pkg.packageId}
                    pkg={pkg}
                    selected={selectedPackageId === pkg.packageId}
                    onSelect={() => {
                      setSelectedPackageId(pkg.packageId);
                      setErrorMessage(null);
                    }}
                    t={t}
                    lang={lang}
                    destination={destinationOfEsim}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer / Action */}
        {!bankTransfer && !confirmingExu && !packagesLoading && !packagesError && packages.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-3 space-y-2.5">
            {errorMessage && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 leading-relaxed">{errorMessage}</p>
              </div>
            )}
            {/* VAT invoice, same fields as the normal eSIM checkout (#028). */}
            {/* A squarer frame (#028): this site's rounded-md / -lg are 20 / 40px,
                which turned the box into a pill around inputs already rounded. */}
            <div className="rounded-[6px] border border-gray-200 bg-white p-3">
              <label className="flex cursor-pointer items-center gap-2 text-base sm:text-sm font-medium text-gray-800">
                <input
                  type="checkbox"
                  checked={wantInvoice}
                  onChange={(e) => setWantInvoice(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                  data-testid="topup-want-invoice"
                />
                {lang === "vi" ? "Xuất hóa đơn cho đơn topup" : "Request a VAT invoice"}
              </label>
              {wantInvoice && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      ["companyName", lang === "vi" ? "Tên công ty" : "Company name"],
                      ["taxCode", lang === "vi" ? "Mã số thuế" : "Tax code"],
                      ["address", lang === "vi" ? "Địa chỉ" : "Address"],
                      ["invoicePhone", lang === "vi" ? "Số điện thoại" : "Phone"],
                      ["invoiceEmail", lang === "vi" ? "Email nhận hóa đơn" : "Invoice email"],
                    ] as const
                  ).map(([field, label]) => (
                    <input
                      key={field}
                      value={invoice[field]}
                      onChange={(e) =>
                        setInvoice((prev) => ({ ...prev, [field]: e.target.value }))
                      }
                      // Every field is required once an invoice is asked for (#028).
                      placeholder={`${label} *`}
                      aria-label={`${label} (bắt buộc)`}
                      aria-required="true"
                      className={`h-10 rounded-lg border border-gray-300 px-3 text-base sm:text-sm outline-none focus:border-gray-500 ${
                        field === "address" ? "sm:col-span-2" : ""
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onClose}
                disabled={anyPending}
                className="px-4 py-2.5 rounded-xl text-base sm:text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.topupCancel}
              </button>
              {/* Pay from the eXu balance (#028). Disabled — with the balance
                  shown — when it cannot cover the package, so the shortfall is
                  obvious before clicking. */}
              <button
                onClick={() => {
                  setErrorMessage(null);
                  if (!selectedPackage) {
                    setErrorMessage(t.topupSelectPackage);
                    return;
                  }
                  if (invoiceIfRequested() === "invalid") return;
                  setConfirmingExu(true);
                }}
                disabled={!selectedPackage || !walletCovers || anyPending}
                data-testid="topup-wallet-btn"
                title={
                  selectedPackage && !walletCovers
                    ? lang === "vi"
                      ? `Số dư eXU (${formatVnd(walletBalance)}) không đủ`
                      : `eXU balance (${formatVnd(walletBalance)}) is not enough`
                    : undefined
                }
                className="px-4 py-2.5 rounded-xl text-base sm:text-sm font-semibold border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {walletMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {lang === "vi" ? "Trả bằng eXU" : "Pay with eXU"}
                    <span className="ml-1 font-medium">· {formatVnd(walletBalance)}</span>
                  </>
                )}
              </button>
              <button
                onClick={handleBankTransfer}
                disabled={!selectedPackage || anyPending}
                data-testid="topup-bank-transfer-btn"
                className="px-4 py-2.5 rounded-xl text-base sm:text-sm font-semibold border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {bankTransferMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : lang === "vi" ? (
                  "Chuyển khoản"
                ) : (
                  "Bank transfer"
                )}
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canConfirm}
                data-testid="topup-card-btn"
                className="flex-1 min-w-[220px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-base sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.topupProcessing}
                  </>
                ) : (
                  <>
                    {t.topupConfirmButton}
                    {selectedPackage && (
                      <span className="font-medium">
                        {selectedPackage.vndPrice
                          ? `· ${formatVnd(selectedPackage.vndPrice)}`
                          : `· ${formatUsd(selectedPackage.retailPrice)}`}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TopupPackageItemProps {
  /** Where the eSIM works — flag + name before the data label (#028). */
  destination?: { name: string; flagUrl?: string | null } | null;
  pkg: TopupPackage;
  selected: boolean;
  onSelect: () => void;
  t: ProfileDict;
  lang: "en" | "vi";
}

function TopupPackageItem({ pkg, selected, onSelect, t, lang, destination }: TopupPackageItemProps) {
  const priceLabel = pkg.vndPrice
    ? formatVnd(pkg.vndPrice)
    : formatUsd(pkg.retailPrice);

  return (
    <button
      type="button"
      onClick={onSelect}
      data-testid={`topup-package-${pkg.packageId}`}
      className={`w-full text-left rounded-xl border p-3.5 transition-all ${
        selected
          ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-100"
          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {destination?.name && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800" data-testid="topup-destination">
                {destination.flagUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={destination.flagUrl}
                    alt=""
                    className="h-5 w-5 rounded-full border border-gray-200 object-cover"
                  />
                )}
                {destination.name}
              </span>
            )}
            {pkg.isUnlimited ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                <InfinityIcon className="w-3 h-3" />
                {t.topupUnlimited}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                <Wifi className="w-3 h-3" />
                {pkg.dataAmountText}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
              <Calendar className="w-3 h-3" />
              {pkg.durationDays} {t.topupDuration}
            </span>
          </div>
          <p className="text-base sm:text-sm text-gray-700 leading-snug">{pkg.name}</p>
          {!pkg.vndPrice && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠ {t.topupVndUnavailable}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-xl sm:text-base font-medium text-gray-900">{priceLabel}</span>
          <span
            className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors ${
              selected
                ? "border-blue-600 bg-blue-600"
                : "border-gray-300 bg-white"
            }`}
          >
            {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </span>
        </div>
      </div>
    </button>
  );
}
