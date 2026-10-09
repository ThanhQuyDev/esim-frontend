"use client";

import { esimQrLogoSettings } from "@/lib/esim-qr";
import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Loader2,
  ExternalLink,
  QrCode,
  Wifi,
  Calendar,
  Info,
  Zap,
  Apple,
  ShoppingCart,
} from "lucide-react";
import type { EsimDataUsage, MyEsim } from "@/lib/hooks";
import { useEsimDataUsage } from "@/lib/hooks";
import { DataUsageBar, statusLabel, USAGE_STATUS_COLOR } from "./usage-bar";
import type { ProfileDict } from "./translations";
import { QRCodeSVG } from "qrcode.react";
import { TopupModal } from "./topup-modal";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/hooks";
import { planDisplayName, planSummary } from "@/lib/plan-display-name";

interface EsimCardListProps {
  esims: MyEsim[];
  isLoading: boolean;
  t: ProfileDict;
  lang: "en" | "vi";
}

/**
 * Build the deep link the OS handler can pick up to auto-install an eSIM
 * profile, given the LPA activation string.
 *
 * Apple/Android both expose a universal URL scheme that takes the raw LPA
 * string (`LPA:1$<smdp>$<matchingId>`) URL-encoded as the `carddata` query
 * parameter.
 */
function buildEsimAutoInstallUrl(
  platform: "apple" | "android",
  lpa: string
): string {
  const host =
    platform === "apple" ? "esimsetup.apple.com" : "esimsetup.android.com";
  return `https://${host}/esim_qrcode_provisioning?carddata=${encodeURIComponent(
    lpa
  )}`;
}

