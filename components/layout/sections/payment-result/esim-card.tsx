"use client";

import { esimQrLogoSettings } from "@/lib/esim-qr";
import { Smartphone, Wifi, Calendar, QrCode, Phone, MessageSquare } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { CopyableField } from "./copyable-field";
import type { EsimInfo, OrderItemPlan } from "@/lib/hooks";
import type { PaymentResultDict } from "./translations";

interface EsimCardProps {
  esim: EsimInfo;
  /**
   * What this eSIM is called — the package the customer bought, with `#n`
   * appended only when they bought more than one of it (#044).
   */
  title: string;
  /** Position in the whole order; only used to key the copy buttons. */
  index: number;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  t: PaymentResultDict;
  /** The package it came from: data, days, minutes, SMS (#033, test round 4). */
  plan?: OrderItemPlan | null;
  lang?: "vi" | "en";
}

/** "3072" → "3GB", "500" → "500MB"; text that already has a unit is kept. */
export function formatDataAmount(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const text = String(value).trim();
  if (!/^\d+(\.\d+)?$/.test(text)) return text;
  const mb = Number(text);
  return mb >= 1024 ? `${parseFloat((mb / 1024).toFixed(1))}GB` : `${mb}MB`;
}

/** The badges under the title: data with its unit, days of use, minutes, SMS. */
export function esimBadges(
  esim: Pick<EsimInfo, "dataTotal">,
  plan: OrderItemPlan | null | undefined,
  lang: "vi" | "en",
) {
  const vi = lang === "vi";
  const mb = Number(plan?.dataMb) || 0;
  const perDay = !!plan?.type && plan.type !== "fixed";
  const data = plan
    ? mb > 0
      ? `${formatDataAmount(mb)}${perDay ? (vi ? "/ngày" : "/day") : ""}`
      : vi
        ? "Không giới hạn"
        : "Unlimited"
    : formatDataAmount(esim.dataTotal);
  const days = Number(plan?.durationDays) || 0;
  const call = Number(plan?.call) || 0;
  const sms = Number(plan?.sms) || 0;
  return {
    data,
    days: days > 0 ? (vi ? `${days} ngày sử dụng` : `${days} day${days > 1 ? "s" : ""} of use`) : "",
    call: call > 0 ? (vi ? `${call} phút gọi` : `${call} min calls`) : "",
    sms: sms > 0 ? `${sms} SMS` : "",
  };
}


function LpaQrCode({ lpa, scanLabel }: { lpa: string; scanLabel: string }) {
  return (
    <div className="flex flex-col items-center py-5 mb-5 rounded-xl bg-gray-50 border border-gray-100">
      <QrCode className="w-6 h-6 text-gray-400 mb-3" />
      <QRCodeSVG
        value={lpa}
        size={192}
        level="H"
        imageSettings={esimQrLogoSettings(192)}
      />
      <p className="text-sm text-gray-500 mt-3">{scanLabel}</p>
    </div>
  );
}

export function EsimCard({ esim, title, index, copiedField, onCopy, t, plan, lang = "vi" }: EsimCardProps) {
  const badges = esimBadges(esim, plan, lang);
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-6 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100">
          <Smartphone className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          {/* The package name, not "eSIM #1": a buyer who ordered Japan and
              Korea together could not tell which card was which (#044). */}
          <h3 className="font-medium text-gray-900" data-testid={`esim-title-${index}`}>
            {title}
          </h3>
          {esim.status && (
            <span className={`inline-block mt-1 text-sm font-medium px-2 py-0.5 rounded-full ${esim.status === "available" ? "bg-emerald-100 text-emerald-700" :
                esim.status === "active" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
              }`}>
              {esim.status}
            </span>
          )}
        </div>
      </div>

      {/* Data with its unit, days of use, minutes and SMS (#033, test round 4) —
          the old badges showed a bare "3072" and "data used" under a calendar. */}
      {(badges.data || badges.days || badges.call || badges.sms) && (
        <div className="flex flex-wrap gap-2 mb-5" data-testid={`esim-badges-${index}`}>
          {badges.data && (
            <span data-testid={`esim-data-${index}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-medium">
              <Wifi className="w-3.5 h-3.5" />
              {badges.data}
            </span>
          )}
          {badges.days && (
            <span data-testid={`esim-days-${index}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {badges.days}
            </span>
          )}
          {badges.call && (
            <span data-testid={`esim-call-${index}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 text-sm font-medium">
              <Phone className="w-3.5 h-3.5" />
              {badges.call}
            </span>
          )}
          {badges.sms && (
            <span data-testid={`esim-sms-${index}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
              <MessageSquare className="w-3.5 h-3.5" />
              {badges.sms}
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
        {/* Matching ID and Apple Install URL (Airalo) are not shown (#033). */}
      </div>
    </div>
  );
}
