"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import type { CountryCode } from "libphonenumber-js";
import {
  DEFAULT_COUNTRY,
  PINNED_COUNTRIES,
  allCountries,
  countryName,
  countryOfInternational,
  dialCodeOf,
  examplePlaceholder,
  fromInternational,
  toInternational,
} from "@/lib/phone";

/**
 * Country (flag + code) and number, apart (vande-1411 #007). `value` and
 * `onChange` carry the number in its international form, +84912345678; the
 * field itself shows what the shopper typed. Pasting "+82 10 1234 5678"
 * switches the flag to Korea.
 */
export function PhoneInput({
  id,
  value,
  onChange,
  lang,
  invalid,
  inputClassName,
  testId = "phone-input",
}: {
  id?: string;
  value: string;
  onChange: (international: string) => void;
  lang: string;
  invalid?: boolean;
  /** Border and padding of the number field, to match the form around it. */
  inputClassName?: string;
  testId?: string;
}) {
  // Việt Nam on the server and the first paint; the browser's own country
  // on the English site once mounted (no hydration mismatch).
  const fallback = DEFAULT_COUNTRY;
  const [country, setCountry] = useState<CountryCode>(
    () => fromInternational(value, fallback).country
  );
  const [national, setNational] = useState(() => fromInternational(value, fallback).national);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const lastEmitted = useRef(value);
  const box = useRef<HTMLDivElement>(null);

  // A value set from outside (the profile's number filled in) is shown.
  useEffect(() => {
    if (value === lastEmitted.current) return;
    const next = fromInternational(value, fallback);
    setCountry(next.country);
    setNational(next.national);
    lastEmitted.current = value;
  }, [value, fallback]);

  useEffect(() => {
    if (lang === "vi" || lastEmitted.current) return;
    setCountry(defaultCountry(lang));
    // Once, on mount: a later empty field keeps the country picked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const emit = (nextNational: string, nextCountry: CountryCode) => {
    const international = toInternational(nextNational, nextCountry);
    lastEmitted.current = international;
    onChange(international);
  };

  const type = (text: string) => {
    const cleaned = text.replace(/[^\d+\s().-]/g, "").slice(0, 24);
    // "+82 …" typed or pasted: the flag follows.
    const pasted = countryOfInternational(cleaned);
    if (pasted && pasted !== country) {
      const parsed = fromInternational(cleaned, pasted);
      setCountry(pasted);
      setNational(parsed.national);
      emit(parsed.national, pasted);
      return;
    }
    setNational(cleaned);
    emit(cleaned, country);
  };

  const pick = (next: CountryCode) => {
    setCountry(next);
    setOpen(false);
    setQuery("");
    emit(national, next);
  };

  const list = useMemo(() => {
    const names = new Map(allCountries().map((c) => [c, countryName(c, lang)]));
    const q = query.trim().toLowerCase();
    const match = (c: CountryCode) =>
      !q ||
      names.get(c)!.toLowerCase().includes(q) ||
      c.toLowerCase() === q ||
      dialCodeOf(c).includes(q.replace(/^\+?/, "+"));
    const rest = allCountries()
      .filter((c) => !PINNED_COUNTRIES.includes(c))
      .sort((a, b) => names.get(a)!.localeCompare(names.get(b)!, lang));
    return {
      pinned: PINNED_COUNTRIES.filter(match),
      rest: rest.filter(match),
      names,
    };
  }, [query, lang]);

  const row = (c: CountryCode) => (
    <li key={c}>
      <button
        type="button"
        onClick={() => pick(c)}
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 ${
          c === country ? "font-semibold" : ""
        }`}
        data-testid={`${testId}-country-${c}`}
      >
        <Flag country={c} />
        <span className="flex-1 truncate">{list.names.get(c)}</span>
        <span className="text-gray-500 tabular-nums">{dialCodeOf(c)}</span>
      </button>
    </li>
  );

  return (
    <div ref={box} className="relative flex w-full gap-2" data-testid={testId}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={lang === "vi" ? "Chọn quốc gia" : "Choose country"}
        className={`flex shrink-0 items-center gap-1 rounded-xl border px-3 text-base sm:text-sm ${
          invalid ? "border-red-400" : "border-border-primary"
        }`}
        data-testid={`${testId}-country`}
      >
        <Flag country={country} />
        <span className="tabular-nums">{dialCodeOf(country)}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={national}
        onChange={(e) => type(e.target.value)}
        placeholder={examplePlaceholder(country)}
        className={
          inputClassName ??
          `w-full min-w-0 rounded-xl border px-4 py-2.5 text-base sm:text-sm outline-none transition-colors ${
            invalid ? "border-red-400" : "border-border-primary focus:border-[var(--border-focus)]"
          }`
        }
        data-testid={`${testId}-number`}
      />
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="relative border-b p-2">
            <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder={lang === "vi" ? "Tìm quốc gia hoặc mã…" : "Search country or code…"}
              className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-2 text-base outline-none sm:text-sm"
              data-testid={`${testId}-search`}
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1" role="listbox">
            {list.pinned.map(row)}
            {list.pinned.length > 0 && list.rest.length > 0 && (
              <li className="my-1 border-t" aria-hidden />
            )}
            {list.rest.map(row)}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Việt Nam on the Vietnamese site; on the English one, the country of the
 * browser's language when it has one.
 */
function defaultCountry(lang: string): CountryCode {
  if (lang === "vi" || typeof navigator === "undefined") return DEFAULT_COUNTRY;
  const region = (navigator.languages?.[0] ?? navigator.language ?? "").split("-")[1];
  const code = region?.toUpperCase() as CountryCode | undefined;
  return code && allCountries().includes(code) ? code : DEFAULT_COUNTRY;
}

/**
 * A flag as a picture: Windows shows a flag emoji as two letters ("VN"), so
 * the SVGs live in /public/flags.
 */
function Flag({ country }: { country: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${country}.svg`}
      alt=""
      width={20}
      height={14}
      loading="lazy"
      className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
    />
  );
}
