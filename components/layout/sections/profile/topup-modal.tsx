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
  type MyEsim,
  type TopupPackage,
} from "@/lib/hooks";
import type { ProfileDict } from "./translations";

interface TopupModalProps {
  esim: MyEsim;
  open: boolean;
  onClose: () => void;
  t: ProfileDict;
  lang: "en" | "vi";
}

const PROVIDER_LABEL: Record<string, string> = {
  AIRALO: "Airalo",
  ESIM_ACCESS: "eSIMAccess",
  GADGET_KOREA: "Gadget Korea",
};

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}

function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Map a backend error message to a user-facing translation.
 * Backend returns English messages like "Provider mismatch", "not available", "not found", etc.
 */
function mapTopupError(message: string, t: ProfileDict): string {
  const lower = message.toLowerCase();
  if (lower.includes("provider") && lower.includes("mismatch")) {
    return t.topupErrorProviderMismatch;
  }
  if (lower.includes("not available") || lower.includes("unavailable")) {
    return t.topupErrorPackageUnavailable;
  }
  if (lower.includes("not found")) {
    return t.topupErrorIccidNotFound;
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

  // Reset state when modal closes/opens with different eSIM
  useEffect(() => {
    if (!open) {
      setSelectedPackageId(null);
      setErrorMessage(null);
      checkoutMutation.reset();
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

  const handleConfirm = async () => {
    setErrorMessage(null);
    if (!selectedPackage || !provider) {
      setErrorMessage(t.topupSelectPackage);
      return;
    }

    try {
      const res = await checkoutMutation.mutateAsync({
        iccid: esim.iccid,
        packageId: selectedPackage.packageId,
        provider,
        paymentMethod: "ONEPAY",
      });

      // Persist orderId so the return page can poll status even if vpc_MerchTxnRef is missing.
      try {
        sessionStorage.setItem(
          "saily_topup_pending",
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

  const isCheckingOut = checkoutMutation.isPending;
  const canConfirm = !!selectedPackage && !isCheckingOut;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={isCheckingOut ? undefined : onClose}
    >
      <div
        className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[85vh] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-gray-900 truncate">
              {t.topupTitle}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate font-mono">
              {esim.iccid}
              {provider && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] text-gray-600 font-sans">
                  {PROVIDER_LABEL[provider] ?? provider}
                </span>
              )}
            </p>
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
          {packagesLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-500">
                {lang === "vi" ? "Đang tải gói cước..." : "Loading packages..."}
              </span>
            </div>
          ) : packagesError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-700 mb-3">
                {packagesErrorObj instanceof Error
                  ? mapTopupError(packagesErrorObj.message, t)
                  : t.topupErrorLoading}
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs font-medium text-red-600 underline hover:text-red-800"
              >
                {lang === "vi" ? "Thử lại" : "Retry"}
              </button>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <Wifi className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">{t.topupNoPackages}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{t.topupSubtitle}</p>
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
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer / Action */}
        {!packagesLoading && !packagesError && packages.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-3 space-y-2.5">
            {errorMessage && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed">{errorMessage}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                disabled={isCheckingOut}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.topupCancel}
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <span className="font-bold">
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
  pkg: TopupPackage;
  selected: boolean;
  onSelect: () => void;
  t: ProfileDict;
  lang: "en" | "vi";
}

function TopupPackageItem({ pkg, selected, onSelect, t, lang }: TopupPackageItemProps) {
  const priceLabel = pkg.vndPrice
    ? formatVnd(pkg.vndPrice)
    : formatUsd(pkg.retailPrice);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-3.5 transition-all ${
        selected
          ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-100"
          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            {pkg.isUnlimited ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                <InfinityIcon className="w-3 h-3" />
                {t.topupUnlimited}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                <Wifi className="w-3 h-3" />
                {pkg.dataAmountText}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
              <Calendar className="w-3 h-3" />
              {pkg.durationDays} {t.topupDuration}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-snug">{pkg.name}</p>
          {!pkg.vndPrice && (
            <p className="text-[11px] text-amber-600 mt-1">
              ⚠ {t.topupVndUnavailable}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-base font-bold text-gray-900">{priceLabel}</span>
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
