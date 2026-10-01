"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Loader2, MessageSquare, PhoneCall, Search, Wifi } from "lucide-react";
import { fetchEsimLookupToken, useEsimLookup } from "@/lib/hooks";
import type { EsimLookupResult } from "@/lib/hooks";
import {
  DataUsageBar,
  statusLabel,
  USAGE_STATUS_COLOR,
} from "@/components/layout/sections/profile/usage-bar";
import type { EsimLookupDict } from "./translations";

/**
 * Public "Tra cứu eSIM" page (#003).
 *
 * Two states in one page: the ICCID form, and the result once `?token=` is in the
 * URL. Submitting the form swaps the ICCID for a signed token and navigates, so
 * the address bar — and any link the customer forwards to family — carries the
 * token, never the ICCID.
 */
export function EsimLookupContent({
  dict,
  lang,
}: {
  dict: EsimLookupDict;
  lang: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [iccid, setIccid] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, isError } = useEsimLookup(token);

  // A token that no longer resolves (rotated secret, deleted eSIM) must not
  // leave the visitor staring at a spinner-free blank: fall back to the form.
  const showForm = !token || isError;

  useEffect(() => {
    if (isError) setFormError(dict.errors.tokenInvalid);
  }, [isError, dict.errors.tokenInvalid]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = iccid.replace(/[\s-]/g, "");
    if (!/^[0-9]{18,22}$/.test(cleaned)) {
      setFormError(dict.errors.invalid);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    const result = await fetchEsimLookupToken(cleaned);
    setSubmitting(false);
    if (!result.ok) {
      setFormError(
        result.reason === "notFound"
          ? dict.errors.notFound
          : result.reason === "invalid"
            ? dict.errors.invalid
            : dict.errors.generic,
      );
      return;
    }
    // Replace, not push: the ICCID the customer typed stays out of history.
    router.replace(`?token=${encodeURIComponent(result.token)}`);
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-4">
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <label
            htmlFor="lookup-iccid"
            className="block text-sm font-medium text-gray-700"
          >
            {dict.form.label}
          </label>
          <div className="flex gap-2 max-sm:flex-col">
            <input
              id="lookup-iccid"
              name="iccid"
              inputMode="numeric"
              autoComplete="off"
              placeholder={dict.form.placeholder}
              value={iccid}
              onChange={(e) => setIccid(e.target.value)}
              className="flex-1 h-[50px] rounded-[30px] border border-[#e5e7eb] px-5 text-base outline-none focus:border-[#9ca3af]"
              data-testid="lookup-iccid-input"
            />
            <button
              type="submit"
              disabled={submitting}
              className="h-[50px] shrink-0 rounded-[30px] bg-[#111] px-7 text-base font-semibold text-white transition-colors hover:bg-[#333] disabled:opacity-60"
              data-testid="lookup-submit"
            >
              {submitting ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  {dict.form.submit}
                </span>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500">{dict.form.hint}</p>
          {formError && (
            <p className="text-sm font-medium text-red-600" data-testid="lookup-error">
              {formError}
            </p>
          )}
        </form>
      )}

      {token && isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-400">{dict.loading}</span>
        </div>
      )}

      {token && !isLoading && !isError && data && (
        <LookupResult data={data} dict={dict} lang={lang} />
      )}
    </div>
  );
}

