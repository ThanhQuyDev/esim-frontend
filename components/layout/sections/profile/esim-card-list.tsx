"use client";

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
  Infinity,
  Info,
  Zap,
  Apple,
} from "lucide-react";
import type { MyEsim } from "@/lib/hooks";
import { useEsimDataUsage } from "@/lib/hooks";
import type { ProfileDict } from "./translations";
import QRCode from "qrcode";
import { TopupModal } from "./topup-modal";

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
      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors shrink-0"
      title={copied ? t.copied : t.copy}
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function QrCodeImage({ lpa }: { lpa: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!lpa) return;
    QRCode.toDataURL(lpa, { width: 200, margin: 2 })
      .then(setSrc)
      .catch(() => setSrc(null));
  }, [lpa]);

  if (!src) return null;

  return (
    <div className="flex flex-col items-center gap-2 py-3">
      <img src={src} alt="eSIM QR Code" className="w-[180px] h-[180px] rounded-sm border border-gray-200" />
      <p className="text-[13px] text-gray-400 text-center max-w-[200px] break-all leading-tight">
        {lpa}
      </p>
    </div>
  );
}

function DataUsageBar({ label, used, total, unit, isUnlimited }: {
  label: string;
  used: number;
  total: number;
  unit: string;
  isUnlimited: boolean;
}) {
  if (isUnlimited) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">{label}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
            <Infinity className="w-3.5 h-3.5" />
            Unlimited
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-indigo-100">
          <div className="h-full rounded-full bg-indigo-400 w-full" />
        </div>
      </div>
    );
  }

  const remaining = Math.max(0, total - used);
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const barColor = pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-emerald-500";
  const barBg = pct > 80 ? "bg-red-100" : pct > 50 ? "bg-amber-100" : "bg-emerald-100";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-semibold text-gray-900">
          {remaining.toFixed(remaining < 100 ? 1 : 0)} {unit} left
        </span>
      </div>
      <div className={`w-full h-2 rounded-full ${barBg}`}>
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[13px] text-gray-400">
        <span>{used.toFixed(used < 100 ? 1 : 0)} {unit} used</span>
        <span>{total.toFixed(total < 100 ? 1 : 0)} {unit} total</span>
      </div>
    </div>
  );
}

