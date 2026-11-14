import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";

/**
 * Phone numbers by country (vande-1411 #007).
 *
 * The field used to take "+84 xxx…" and any 8–20 digits, so a Vietnamese
 * customer who typed 9 digits starting with 03 passed: nothing knew whether
 * 912345678 was a Vietnamese number short of its 0 or a foreign one short of
 * its country code. Now the country is picked apart (🇻🇳 +84 by default), the
 * number is checked against that country's rules (Google's libphonenumber
 * data), and it is kept in the international form, +84912345678, whatever way
 * it was typed.
 */

/** Countries most buyers come from, listed first. */
export const PINNED_COUNTRIES: CountryCode[] = [
  "VN",
  "KR",
  "CN",
  "JP",
  "TW",
  "TH",
  "SG",
  "US",
  "AU",
];

export const DEFAULT_COUNTRY: CountryCode = "VN";

export function flagOf(country: string): string {
  return country
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(0x1f1a5 + c.charCodeAt(0)));
}

export function dialCodeOf(country: CountryCode): string {
  return `+${getCountryCallingCode(country)}`;
}

export function countryName(country: string, lang: string): string {
  try {
    return (
      new Intl.DisplayNames([lang === "vi" ? "vi" : "en"], { type: "region" }).of(country) ??
      country
    );
  } catch {
    return country;
  }
}

export function allCountries(): CountryCode[] {
  return getCountries();
}

/** "0912 345 678" for Việt Nam: what to type, in the country's own form. */
export function examplePlaceholder(country: CountryCode): string {
  const example = getExampleNumber(country, examples);
  return example ? example.formatNational() : "";
}

/** The country of a number typed with its "+code", if there is one. */
export function countryOfInternational(value: string): CountryCode | undefined {
  if (!value.trim().startsWith("+")) return undefined;
  const typer = new AsYouType();
  typer.input(value);
  return typer.getCountry() ?? parsePhoneNumberFromString(value)?.country;
}

/**
 * What is kept for a number typed in the national field under a country:
 * +84912345678 for "0912 345 678", "912 345 678" or "+84 912 345 678".
 * Empty for an empty field; for a number that does not parse, the code and
 * the digits, so the check below can say what is wrong.
 */
export function toInternational(national: string, country: CountryCode): string {
  const raw = national.trim();
  if (!raw) return "";
  const parsed = parsePhoneNumberFromString(raw, country);
  if (parsed) return parsed.number;
  const digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+")) return `+${digits}`;
  return `${dialCodeOf(country)}${digits.replace(/^0+/, "")}`;
}

/** Back from what is kept to the country and the national form. */
export function fromInternational(
  value: string | null | undefined,
  fallback: CountryCode
): { country: CountryCode; national: string } {
  const raw = (value ?? "").trim();
  if (!raw) return { country: fallback, national: "" };
  const parsed = raw.startsWith("+")
    ? parsePhoneNumberFromString(raw)
    : parsePhoneNumberFromString(raw, fallback);
  if (parsed?.country) {
    return { country: parsed.country, national: parsed.formatNational() };
  }
  return { country: fallback, national: raw };
}

/** A number as kept from any typed or stored form: "0912345678" → +84912345678. */
export function normalizePhone(
  value: string | null | undefined,
  fallback: CountryCode = DEFAULT_COUNTRY
): string {
  const { country, national } = fromInternational(value, fallback);
  return toInternational(national, country);
}

/**
 * Why a number cannot be used, in the shopper's language, or null when it is
 * fine. An empty number is not checked here: whether it is needed is the
 * form's business.
 */
export function phoneError(value: string, lang: string): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  const vi = lang === "vi";
  const parsed = parsePhoneNumberFromString(raw.startsWith("+") ? raw : `+${raw}`);
  if (parsed?.isValid()) return null;
  const country = parsed?.country ?? countryOfInternational(raw);
  if (country === "VN" || raw.startsWith("+84")) {
    return vi
      ? "Số điện thoại Việt Nam gồm 10 số, bắt đầu bằng 0 (ví dụ 0912 345 678)."
      : "A Vietnamese phone number has 10 digits starting with 0 (e.g. 0912 345 678).";
  }
  const name = country ? countryName(country, lang) : null;
  return vi
    ? `Số này không đúng định dạng số điện thoại${name ? ` ${name}` : ""} — kiểm tra lại số, hoặc chọn đúng quốc gia ở ô bên trái.`
    : `This does not look like a${name ? ` ${name}` : ""} phone number — check it, or pick the right country on the left.`;
}