function LookupResult({
  data,
  dict,
  lang,
}: {
  data: EsimLookupResult;
  dict: EsimLookupDict;
  lang: string;
}) {
  // Same derivations as the signed-in profile card, so the two never disagree:
  // the clock starts when the eSIM first connects, not at purchase (#062).
  const totalGb = data.totalMb / 1024;
  const usedGb = data.usedMb / 1024;
  const remainingMb =
    data.remainingMb ??
    (data.totalMb > 0 ? Math.max(0, data.totalMb - data.usedMb) : null);
  const remainingGb = remainingMb === null ? null : remainingMb / 1024;

  const activatedAt = data.activatedAt ? new Date(data.activatedAt) : null;
  const expiresAt = data.expiredAt ? new Date(data.expiredAt) : null;
  const isActivated = !!activatedAt || data.status?.toUpperCase() === "ACTIVE";

  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const totalDays =
    data.durationDays ??
    (activatedAt && expiresAt
      ? Math.max(
          1,
          Math.round((expiresAt.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24)),
        )
      : null);
  const daysUsed =
    totalDays !== null && daysRemaining !== null
      ? Math.min(totalDays, Math.max(0, totalDays - daysRemaining))
      : null;

  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4"
      data-testid="lookup-result"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {data.planName && (
            <p className="text-base font-semibold text-gray-900">{data.planName}</p>
          )}
          {data.iccidMasked && (
            <p className="mt-1 font-mono text-sm text-gray-500">
              {dict.result.iccid}: {data.iccidMasked}
            </p>
          )}
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-sm font-medium ${
            USAGE_STATUS_COLOR[data.status?.toUpperCase()] || "bg-gray-100 text-gray-500"
          }`}
          data-testid="lookup-status"
        >
          {statusLabel(data.status, lang)}
        </span>
      </div>

      {!data.usageAvailable ? (
        <p className="text-sm text-gray-500" data-testid="lookup-usage-unavailable">
          {dict.result.usageUnavailable}
        </p>
      ) : (
        <>
          {data.isUnlimited || totalGb > 0 ? (
            <DataUsageBar
              label={dict.result.data}
              used={usedGb}
              total={totalGb}
              unit="GB"
              isUnlimited={data.isUnlimited}
              lang={lang}
            />
          ) : (
            // Some providers report only what has been used and never the
            // package size; a bar drawn against 0 would read "0 GB left".
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{dict.result.data}</span>
              <span className="text-sm font-semibold text-gray-900">
                {dict.result.used} {usedGb.toFixed(usedGb < 100 ? 1 : 0)} GB
              </span>
            </div>
          )}

          {isActivated && totalDays !== null && daysUsed !== null ? (
            <DataUsageBar
              label={dict.result.period}
              used={daysUsed}
              total={totalDays}
              unit={dict.result.daysUnit}
              isUnlimited={false}
              lang={lang}
              integer
            />
          ) : isActivated ? (
            <p className="text-sm text-gray-500">{dict.result.expiryUnknown}</p>
          ) : (
            <p className="text-sm text-gray-500" data-testid="lookup-not-activated">
              {dict.result.notActivated}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <Wifi className="mx-auto mb-1 h-3.5 w-3.5 text-blue-500" />
              <p className="text-lg font-medium text-blue-700">
                {data.isUnlimited ? "∞" : remainingGb === null ? "—" : remainingGb.toFixed(1)}
              </p>
              <p className="text-sm text-blue-500">
                {data.isUnlimited ? dict.result.unlimited : dict.result.gbRemaining}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-center">
              <Calendar className="mx-auto mb-1 h-3.5 w-3.5 text-emerald-500" />
              <p className="text-lg font-medium text-emerald-700">
                {daysRemaining !== null ? daysRemaining : "—"}
              </p>
              <p className="text-sm text-emerald-500">{dict.result.daysLeft}</p>
            </div>
          </div>
        </>
      )}

      {/* Minutes / SMS allowance, which the eSIM pages used to omit entirely (#023). */}
      {(data.callMinutes || data.smsCount) && (
        <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-3">
          {!!data.callMinutes && (
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
              <PhoneCall className="h-3.5 w-3.5 text-gray-400" />
              {data.callMinutes} {dict.result.callMinutes}
            </span>
          )}
          {!!data.smsCount && (
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
              <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
              {data.smsCount} {dict.result.sms}
            </span>
          )}
        </div>
      )}

      {data.expiredAt && (
        <p className="text-center text-sm text-gray-400">
          {dict.result.expires}{" "}
          {new Date(data.expiredAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}

      {data.lastUpdateTime && (
        <p className="text-center text-sm text-gray-400">
          {dict.result.lastUpdate}{" "}
          {new Date(data.lastUpdateTime).toLocaleString(lang === "vi" ? "vi-VN" : "en-US")}
        </p>
      )}
    </div>
  );
}