function DataUsageSection({ esimId, lang }: { esimId: number; lang: string }) {
  const { data: usage, isLoading, isError } = useEsimDataUsage(esimId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="ml-2 text-xs text-gray-400">
          {lang === "vi" ? "Đang tải..." : "Loading..."}
        </span>
      </div>
    );
  }

  if (isError || !usage) {
    return (
      <div className="text-center py-3">
        <p className="text-xs text-gray-400">
          {lang === "vi" ? "Không thể tải dữ liệu sử dụng" : "Unable to load data usage"}
        </p>
      </div>
    );
  }

  // Convert MB to GB for display
  const totalGb = usage.total / 1024;
  const usedGb = usage.dataUsed / 1024;
  const remainingGb = usage.remaining / 1024;

  // Calculate days remaining from expiredAt
  const daysRemaining = usage.expiredAt
    ? Math.max(0, Math.ceil((new Date(usage.expiredAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const statusColor: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    EXPIRED: "bg-red-100 text-red-700",
    NOT_ACTIVE: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {lang === "vi" ? "Dữ liệu sử dụng" : "Data Usage"}
        </h4>
        <span className={`inline-flex items-center px-2 py-0.5 text-[13px] font-medium rounded-full ${statusColor[usage.status] || "bg-gray-100 text-gray-500"}`}>
          {usage.status}
        </span>
      </div>

      {/* Data bar */}
      <DataUsageBar
        label={lang === "vi" ? "Dữ liệu" : "Data"}
        used={usedGb}
        total={totalGb}
        unit="GB"
        isUnlimited={usage.isUnlimited}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Wifi className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-lg font-bold text-blue-700">
            {usage.isUnlimited ? "∞" : `${remainingGb.toFixed(1)}`}
          </p>
          <p className="text-[13px] text-blue-500">
            {usage.isUnlimited ? "Unlimited" : `GB ${lang === "vi" ? "còn lại" : "remaining"}`}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-emerald-700">
            {daysRemaining !== null ? daysRemaining : "—"}
          </p>
          <p className="text-[13px] text-emerald-500">
            {lang === "vi" ? "ngày còn lại" : "days left"}
          </p>
        </div>
      </div>

      {/* Expiry info */}
      {usage.expiredAt && (
        <p className="text-[13px] text-gray-400 text-center">
          {lang === "vi" ? "Hết hạn:" : "Expires:"}{" "}
          {new Date(usage.expiredAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
            year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}

type EsimTab = "info" | "dataUsage";

function EsimCard({ esim, t, lang }: { esim: MyEsim; t: ProfileDict; lang: "en" | "vi" }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<EsimTab>("info");
  const [topupOpen, setTopupOpen] = useState(false);

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

  // Activation validity: 180 days from createdAt
  const activationDeadline = (() => {
    if (!esim.createdAt) return null;
    const deadline = new Date(esim.createdAt);
    deadline.setDate(deadline.getDate() + 180);
    return deadline;
  })();

  const activationDaysLeft = activationDeadline
    ? Math.max(0, Math.ceil((activationDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const fields: { label: string; value: string; copyable?: boolean }[] = [
    { label: "ICCID", value: esim.iccid, copyable: true },
    // LPA equivalent of ICCID — shown so users can copy the full activation
    // string when configuring an eSIM manually.
    { label: "LPA", value: esim.lpa, copyable: true },
    { label: "SM-DP+", value: esim.smdpAddress, copyable: true },
    { label: t.activationCode, value: esim.activationCode, copyable: true },
    { label: "APN", value: esim.apnValue, copyable: true },
  ];

  // TODO: restore gate `esim.plan?.topUp === true` when backend populates plan.topUp
  const canTopup = esim.plan?.topUp === true;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-sm">
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
            <p className="text-sm font-semibold text-gray-900 truncate font-mono">
              {esim.iccid}
            </p>
            <span className={`inline-flex items-center px-2 py-0.5 text-[13px] font-medium rounded-full ${getStatusStyle(esim.status)}`}>
              {getStatusLabel(esim.status, t)}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {lang === "vi" ? "Tạo ngày" : "Created"}: {formatDate(esim.createdAt, lang)}
            {esim.expiresAt && (
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
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === "info"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Info className="w-3.5 h-3.5" />
              {t.tabInfo}
            </button>
            <button
              onClick={() => setActiveTab("dataUsage")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === "dataUsage"
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
                          <span className="text-xs font-medium text-gray-500">
                            {lang === "vi" ? "Quét mã QR để cài đặt" : "Scan QR to install"}
                          </span>
                        </div>
                        <QrCodeImage lpa={esim.lpa} />
                      </div>
                    </div>

                    <div>
                      <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-2 text-center">
                        {lang === "vi" ? "Hoặc cài đặt nhanh" : "Or install with one tap"}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={buildEsimAutoInstallUrl("apple", esim.lpa)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
                        >
                          <Apple className="w-4 h-4" />
                          {lang === "vi" ? "Cài cho iPhone" : "Install on iOS"}
                        </a>
                        <a
                          href={buildEsimAutoInstallUrl("android", esim.lpa)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
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
                      <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                        {label}
                      </p>
                      <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-sm text-gray-900 font-mono break-all flex-1">
                          {value || "—"}
                        </p>
                        {copyable && value && <CopyButton text={value} t={t} />}
                      </div>
                    </div>
                  ))}

                  {/* Plan Info Section */}
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {lang === "vi" ? "Thông tin gói cước" : "Plan Info"}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                          {lang === "vi" ? "Loại gói" : "Plan Type"}
                        </p>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-sm text-gray-900">{planTypeLabel}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                          {lang === "vi" ? "Nhà mạng" : "Carrier"}
                        </p>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          {operatorNames.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {operatorNames.map((op) => (
                                <span
                                  key={op}
                                  className="inline-flex items-center px-2 py-0.5 text-[13px] font-medium rounded-full bg-indigo-50 text-indigo-700"
                                >
                                  {op}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-900">—</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                          {lang === "vi" ? "Tốc độ mạng" : "Network Speed"}
                        </p>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          {speedTiers.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {speedTiers.map((s) => (
                                <span
                                  key={s}
                                  className="inline-flex items-center px-2 py-0.5 text-[13px] font-semibold rounded-full bg-emerald-50 text-emerald-700"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-900">—</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                          {lang === "vi" ? "Thời hạn kích hoạt" : "Activation Validity"}
                        </p>
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          {activationDeadline ? (
                            <p className={`text-sm ${activationDaysLeft !== null && activationDaysLeft <= 30 ? "text-amber-600 font-medium" : "text-gray-900"}`}>
                              {activationDaysLeft !== null && activationDaysLeft > 0
                                ? `${activationDaysLeft} ${lang === "vi" ? "ngày còn lại" : "days left"}`
                                : lang === "vi" ? "Đã hết hạn" : "Expired"}
                              <span className="block text-[13px] text-gray-400 mt-0.5">
                                {formatDate(activationDeadline.toISOString(), lang)}
                              </span>
                            </p>
                          ) : (
                            <p className="text-sm text-gray-900">—</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status & Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                        {t.status}
                      </p>
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyle(esim.status)}`}>
                          {getStatusLabel(esim.status, t)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                        {lang === "vi" ? "Hết hạn" : "Expires"}
                      </p>
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-sm text-gray-900">
                          {formatDate(esim.expiresAt, lang)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Apple Install Link */}
                  {esim.directAppleInstallationUrl && (
                    <a
                      href={esim.directAppleInstallationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {lang === "vi" ? "Cài đặt trên iPhone" : "Install on iPhone"}
                    </a>
                  )}

                  {/* Top Up Button — only when the plan supports it */}
                  {canTopup && (
                    <button
                      type="button"
                      onClick={() => setTopupOpen(true)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
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
          <p className="text-gray-500 text-sm">{t.noEsims}</p>
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
