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
} from "lucide-react";
import type { MyEsim } from "@/lib/hooks";
import type { ProfileDict } from "./translations";
import QRCode from "qrcode";

interface EsimCardListProps {
  esims: MyEsim[];
  isLoading: boolean;
  t: ProfileDict;
  lang: "en" | "vi";
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
      <p className="text-[11px] text-gray-400 text-center max-w-[200px] break-all leading-tight">
        {lpa}
      </p>
    </div>
  );
}

function EsimCard({ esim, t, lang }: { esim: MyEsim; t: ProfileDict; lang: string }) {
  const [expanded, setExpanded] = useState(false);

  const fields: { label: string; value: string; copyable?: boolean }[] = [
    { label: "ICCID", value: esim.iccid, copyable: true },
    { label: "SM-DP+", value: esim.smdpAddress, copyable: true },
    { label: t.activationCode, value: esim.activationCode, copyable: true },
    { label: "APN", value: esim.apnValue, copyable: true },
  ];

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
            <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full ${getStatusStyle(esim.status)}`}>
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
        <div className="border-t border-gray-100 px-4 pb-4">
          {/* QR Code */}
          {esim.lpa && (
            <div className="flex justify-center py-4 border-b border-gray-100 mb-4">
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
          )}

          {/* Fields */}
          <div className="space-y-3">
            {fields.map(({ label, value, copyable }) => (
              <div key={label}>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
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

            {/* Status & Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                  {t.status}
                </p>
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyle(esim.status)}`}>
                    {getStatusLabel(esim.status, t)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
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
          </div>
        </div>
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

  if (esims.length === 0) {
    return (
      <div className="text-center py-12">
        <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">{t.noEsims}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {esims.map((esim) => (
        <EsimCard key={esim.id} esim={esim} t={t} lang={lang} />
      ))}
    </div>
  );
}
