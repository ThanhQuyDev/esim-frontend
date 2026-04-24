"use client";

import { useState } from "react";
import { Smartphone, ChevronDown, ChevronUp, Globe, Wifi, Calendar, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { EsimDetail } from "./esim-detail";
import type { ProfileEsim } from "./esim-detail";
import type { ProfileDict } from "./translations";

interface EsimListProps {
  esims: ProfileEsim[];
  t: ProfileDict;
  lang: "en" | "vi";
}

const statusColors = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  expired: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
};

export function EsimList({ esims, t, lang }: EsimListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusLabels = {
    active: t.active,
    expired: t.expired,
    pending: t.pending,
  };

  const toggleExpand = (iccid: string) => {
    setExpandedId((prev) => (prev === iccid ? null : iccid));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100">
            <Smartphone className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t.myEsims}</h2>
            <p className="text-xs text-gray-500">{esims.length} eSIM{esims.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {esims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Smartphone className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 mb-4">{t.noEsims}</p>
            <Link
              href={`/${lang}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              {t.goShopping}
            </Link>
          </div>
        ) : (
          esims.map((esim) => (
            <div key={esim.iccid} className="px-6 py-4">
              {/* eSIM row */}
              <button
                onClick={() => toggleExpand(esim.iccid)}
                className="w-full flex items-center justify-between gap-4 text-left group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{esim.planName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Globe className="w-3 h-3" />
                        {esim.destination}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Wifi className="w-3 h-3" />
                        {esim.dataGb} {t.gb}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {esim.durationDays} {t.days}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[esim.status]}`}>
                    {statusLabels[esim.status]}
                  </span>
                  {expandedId === esim.iccid ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  )}
                </div>
              </button>

              {/* Expanded detail */}
              {expandedId === esim.iccid && <EsimDetail esim={esim} t={t} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