function getStatusStyle(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700";
    case "available":
      return "bg-blue-100 text-blue-700";
    case "expired":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

/**
 * What the customer reads (#025, test round 4): Mới (bought, not installed /
 * no data used yet), Đang sử dụng (running), Hết hạn (over). A local eSIM
 * (Viettel, domestic) is running from the moment it is sold — no Vietnamese
 * carrier reports activation — and a domestic one never expires.
 */
function customerEsimStatus(esim: MyEsim): "new" | "inUse" | "expired" | "refunded" {
  const stored = (esim.status ?? "").toLowerCase();
  if (stored === "refunded") return "refunded";
  const local = esim.provider === "viettel" || esim.provider === "itel" || esim.provider === "wintel" || esim.provider === "vnsky";
  const expires = esim.expiresAt ? new Date(esim.expiresAt).getTime() : null;
  if (expires !== null && !Number.isNaN(expires) && expires < Date.now() && stored !== "available") return "expired";
  if (stored === "expired") return "expired";
  if (local || esim.activatedAt || stored === "active") return "inUse";
  return "new";
}

const CUSTOMER_STATUS: Record<ReturnType<typeof customerEsimStatus>, { vi: string; en: string; style: string }> = {
  new: { vi: "Mới", en: "New", style: "bg-blue-50 text-blue-700" },
  inUse: { vi: "Đang sử dụng", en: "In use", style: "bg-emerald-50 text-emerald-700" },
  expired: { vi: "Hết hạn", en: "Expired", style: "bg-gray-100 text-gray-500" },
  refunded: { vi: "Đã hoàn tiền", en: "Refunded", style: "bg-red-50 text-red-600" },
};

function getStatusLabel(status: string, t: ProfileDict) {
  const map: Record<string, string> = {
    active: t.active,
    available: t.active,
    expired: t.expired,
    pending: t.pending,
  };
  return map[status] || status;
}

function formatDate(dateStr: string | null, lang: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function CopyButton({ text, t }: { text: string; t: ProfileDict }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors shrink-0"
      title={copied ? t.copied : t.copy}
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function QrCodeImage({ lpa }: { lpa: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-3">
      <QRCodeSVG
        value={lpa}
        size={180}
        level="H"
        imageSettings={esimQrLogoSettings(180)}
      />
      <p className="text-sm text-gray-400 text-center max-w-[200px] break-all leading-tight">
        {lpa}
      </p>
    </div>
  );
}

export function DataUsageSection({ esimId, lang }: { esimId: number; lang: string }) {
  const { data, isLoading, isError } = useEsimDataUsage(esimId);
  // The API can report `remaining: null` (size unknown) and `usageAvailable:
  // false` (provider has no usage API) — both were read as numbers before (#027).
  const usage = data as
    | (Omit<EsimDataUsage, "remaining"> & { remaining: number | null; usageAvailable?: boolean })
    | undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-400">
          {lang === "vi" ? "Đang tải..." : "Loading..."}
        </span>
      </div>
    );
  }

  if (isError || !usage) {
    return (
      <div className="text-center py-3">
        <p className="text-sm text-gray-400">
          {lang === "vi" ? "Không thể tải dữ liệu sử dụng" : "Unable to load data usage"}
        </p>
      </div>
    );
  }

  // Viettel and other local inventory expose no usage API: say so plainly
  // rather than draw a full bar that was never measured (#027).
  if (usage.usageAvailable === false) {
    return (
      <div className="border-t border-gray-100 pt-4 mt-4 space-y-2" data-testid="usage-unavailable">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {lang === "vi" ? "Dữ liệu sử dụng" : "Data Usage"}
        </h4>
        <p className="text-sm text-gray-500">
          {lang === "vi"
            ? "Nhà mạng chưa cung cấp số liệu sử dụng trực tuyến cho eSIM này. Bạn có thể xem dung lượng còn lại trong phần cài đặt di động của điện thoại."
            : "The carrier does not report live usage for this eSIM. You can check the remaining data in your phone's mobile settings."}
        </p>
      </div>
    );
  }

  // Convert MB to GB for display
  const totalGb = usage.total / 1024;
  const usedGb = usage.dataUsed / 1024;
  const remainingMb =
    usage.remaining ?? (usage.total > 0 ? Math.max(0, usage.total - usage.dataUsed) : null);
  const remainingGb = remainingMb === null ? null : remainingMb / 1024;

  // Time left runs from the moment the eSIM first connected — the plan clock
  // does not start at purchase (#062).
  const activatedAt = usage.activatedAt ? new Date(usage.activatedAt) : null;
  const expiresAt = usage.expiredAt ? new Date(usage.expiredAt) : null;
  const isActivated = !!activatedAt || usage.status?.toUpperCase() === "ACTIVE";

  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // Days already used, for a bar that reads like the data one.
  const totalDays =
    usage.durationDays ??
    (activatedAt && expiresAt
      ? Math.max(
          1,
          Math.round((expiresAt.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24))
        )
      : null);
  const daysUsed =
    totalDays !== null && daysRemaining !== null
      ? Math.min(totalDays, Math.max(0, totalDays - daysRemaining))
      : null;

  const statusColor = USAGE_STATUS_COLOR;

  return (
    <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {lang === "vi" ? "Dữ liệu sử dụng" : "Data Usage"}
        </h4>
        <span
          data-testid="usage-status"
          className={`inline-flex items-center px-2 py-0.5 text-sm font-medium rounded-full ${statusColor[usage.status?.toUpperCase()] || "bg-gray-100 text-gray-500"}`}
        >
          {statusLabel(usage.status, lang)}
        </span>
      </div>

      {/* Data bar. Some providers report only what has been used and never the
          package size; a bar drawn against 0 would read "0 GB left" on a plan
          that is barely touched, so show the usage as a figure instead (#065). */}
      {usage.isUnlimited || totalGb > 0 ? (
        <DataUsageBar
          label={lang === "vi" ? "Dữ liệu" : "Data"}
          used={usedGb}
          total={totalGb}
          unit="GB"
          isUnlimited={usage.isUnlimited}
          lang={lang}
        />
      ) : (
        <div data-testid="data-used-only" className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            {lang === "vi" ? "Dữ liệu" : "Data"}
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {lang === "vi" ? "Đã dùng" : "Used"} {usedGb.toFixed(usedGb < 100 ? 1 : 0)} GB
          </span>
        </div>
      )}

      {/* Time bar — same shape as the data bar, per #062 */}
      {isActivated && totalDays !== null && daysUsed !== null ? (
        <div data-testid="time-bar">
          <DataUsageBar
            label={lang === "vi" ? "Thời gian sử dụng" : "Usage period"}
            used={daysUsed}
            total={totalDays}
            unit={lang === "vi" ? "ngày" : "days"}
            isUnlimited={false}
            lang={lang}
            integer
          />
        </div>
      ) : isActivated ? (
        // In use, but no expiry reported yet — "not activated" would contradict
        // the "Đang dùng" badge right above it (#027).
        <p data-testid="time-unknown" className="text-sm text-gray-500">
          {lang === "vi"
            ? "eSIM đang được sử dụng — nhà cung cấp chưa gửi ngày hết hạn, thời gian còn lại sẽ hiện khi có số liệu."
            : "This eSIM is in use — the provider has not sent an expiry yet; the time left will appear once it does."}
        </p>
      ) : (
        <p data-testid="not-activated" className="text-sm text-gray-500">
          {lang === "vi"
            ? "Chưa kích hoạt — thời gian sử dụng bắt đầu tính từ khi eSIM kết nối mạng lần đầu."
            : "Not activated yet — the usage period starts when the eSIM first connects to a network."}
        </p>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Wifi className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-lg font-medium text-blue-700">
            {usage.isUnlimited ? "∞" : remainingGb === null ? "—" : remainingGb.toFixed(1)}
          </p>
          <p className="text-sm text-blue-500" data-testid="remaining-card">
            {usage.isUnlimited
              ? lang === "vi" ? "Không giới hạn" : "Unlimited"
              : `GB ${lang === "vi" ? "còn lại" : "remaining"}`}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-lg font-medium text-emerald-700">
            {daysRemaining !== null ? daysRemaining : "—"}
          </p>
          <p className="text-sm text-emerald-500">
            {lang === "vi" ? "ngày còn lại" : "days left"}
          </p>
        </div>
      </div>

      {/* Minutes / SMS left, where the provider reports them (#025). */}
      {!!usage.voiceTotal && usage.voiceRemaining != null && (
        <DataUsageBar
          label={lang === "vi" ? "Phút gọi" : "Call minutes"}
          used={Math.max(0, usage.voiceTotal - usage.voiceRemaining)}
          total={usage.voiceTotal}
          unit={lang === "vi" ? "phút" : "min"}
          isUnlimited={false}
          lang={lang}
          integer
        />
      )}
      {!!usage.smsTotal && usage.smsRemaining != null && (
        <DataUsageBar
          label="SMS"
          used={Math.max(0, usage.smsTotal - usage.smsRemaining)}
          total={usage.smsTotal}
          unit="SMS"
          isUnlimited={false}
          lang={lang}
          integer
        />
      )}

      {/* Expiry info */}
      {usage.expiredAt && (
        <p className="text-sm text-gray-400 text-center">
          {lang === "vi" ? "Hết hạn:" : "Expires:"}{" "}
          {new Date(usage.expiredAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
            year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </p>
      )}

      <p className="border-t border-gray-100 pt-3 text-center text-xs text-gray-400" data-testid="usage-delay-note">
        {lang === "vi"
          ? "Dữ liệu sử dụng (usage data) được cập nhật từ nhà cung cấp dịch vụ roaming có độ trễ 1 - 2 giờ."
          : "Usage data comes from the roaming provider and can be 1 - 2 hours behind."}
      </p>
    </div>
  );
}

type EsimTab = "info" | "dataUsage";

/**
 * Providers the backend can actually recharge (#029). MicroEsim's API has no
 * recharge endpoint and Viettel / local inventory has no provider API at all, so
 * offering them a button would only lead to an empty or refused topup.
 */
const TOPUP_PROVIDERS = new Set(["airalo", "esimaccess", "gadgetkorea", "billion"]);

/** Order states in which the eSIM is gone for good — nothing left to top up. */
const TOPUP_BLOCKED_STATUSES = new Set(["refunded", "expired", "cancelled", "failed"]);

/**
 * Whether to offer the Top Up button on this eSIM (#029).
 *
 * The button was commented out while `plan.topUp` was unpopulated. It now is
 * for Airalo, eSIM Access and Gadget Korea, and there it decides — a plan the
 * provider marks non-rechargeable gets no button. Billion's catalogue import
 * never sets the flag, yet every Billion eSIM recharges through F007, so the
 * flag is not consulted for Billion.
 */
export function canTopUpEsim(esim: Pick<MyEsim, "provider" | "status" | "plan">): boolean {
  const provider = (esim.provider ?? "").toLowerCase();
  if (!TOPUP_PROVIDERS.has(provider)) return false;
  if (TOPUP_BLOCKED_STATUSES.has((esim.status ?? "").toLowerCase())) return false;
  if (provider === "billion") return true;
  return esim.plan?.topUp === true;
}

function EsimCard({ esim, t, lang }: { esim: MyEsim; t: ProfileDict; lang: "en" | "vi" }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<EsimTab>("info");
  const [topupOpen, setTopupOpen] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();
  const [buyingAgain, setBuyingAgain] = useState(false);
  const lifecycle = CUSTOMER_STATUS[customerEsimStatus(esim)];
  const displayName = planDisplayName(esim.plan) || esim.plan?.name || "";

  // "Mua lại eSIM" (#025): the same plan straight into the cart, then the cart.
  const buyAgain = async (event?: { stopPropagation: () => void }) => {
    event?.stopPropagation();
    const planId = Number(esim.plan?.id);
    if (!planId || buyingAgain) return;
    setBuyingAgain(true);
    try {
      await addItem({
        id: String(planId),
        planId,
        name: esim.plan?.name ?? "",
        description: "",
        price: 0,
        dataMb: esim.plan?.dataMb,
        durationDays: esim.plan?.durationDays,
      });
      router.push(lang === "vi" ? "/gio-hang" : "/en/cart");
    } finally {
      setBuyingAgain(false);
    }
  };

  // --- Derived plan info ---
  const planTypeLabel = (() => {
    const pt = esim.plan?.type;
    if (!pt) return "—";
    const key = pt.trim().toLowerCase();
    const map: Record<string, Record<string, string>> = {
      "fixed": { en: "Fixed plan", vi: "Gói cố định" },
      "daily": { en: "Daily plan", vi: "Gói theo ngày" },
      "unlimited-reduce": {
        en: "Unlimited (normal speed)",
        vi: "Không giới hạn tốc độ thường",
      },
      "unlimite": {
        en: "Unlimited (high speed)",
        vi: "Không giới hạn tốc độ cao",
      },
    };
    return map[key]?.[lang] || pt;
  })();

  // operatorName is comma-separated, e.g. "True,AIS"
  const operatorNames = (esim.plan?.operatorName || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // speed is slash-separated, e.g. "5G/4G"
  const speedTiers = (esim.plan?.speed || "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

  // Allowance comes from the plan — an eSIM has no minutes of its own (#023).
  const callMinutes = Number(esim.plan?.call) || 0;
  const smsCount = Number(esim.plan?.sms) || 0;

  // Topups applied to this eSIM, counted server-side from the paid topup orders
  // (#031) — so an admin-granted topup shows up exactly like a customer's own.
  const topupCount = Number(esim.topupCount) || 0;
  const topupPackages = esim.topupPackageNames?.trim() || "";

  // Activation validity: viettel uses 15 days, others use 180 days from createdAt
  const activationDeadline = (() => {
    if (!esim.updatedAt) return null;
    const deadline = new Date(esim.updatedAt);
    deadline.setDate(deadline.getDate() + (esim.provider === 'viettel' ? 15 : 180));
    return deadline;
  })();

  const activationDaysLeft = activationDeadline
    ? Math.max(0, Math.ceil((activationDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const fields: { label: string; value: string; copyable?: boolean }[] = [
    // The purchase order first, for support and warranty (#025, round 4).
    ...(esim.orderNumber
      ? [{ label: lang === "vi" ? "Mã đơn hàng" : "Order number", value: esim.orderNumber, copyable: true }]
      : []),
    { label: "ICCID", value: esim.iccid, copyable: true },
    // LPA equivalent of ICCID — shown so users can copy the full activation
    // string when configuring an eSIM manually.
    { label: "LPA", value: esim.lpa, copyable: true },
    { label: "SM-DP+", value: esim.smdpAddress, copyable: true },
    { label: t.activationCode, value: esim.activationCode, copyable: true },
    { label: "APN", value: esim.apnValue, copyable: true },
    {
      label: lang === "vi" ? "Số điện thoại" : "Phone Number",
      value: esim.phoneNumber || "",
      copyable: !!esim.phoneNumber,
    },
  ];

  const canTopup = canTopUpEsim(esim);

  return (
    <div
      data-testid="esim-card"
      data-esim-id={esim.id}
      className="rounded-xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-sm"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 shrink-0">
          <Smartphone className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-base sm:text-sm font-semibold text-gray-900 truncate font-mono" title={displayName}>
              {displayName}
            </p>
            {/* TOPUP next to the product name, so a topped-up eSIM is obvious
                without expanding the card (#031). */}
            <span
              data-testid="esim-status"
              className={`inline-flex shrink-0 items-center px-2 py-0.5 text-sm font-medium rounded-full ${lifecycle.style}`}
            >
              {lifecycle[lang]}
            </span>
            {/* Beside the status (#030, round 4), so a topped-up eSIM shows at a glance. */}
            {topupCount > 0 && (
              <span
                data-testid="esim-topup-badge"
                className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2 py-0.5 text-sm font-semibold text-amber-800"
              >
                {lang === "vi" ? "Đã nạp thêm" : "Topped up"}
                {topupCount > 1 ? ` ×${topupCount}` : ""}
              </span>
            )}
            {esim.plan?.id && (
              <span
                role="button"
                tabIndex={0}
                data-testid="esim-buy-again-inline"
                onClick={(e) => void buyAgain(e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void buyAgain(e);
                }}
                className="ml-auto hidden shrink-0 items-center gap-1 rounded-full border border-gray-200 px-2.5 py-0.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:inline-flex"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {lang === "vi" ? "Mua lại eSIM" : "Buy again"}
              </span>
            )}
          </div>
          {/* Quick summary under the name (#025): data · days · minutes · SMS. */}
          <p className="text-sm text-gray-700" data-testid="esim-plan-summary">
            {planSummary(esim.plan, lang)}
          </p>
          <p className="text-sm text-gray-500">
            {lang === "vi" ? "Tạo ngày" : "Created"}: {formatDate(esim.createdAt, lang)}
            {esim.expiresAt && esim.provider !== 'viettel' && (
              <> · {lang === "vi" ? "Hết hạn" : "Expires"}: {formatDate(esim.expiresAt, lang)}</>
            )}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-base sm:text-sm font-medium transition-colors ${activeTab === "info"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Info className="w-3.5 h-3.5" />
              {t.tabInfo}
            </button>
            <button
              onClick={() => setActiveTab("dataUsage")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-base sm:text-sm font-medium transition-colors ${activeTab === "dataUsage"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              {lang === "vi" ? "Dữ liệu" : "Data Usage"}
            </button>
          </div>

          <div className="px-4 pb-4 pt-4">
            {activeTab === "info" ? (
              <>
                {/* QR Code + Auto-install Deep Links — Feature 2.3 */}
                {esim.lpa && (
                  <div className="py-4 border-b border-gray-100 mb-4 space-y-4">
                    <div className="flex justify-center">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                          <QrCode className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-500">
                            {lang === "vi" ? "Quét mã QR để cài đặt" : "Scan QR to install"}
                          </span>
                        </div>
                        <QrCodeImage lpa={esim.lpa} />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2 text-center">
                        {lang === "vi" ? "Hoặc cài đặt nhanh" : "Or install with one tap"}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={buildEsimAutoInstallUrl("apple", esim.lpa)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                        >
                          <Apple className="w-4 h-4" />
                          {lang === "vi" ? "Cài cho iPhone" : "Install on iOS"}
                        </a>
                        <a
                          href={buildEsimAutoInstallUrl("android", esim.lpa)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                        >
                          <Smartphone className="w-4 h-4" />
                          {lang === "vi" ? "Cài cho Android" : "Install on Android"}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fields */}
                <div className="space-y-3">
                  {fields.map(({ label, value, copyable }) => (
                    <div key={label}>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                        {label}
                      </p>
                      <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-base sm:text-sm text-gray-900 font-mono break-all flex-1">
                          {value || "—"}
                        </p>
                        {copyable && value && <CopyButton text={value} t={t} />}
                      </div>
                    </div>
                  ))}

                  {/* Plan Info Section */}
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {lang === "vi" ? "Thông tin gói cước" : "Plan Info"}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                          {lang === "vi" ? "Loại gói" : "Plan Type"}
                        </p>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-base sm:text-sm text-gray-900">{planTypeLabel}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                          {lang === "vi" ? "Nhà mạng" : "Carrier"}
                        </p>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          {operatorNames.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {operatorNames.map((op) => (
                                <span
                                  key={op}
                                  className="inline-flex items-center px-2 py-0.5 text-sm font-medium rounded-full bg-indigo-50 text-indigo-700"
                                >
                                  {op}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-base sm:text-sm text-gray-900">—</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                          {lang === "vi" ? "Tốc độ mạng" : "Network Speed"}
                        </p>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          {speedTiers.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {speedTiers.map((s) => (
                                <span
                                  key={s}
                                  className="inline-flex items-center px-2 py-0.5 text-sm font-semibold rounded-full bg-emerald-50 text-emerald-700"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-base sm:text-sm text-gray-900">—</p>
                          )}
                        </div>
                      </div>
                      {/* "Thông tin nạp thêm" (#030, round 4): each topup with its
                          package, data, days, minutes and SMS. Spans both columns —
                          there can be several. */}
                      {topupCount > 0 && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                            {lang === "vi" ? "Thông tin nạp thêm" : "Top-up details"}
                          </p>
                          <div
                            className="bg-amber-50 rounded-lg px-3 py-2 space-y-2"
                            data-testid="esim-topup-packages"
                          >
                            {esim.topups?.length ? (
                              esim.topups.map((topup) => {
                                const name = topup.packageName || topup.packageId || "";
                                const minutes = name.match(/(\d+)\s*Mins?/i)?.[1];
                                const sms = name.match(/(\d+)\s*SMS/i)?.[1];
                                return (
                                  <div key={topup.orderNumber} className="text-base sm:text-sm text-gray-900">
                                    <p className="font-medium">{name}</p>
                                    <p className="text-sm text-gray-600">
                                      {[
                                        topup.isUnlimited
                                          ? lang === "vi" ? "Không giới hạn" : "Unlimited"
                                          : topup.dataText,
                                        topup.durationDays
                                          ? lang === "vi"
                                            ? `${topup.durationDays} ngày`
                                            : `${topup.durationDays} days`
                                          : null,
                                        minutes ? (lang === "vi" ? `${minutes} phút gọi` : `${minutes} min`) : null,
                                        sms ? `${sms} SMS` : null,
                                        formatDate(topup.createdAt, lang),
                                      ]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    </p>
                                  </div>
                                );
                              })
                            ) : (
                              <>
                                <p className="text-base sm:text-sm text-gray-900">
                                  {topupPackages ||
                                    (lang === "vi"
                                      ? `${topupCount} lần topup`
                                      : `${topupCount} top-up(s)`)}
                                </p>
                                {esim.lastTopupAt && (
                                  <p className="text-sm text-gray-500 mt-0.5">
                                    {lang === "vi" ? "Lần cuối" : "Last"}:{" "}
                                    {formatDate(esim.lastTopupAt, lang)}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Minutes / SMS. A call-and-SMS eSIM never said so
                          anywhere the customer could see it (#023). Only shown
                          when the plan actually includes an allowance. */}
                      {(callMinutes > 0 || smsCount > 0) && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                            {lang === "vi" ? "Phút gọi & SMS" : "Calls & SMS"}
                          </p>
                          <div className="bg-gray-50 rounded-lg px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              {callMinutes > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 text-sm font-medium rounded-full bg-sky-50 text-sky-700">
                                  {callMinutes} {lang === "vi" ? "phút gọi" : "call min"}
                                </span>
                              )}
                              {smsCount > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 text-sm font-medium rounded-full bg-violet-50 text-violet-700">
                                  {smsCount} SMS
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                          {lang === "vi" ? "Thời hạn kích hoạt" : "Activation Validity"}
                        </p>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          {activationDeadline ? (
                            <p className={`text-base sm:text-sm ${activationDaysLeft !== null && activationDaysLeft <= 30 ? "text-amber-600 font-medium" : "text-gray-900"}`}>
                              {activationDaysLeft !== null && activationDaysLeft > 0
                                ? `${activationDaysLeft} ${lang === "vi" ? "ngày còn lại" : "days left"}`
                                : lang === "vi" ? "Đã hết hạn" : "Expired"}
                              <span className="block text-sm text-gray-400 mt-0.5">
                                {formatDate(activationDeadline.toISOString(), lang)}
                              </span>
                            </p>
                          ) : (
                            <p className="text-base sm:text-sm text-gray-900">—</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status & Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                        {t.status}
                      </p>
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <span className={`inline-flex items-center px-2 py-0.5 text-sm font-medium rounded-full ${lifecycle.style}`}>
                          {lifecycle[lang]}
                        </span>
                      </div>
                    </div>
                    {esim.provider !== 'viettel' && (
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                        {lang === "vi" ? "Hết hạn" : "Expires"}
                      </p>
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-base sm:text-sm text-gray-900">
                          {formatDate(esim.expiresAt, lang)}
                        </p>
                      </div>
                    </div>
                    )}
                  </div>

                  {/* The supplier's own "Install on iPhone" link used to sit here
                      too; it repeated the install steps above (#025). */}
                  {/* Buy the same plan again, straight into the cart (#025). */}
                  {esim.plan?.id && (
                    <button
                      type="button"
                      data-testid="esim-buy-again-button"
                      onClick={() => void buyAgain()}
                      disabled={buyingAgain}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-300 bg-white text-gray-900 rounded-lg text-base sm:text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {lang === "vi" ? "Mua lại eSIM" : "Buy this eSIM again"}
                    </button>
                  )}

                  {/* Top Up Button — only when this eSIM can really be recharged (#029) */}
                  {canTopup && (
                    <button
                      type="button"
                      data-testid="esim-topup-button"
                      onClick={() => setTopupOpen(true)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-base sm:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Zap className="w-4 h-4" />
                      {t.topup}
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Data Usage Tab */
              <DataUsageSection esimId={esim.id} lang={lang} />
            )}
          </div>
        </div>
      )}

      {/* Topup Modal — mounted at card root so it overlays page */}
      {canTopup && (
        <TopupModal
          esim={esim}
          open={topupOpen}
          onClose={() => setTopupOpen(false)}
          t={t}
          lang={lang}
        />
      )}
    </div>
  );
}

export function EsimCardList({ esims, isLoading, t, lang }: EsimCardListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      {esims.length === 0 ? (
        <div className="text-center py-12">
          <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-base sm:text-sm">{t.noEsims}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {esims.map((esim) => (
            <EsimCard key={esim.id} esim={esim} t={t} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
