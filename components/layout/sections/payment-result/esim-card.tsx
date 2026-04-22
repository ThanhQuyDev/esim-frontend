"use client";

import { Smartphone, Globe, Wifi, Calendar, QrCode } from "lucide-react";
import { CopyableField } from "./copyable-field";
import type { EsimInfo } from "@/lib/hooks";
import type { PaymentResultDict } from "./translations";

interface EsimCardProps {
  esim: EsimInfo;
  index: number;
  totalCount: number;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  t: PaymentResultDict;
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
          {esim.planName && <p className="text-sm text-gray-500">{esim.planName}</p>}
        </div>
      </div>

      {/* Plan info badges */}
      {(esim.destination || esim.dataGb || esim.durationDays) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {esim.destination && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
              <Globe className="w-3.5 h-3.5" />
              {esim.destination}
            </span>
          )}
          {esim.dataGb && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
              <Wifi className="w-3.5 h-3.5" />
              {esim.dataGb} GB
            </span>
          )}
          {esim.durationDays && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {esim.durationDays} {t.days}
            </span>
          )}
        </div>
      )}

      {/* QR Code */}
      {esim.qrCodeUrl && (
        <div className="flex flex-col items-center py-5 mb-5 rounded-xl bg-gray-50 border border-gray-100">
          <QrCode className="w-6 h-6 text-gray-400 mb-3" />
          <img src={esim.qrCodeUrl} alt="eSIM QR Code" className="w-48 h-48 rounded-lg" />
          <p className="text-xs text-gray-500 mt-3">{t.scanQr}</p>
        </div>
      )}

      {/* Copyable fields */}
      <div className="space-y-3">
        <CopyableField
          label={t.activationCode}
          value={esim.activationCode}
          fieldKey={`activation-${index}`}
          copiedField={copiedField}
          onCopy={onCopy}
          copyLabel={t.copy}
          copiedLabel={t.copied}
        />
        <CopyableField
          label={t.smdpAddress}
          value={esim.smdpAddress}
          fieldKey={`smdp-${index}`}
          copiedField={copiedField}
          onCopy={onCopy}
          copyLabel={t.copy}
          copiedLabel={t.copied}
        />
        <CopyableField
          label={t.matchingId}
          value={esim.matchingId}
          fieldKey={`matching-${index}`}
          copiedField={copiedField}
          onCopy={onCopy}
          copyLabel={t.copy}
          copiedLabel={t.copied}
        />
        <CopyableField
          label={t.iccid}
          value={esim.iccid}
          fieldKey={`iccid-${index}`}
          copiedField={copiedField}
          onCopy={onCopy}
          copyLabel={t.copy}
          copiedLabel={t.copied}
        />
      </div>
    </div>
  );
}
