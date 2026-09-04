"use client";

import { useMemo, useState, useEffect } from "react";
import type { Plan, PlansByDestinationResponse } from "@/lib/api";
import { useLocalPlansByCarrier, useLocalCarriers, formatVnd } from "@/lib/hooks";
import { getCarrierMeta } from "./carrier-meta";
import { BuyActions } from "../destination/buy-actions";
import { DeviceChecker } from "../destination/device-checker";
import { EkycModal } from "../destination/ekyc-modal";
import type { DestinationDict } from "../destination/types";
import type { Locale } from "@/lib/i18n-config";

interface LocalEsimDetailProps {
  carrier: string;
  dict: DestinationDict;
  lang: Locale;
  initialPlans?: PlansByDestinationResponse | null;
}

const EMPTY: PlansByDestinationResponse = {
  dataPlans: [],
  slowUnlimited: [],
  fastUnlimited: [],
  dailyUnlimited: [],
  smsCallEsim: [],
  localEsim: [],
};

function isUnlimited(plan: Plan): boolean {
  return plan.type === "unlimited" || plan.type === "unlimited-reduce";
}

function dataLabel(plan: Plan): string {
  if (isUnlimited(plan)) return "Không giới hạn";
  const mb = Number(plan.dataMb);
  if (mb >= 1024) {
    const gb = mb / 1024;
    return `${Number.isInteger(gb) ? gb : parseFloat(gb.toFixed(1))}GB`;
  }
  return `${mb}MB`;
}

/** Map durationDays → a friendly VI cycle label (30→1 tháng, 90→3 tháng…). */
function cycleLabel(days: number, lang: Locale): string {
  const months = Math.round(days / 30);
  if (months >= 1 && days % 30 === 0) {
    return lang === "vi" ? `${months} tháng` : `${months} mo`;
  }
  return lang === "vi" ? `${days} ngày` : `${days} days`;
}

/** First marketing tag as a small badge label, if any. */
function firstTag(plan: Plan): string | null {
  const tags = (plan.tags as string[] | undefined) || [];
  return tags.length > 0 ? tags[0] : null;
}

