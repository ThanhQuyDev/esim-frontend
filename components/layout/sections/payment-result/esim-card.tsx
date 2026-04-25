"use client";

import { useState, useEffect } from "react";
import { Smartphone, Globe, Wifi, Calendar, QrCode } from "lucide-react";
import { CopyableField } from "./copyable-field";
import type { EsimInfo } from "@/lib/hooks";
import type { PaymentResultDict } from "./translations";
import QRCodeLib from "qrcode";

interface EsimCardProps {
  esim: EsimInfo;
  index: number;
  totalCount: number;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  t: PaymentResultDict;
}

function LpaQrCode({ lpa, scanLabel }: { lpa: string; scanLabel: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!lpa) return;
    QRCodeLib.toDataURL(lpa, { width: 200, margin: 2 })
      .then(setSrc)
      .catch(() => setSrc(null));
  }, [lpa]);

  if (!src) return null;

  return (
    <div className="flex flex-col items-center py-5 mb-5 rounded-xl bg-gray-50 border border-gray-100">
      <QrCode className="w-6 h-6 text-gray-400 mb-3" />
      <img src={src} alt="eSIM QR Code" className="w-48 h-48 rounded-lg" />
      <p className="text-xs text-gray-500 mt-3">{scanLabel}</p>
    </div>
  );
}

export function EsimCard({ esim, index, totalCount, copiedField, onCopy, t }: EsimCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-6 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100">
          <Smartphone className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">
            {t.esimDetails} {totalCount > 1 ? `#${index + 1}` : ""}
          </h3>
          {esim.status && (
            <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              esim.status === "available" ? "bg-emerald-100 text-emerald-700" :
              esim.status === "active" ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {esim.status}
            </span>
          )}
        </div>
      </div>

      {/* Data usage badges */}
      {(esim.dataTotal || esim.dataUsed) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {esim.dataTotal && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
              <Wifi className="w-3.5 h-3.5" />
              {esim.dataTotal}
            </span>
          )}
          {esim.dataUsed && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {t.data}: {esim.dataUsed}
            </span>
          )}
        </div>
      )}

      {/* QR Code — generated from LPA string */}
      {esim.lpa && <LpaQrCode lpa={esim.lpa} scanLabel={t.scanQr} />}

      {/* Copyable fields */}
      <div className="space-y-3">
        {esim.lpa && (
          <CopyableField
            label="LPA"
            value={esim.lpa}
            fieldKey={`lpa-${index}`}
            copiedField={copiedField}
            onCopy={onCopy}
            copyLabel={t.copy}
            copiedLabel={t.copied}
          />
        )}
        {esim.activationCode && (
          <CopyableField
            label={t.activationCode}
            value={esim.activationCode}
            fieldKey={`activation-${index}`}
            copiedField={copiedField}
            onCopy={onCopy}
            copyLabel={t.copy}
            copiedLabel={t.copied}
          />
        )}
        {esim.smdpAddress && (
          <CopyableField
            label={t.smdpAddress}
            value={esim.smdpAddress}
            fieldKey={`smdp-${index}`}
            copiedField={copiedField}
            onCopy={onCopy}
            copyLabel={t.copy}
            copiedLabel={t.copied}
          />
        )}
        {esim.matchId && (
          <CopyableField
            label={t.matchingId}
            value={esim.matchId}
            fieldKey={`matching-${index}`}
            copiedField={copiedField}
            onCopy={onCopy}
            copyLabel={t.copy}
            copiedLabel={t.copied}
          />
        )}
        {esim.iccid && (
          <CopyableField
            label={t.iccid}
            value={esim.iccid}
            fieldKey={`iccid-${index}`}
            copiedField={copiedField}
            onCopy={onCopy}
            copyLabel={t.copy}
            copiedLabel={t.copied}
          />
        )}
        {esim.directAppleInstallationUrl && (
          <CopyableField
            label="Apple Install URL"
            value={esim.directAppleInstallationUrl}
            fieldKey={`apple-${index}`}
            copiedField={copiedField}
            onCopy={onCopy}
            copyLabel={t.copy}
            copiedLabel={t.copied}
          />
        )}
      </div>
    </div>
  );
}
