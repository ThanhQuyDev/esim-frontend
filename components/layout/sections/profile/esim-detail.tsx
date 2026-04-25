"use client";

import { useState } from "react";
import { Info, BarChart3, Copy, Check, Globe, Wifi, Calendar, Smartphone } from "lucide-react";
import { DataPlanProgress } from "./data-plan-progress";
import type { ProfileDict } from "./translations";

export interface ProfileEsim {
  iccid: string;
  matchingId: string;
  smdpAddress: string;
  activationCode: string;
  planName: string;
  destination: string;
  status: "active" | "expired" | "pending";
  dataMb: number;
  dataUsedMb: number;
  durationDays: number;
  daysUsed: number;
}

interface EsimDetailProps {
  esim: ProfileEsim;
  t: ProfileDict;
}

export function EsimDetail({ esim, t }: EsimDetailProps) {
  const [activeTab, setActiveTab] = useState<"info" | "dataPlan">("info");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusColors = {
    active: "bg-emerald-100 text-emerald-700",
    expired: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-700",
  };

  const statusLabels = {
    active: t.active,
    expired: t.expired,
    pending: t.pending,
  };

  const infoFields = [
    { label: t.iccid, value: esim.iccid, key: "iccid" },
    { label: t.activationCode, value: esim.activationCode, key: "activation" },
    { label: t.smdpAddress, value: esim.smdpAddress, key: "smdp" },
    { label: t.matchingId, value: esim.matchingId, key: "matching" },
  ];

  return (
    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/30 overflow-hidden animate-in slide-in-from-top-2 duration-300">
      {/* Tabs */}
      <div className="flex border-b border-blue-200 bg-white">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "info"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Info className="w-4 h-4" />
          {t.tabInfo}
        </button>
        <button
          onClick={() => setActiveTab("dataPlan")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "dataPlan"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          {t.tabDataPlan}
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-5">
        {activeTab === "info" ? (
          <div className="space-y-4">
            {/* Plan summary */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700">
                <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                {esim.planName}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                {esim.destination}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700">
                <Wifi className="w-3.5 h-3.5 text-purple-500" />
                {esim.dataMb >= 1024 ? `${parseFloat((esim.dataMb / 1024).toFixed(1))} GB` : `${esim.dataMb} MB`}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                {esim.durationDays} {t.days}
              </span>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[esim.status]}`}>
                {statusLabels[esim.status]}
              </span>
            </div>

            {/* Copyable fields */}
            <div className="space-y-3">
              {infoFields.map(({ label, value, key }) => (
                <div key={key} className="bg-white rounded-lg border border-gray-200 p-3">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sm text-gray-900 font-mono break-all flex-1">{value}</code>
                    <button
                      onClick={() => handleCopy(value, key)}
                      className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors hover:bg-gray-100"
                    >
                      {copiedField === key ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600">{t.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-500">{t.copy}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Data usage */}
            <DataPlanProgress
              label={t.dataRemaining}
              used={esim.dataUsedMb}
              total={esim.dataMb}
              unit={esim.dataMb >= 1024 ? "GB" : "MB"}
              color="blue"
              t={t}
            />

            {/* Days remaining */}
            <DataPlanProgress
              label={t.daysRemaining}
              used={esim.daysUsed}
              total={esim.durationDays}
              unit={t.days}
              color="emerald"
              t={t}
            />

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {esim.dataMb >= 1024
                    ? `${parseFloat((Math.max(0, esim.dataMb - esim.dataUsedMb) / 1024).toFixed(1))}`
                    : Math.max(0, esim.dataMb - esim.dataUsedMb)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t.gb} {t.remaining}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {Math.max(0, esim.durationDays - esim.daysUsed)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t.days} {t.remaining}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