export function LocalEsimDetail({ carrier, dict, lang, initialPlans }: LocalEsimDetailProps) {
  const meta = getCarrierMeta(carrier);
  const { data: grouped = EMPTY } = useLocalPlansByCarrier(carrier, lang, initialPlans ?? undefined);
  const { data: allCarriers = [] } = useLocalCarriers();

  // All plans for this carrier are isLocalInventory → the backend folds them
  // into `localEsim`. Split by type into the two mockup groups.
  const allPlans = grouped.localEsim ?? [];
  const highSpeed = useMemo(() => allPlans.filter((p) => !isUnlimited(p)), [allPlans]);
  const unlimited = useMemo(() => allPlans.filter(isUnlimited), [allPlans]);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [ekycOpen, setEkycOpen] = useState(false);

  // Auto-select the cheapest available plan on load / carrier change.
  useEffect(() => {
    if (!selectedPlan && allPlans.length > 0) {
      setSelectedPlan(highSpeed[0] ?? unlimited[0] ?? allPlans[0]);
    }
  }, [allPlans, highSpeed, unlimited, selectedPlan]);

  const hasEkyc = !!selectedPlan?.isKyc;
  const otherCarriers = allCarriers.filter((c) => c.provider !== carrier);

  const priceNow = selectedPlan ? Number(selectedPlan.vndPrice) : 0;
  const retailVnd = selectedPlan
    ? (() => {
        const price = Number(selectedPlan.price);
        const retail = Number(selectedPlan.retailPrice);
        const vnd = Number(selectedPlan.vndPrice);
        return price > 0 ? Math.round((vnd * retail) / price / 1000) * 1000 : 0;
      })()
    : 0;
  const showStrike = retailVnd > priceNow;
  const discountPct = showStrike ? Math.round((1 - priceNow / retailVnd) * 100) : 0;

  return (
    <div className="mx-4 sm:mx-auto max-w-[1230px] py-6">
      <div className="grid lg:grid-cols-[465px_minmax(0,1fr)] gap-8">
        {/* ── Left column: product info ── */}
        <div className="min-w-0">
          {/* Hero card */}
          <div className="rounded-[20px] overflow-hidden border border-[#e5e7eb] bg-white mb-4">
            <div
              className="h-[150px] flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${meta.logoBg}, #111)` }}
            >
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                style={{ backgroundColor: meta.logoBg, border: "3px solid #fff" }}
              >
                <span className={meta.italic ? "italic" : undefined}>
                  {meta.label.slice(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="px-[18px] pt-4 pb-4">
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl font-bold text-[#111]">
                  eSIM {meta.label}
                </h1>
                {/* VN flag */}
                <svg width="21" height="14" viewBox="0 0 21 14" className="rounded-[2px] shrink-0">
                  <rect width="21" height="14" fill="#DA251D" />
                  <path
                    fill="#FF0"
                    d="M10.5 3l1.06 3.27h3.44l-2.78 2.02 1.06 3.27-2.78-2.02-2.78 2.02 1.06-3.27L5.99 6.27h3.44z"
                  />
                </svg>
              </div>
              <p className="text-sm text-[#6b7280] leading-relaxed">
                {lang === "vi"
                  ? `eSIM nội địa Việt Nam — ${meta.infra || "Data 4G/5G"}, có số thuê bao gọi & nhắn tin.`
                  : `Vietnam domestic eSIM — ${meta.infra || "4G/5G data"}, with a callable subscriber number.`}
              </p>
            </div>
          </div>

          {/* Feature panel */}
          <div className="rounded-[16px] border border-[#e5e7eb] bg-white p-[18px] mb-4">
            <FeatureRow
              label={lang === "vi" ? "Nhà mạng" : "Carrier"}
              value={`${meta.label} 4G/5G${meta.infra ? ` · ${meta.infra}` : ""}`}
            />
            {meta.phonePrefix && (
              <FeatureRow
                label={lang === "vi" ? "Số điện thoại" : "Phone number"}
                pill={`${lang === "vi" ? "Đầu số" : "Prefix"} ${meta.phonePrefix}`}
              />
            )}
            <FeatureRow
              label={lang === "vi" ? "Gọi & Nhắn tin" : "Calls & SMS"}
              yes
              yesText={lang === "vi" ? "Có" : "Yes"}
            />
            {selectedPlan?.hotSpot && (
              <FeatureRow
                label={lang === "vi" ? "Chia sẻ kết nối" : "Hotspot"}
                pill={
                  selectedPlan.hotSpotAllow
                    ? `${selectedPlan.hotSpotAllow}GB/${lang === "vi" ? "ngày" : "day"}`
                    : lang === "vi"
                      ? "Có"
                      : "Yes"
                }
              />
            )}
            {hasEkyc && (
              <button
                type="button"
                onClick={() => setEkycOpen(true)}
                className="mt-3 w-full text-left flex items-center gap-2 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] px-3 py-2.5 text-[13px] text-[#B91C1C] font-medium hover:bg-[#FEE2E2] transition-colors"
              >
                <span aria-hidden>⚠</span>
                {lang === "vi"
                  ? "Bắt buộc xác thực thuê bao (eKYC) — Xem hướng dẫn"
                  : "Subscriber verification (eKYC) required — See guide"}
              </button>
            )}
          </div>

          {/* Device checker (reused) */}
          <div className="rounded-[16px] border border-[#e5e7eb] bg-white p-[18px]">
            <DeviceChecker dict={dict} lang={lang} />
          </div>
        </div>

        {/* ── Right column: pick plan + buy ── */}
        <div className="min-w-0">
          {/* Price header */}
          <div className="mb-4">
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-3xl font-bold text-[#111]">
                {selectedPlan ? formatVnd(priceNow) : "—"}
              </span>
              {showStrike && (
                <>
                  <span className="text-base text-[#9ca3af] line-through mb-1">
                    {formatVnd(retailVnd)}
                  </span>
                  <span className="mb-1 text-[13px] font-semibold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded">
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>
            {selectedPlan && (
              <p className="text-[13px] text-[#6b7280] mt-1">
                {dataLabel(selectedPlan)} ·{" "}
                {cycleLabel(selectedPlan.durationDays, lang)}
                {selectedPlan.name ? ` · ${selectedPlan.name}` : ""}
              </p>
            )}
          </div>

          {/* Step 1: pick a plan */}
          <div className="text-base font-medium text-[#111] mb-2.5 flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-[#111] text-white rounded-full text-sm font-extrabold shrink-0">
              1
            </span>
            {lang === "vi" ? "Chọn gói cước" : "Pick a plan"}
          </div>
          <p className="text-[13px] text-[#6b7280] mb-3">
            {lang === "vi"
              ? "— tất cả eSIM đều có chức năng sử dụng Data + Gọi + SMS"
              : "— every eSIM includes Data + Calls + SMS"}
          </p>

          {highSpeed.length > 0 && (
            <PlanGroup
              title={lang === "vi" ? "Gói Data tốc độ cao" : "High-speed data"}
              plans={highSpeed}
              selectedPlan={selectedPlan}
              onSelect={setSelectedPlan}
              lang={lang}
            />
          )}
          {unlimited.length > 0 && (
            <PlanGroup
              title={lang === "vi" ? "Gói Data không giới hạn" : "Unlimited data"}
              plans={unlimited}
              selectedPlan={selectedPlan}
              onSelect={setSelectedPlan}
              lang={lang}
            />
          )}

          {allPlans.length === 0 && (
            <div className="py-8 text-center text-sm text-[#6b7280]">
              {dict.noPlans}
            </div>
          )}

          {/* Step 2: quantity */}
          <div className="my-5 border-t border-[#e5e7eb] pt-5">
            <div className="text-base font-medium text-[#111] mb-2.5 flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-[#111] text-white rounded-full text-sm font-extrabold shrink-0">
                2
              </span>
              {lang === "vi" ? "Số lượng eSIM" : "Quantity"}
            </div>
            <div className="flex items-center border border-[#e5e7eb] rounded-[30px] h-[42px] w-[160px]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full bg-[#f9fafb] text-lg font-semibold flex items-center justify-center mx-[3px] hover:bg-[#e5e7eb] transition-colors"
              >
                −
              </button>
              <span className="text-sm font-semibold flex-1 text-center">
                {quantity} {dict.esimUnit}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-full bg-[#f9fafb] text-lg font-semibold flex items-center justify-center mx-[3px] hover:bg-[#e5e7eb] transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Buy actions (reused) — local plans are fixed-duration */}
          <BuyActions
            selectedPlan={selectedPlan}
            days={selectedPlan?.durationDays ?? 30}
            quantity={quantity}
            isFixed
            dict={dict}
            lang={lang}
            destination={`eSIM ${meta.label}`}
          />
        </div>
      </div>

      {/* Cross-sell: other domestic carriers */}
      {otherCarriers.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-[#111] mb-4">
            {lang === "vi"
              ? "Xem thêm eSIM nội địa khác"
              : "Other domestic eSIMs"}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherCarriers.map((c) => {
              const cm = getCarrierMeta(c.provider);
              const href =
                lang === "vi"
                  ? `/esim-noi-dia/${c.provider}`
                  : `/en/domestic-esim/${c.provider}`;
              return (
                <a
                  key={c.provider}
                  href={href}
                  className="flex items-center gap-4 p-4 rounded-[14px] border border-[#e5e7eb] bg-white hover:bg-gray-50 hover:-translate-y-[2px] hover:shadow-md transition-all"
                >
                  <div
                    className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: cm.logoBg }}
                  >
                    <span className={cm.italic ? "italic" : undefined}>
                      {cm.label.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#111] truncate">
                      eSIM {cm.label}
                    </p>
                    <p className="text-[13px] text-[#6b7280] truncate">
                      {dict.save ? "" : ""}
                      {lang === "vi" ? "Từ" : "From"}{" "}
                      {c.fromVndPrice.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <EkycModal open={ekycOpen} onClose={() => setEkycOpen(false)} lang={lang} />
    </div>
  );
}

/* ── Plan group: a titled list of selectable plan cards ── */
function PlanGroup({
  title,
  plans,
  selectedPlan,
  onSelect,
  lang,
}: {
  title: string;
  plans: Plan[];
  selectedPlan: Plan | null;
  onSelect: (p: Plan) => void;
  lang: Locale;
}) {
  return (
    <div className="mb-5">
      <p className="text-[13px] font-semibold text-[#374151] mb-2">{title}</p>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {plans.map((plan) => {
          const selected = selectedPlan?.id === plan.id;
          const tag = firstTag(plan);
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelect(plan)}
              data-testid={`local-plan-${plan.id}`}
              className={`relative text-left rounded-[12px] border p-3.5 transition-all ${
                selected
                  ? "border-[#111] shadow-[0_0_0_1px_#111] bg-white"
                  : "border-[#e5e7eb] bg-white hover:border-[#9ca3af]"
              }`}
            >
              {tag && (
                <span className="absolute -top-[9px] right-3 text-[11px] font-medium px-[7px] py-[2px] rounded bg-[#FEF9E7] text-[#92400E] border border-[#F5C518]">
                  {tag}
                </span>
              )}
              <div className="flex items-center justify-between gap-2 mb-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                    plan.speed?.includes("5G")
                      ? "bg-[#FEF9E7] text-[#92400E]"
                      : "bg-[#f3f4f6] text-[#6b7280]"
                  }`}
                >
                  {plan.speed?.includes("5G") ? "5G" : "4G"}
                </span>
                <span className="text-[13px] font-bold text-[#111]">
                  {formatVnd(Number(plan.vndPrice))}
                  <span className="text-[11px] font-normal text-[#6b7280]">
                    /{cycleLabel(plan.durationDays, lang)}
                  </span>
                </span>
              </div>
              <p className="text-[15px] font-bold text-[#111] leading-tight">
                {dataLabel(plan)}
              </p>
              {plan.name && (
                <p className="text-[12px] text-[#6b7280] mt-0.5 line-clamp-2">
                  {plan.name}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Feature row ── */
function FeatureRow({
  label,
  value,
  pill,
  yes,
  yesText,
}: {
  label: string;
  value?: string;
  pill?: string;
  yes?: boolean;
  yesText?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-[#f3f4f6] last:border-0">
      <span className="text-[13px] text-[#6b7280] shrink-0">{label}</span>
      <div className="text-right min-w-0">
        {pill ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] text-[12px] font-medium">
            {pill}
          </span>
        ) : yes ? (
          <span className="inline-flex items-center gap-1 text-[#16A34A] text-[13px] font-medium">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
              <path d="M5 8l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {yesText}
          </span>
        ) : (
          <span className="text-[13px] font-medium text-[#111] truncate">{value}</span>
        )}
      </div>
    </div>
  );
}
