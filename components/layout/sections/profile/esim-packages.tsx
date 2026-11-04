"use client";

import { formatVnd, type EsimPackage } from "@/lib/hooks";

/**
 * The first package and what was bought on top of it (vande-0411 #020): each
 * with what it offers, whether it is running, its dates and its price. Used on
 * the customer's eSIM card and on the public lookup page.
 */
const TEXT = {
  vi: {
    initial: "Gói dịch vụ ban đầu",
    later: "Gói dịch vụ mua thêm",
    count: "Số lần topup/add-on",
    topup: "Topup",
    addon: "Add-on",
    unlimited: "Không giới hạn",
    days: "ngày",
    perDay: "/ngày",
    created: "Ngày tạo",
    activated: "Ngày kích hoạt",
    expires: "Ngày hết hạn",
    price: "Giá bán",
    status: {
      active: "Đang hoạt động",
      waiting: "Chưa kích hoạt",
      expired: "Đã hết hạn",
      processing: "Đang xử lý",
    },
  },
  en: {
    initial: "Original package",
    later: "Added packages",
    count: "Number of top-ups/add-ons",
    topup: "Top-up",
    addon: "Add-on",
    unlimited: "Unlimited",
    days: "days",
    perDay: "/day",
    created: "Created on",
    activated: "Activated on",
    expires: "Expires on",
    price: "Price",
    status: {
      active: "Active",
      waiting: "Not active",
      expired: "Expired",
      processing: "Processing",
    },
  },
} as const;

const STATUS_STYLE: Record<EsimPackage["status"], string> = {
  active: "bg-green-100 text-green-700",
  waiting: "bg-gray-100 text-gray-600",
  expired: "bg-red-50 text-red-600",
  processing: "bg-amber-100 text-amber-700",
};

function dateTime(value: string | null, lang: "vi" | "en"): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(lang === "vi" ? "vi-VN" : "en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PackageRow({ pkg, lang }: { pkg: EsimPackage; lang: "vi" | "en" }) {
  const t = TEXT[lang];
  const offer = [
    pkg.isUnlimited
      ? t.unlimited
      : pkg.dataText && `${pkg.dataText}${pkg.perDay ? t.perDay : ""}`,
    pkg.durationDays ? `${pkg.durationDays} ${t.days}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const rows: [string, string][] = [
    [t.created, dateTime(pkg.createdAt, lang)],
    [t.activated, dateTime(pkg.activatedAt, lang)],
    [t.expires, dateTime(pkg.expiresAt, lang)],
  ];
  if (pkg.vndPrice !== null) rows.push([t.price, formatVnd(pkg.vndPrice)]);
  return (
    <div className="rounded-[10px] border border-gray-200 bg-white p-3" data-testid={`esim-package-${pkg.kind}`}>
      <div className="flex flex-wrap items-center gap-2">
        {pkg.kind !== "initial" && (
          <span className="text-sm font-semibold text-gray-900">{pkg.kind === "addon" ? t.addon : t.topup}</span>
        )}
        {offer && <span className="text-sm font-medium text-gray-900">{offer}</span>}
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[pkg.status]}`}>
          {t.status[pkg.status]}
        </span>
      </div>
      {pkg.name && <p className="mt-1 break-words text-sm text-gray-500">{pkg.name}</p>}
      <dl className="mt-2 space-y-1 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-gray-500">{label}</dt>
            <dd className="text-right text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function EsimPackages({
  packages,
  topupCount,
  lang,
}: {
  packages: EsimPackage[];
  topupCount: number;
  lang: string;
}) {
  const language = lang === "vi" ? "vi" : "en";
  const t = TEXT[language];
  const initial = packages.filter((pkg) => pkg.kind === "initial");
  const later = packages.filter((pkg) => pkg.kind !== "initial");
  return (
    <div className="space-y-3" data-testid="esim-packages">
      <p className="text-sm text-gray-700" data-testid="esim-topup-count">
        {t.count}: <span className="font-semibold">{topupCount}</span>
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <section className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">{t.initial}</h4>
          {initial.map((pkg) => (
            <PackageRow key="initial" pkg={pkg} lang={language} />
          ))}
        </section>
        <section className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">
            {t.later} ({later.length})
          </h4>
          {later.map((pkg, index) => (
            <PackageRow key={index} pkg={pkg} lang={language} />
          ))}
        </section>
      </div>
    </div>
  );
}
