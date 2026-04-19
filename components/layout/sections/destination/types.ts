import type { Destination, Plan } from "@/lib/api";

// ===== Dictionary shape for destinationPage =====
export interface DestinationDict {
  title: string;
  subtitle: string;
  notFound: string;
  notFoundDesc: string;
  heroTag: string;
  viewCountries: string;
  supportedCountries: string;
  carriers: { title: string; domestic: string };
  features: {
    title: string;
    hotspot: string;
    calls: string;
    localNumber: string;
    ekyc: string;
    topup: string;
    yes: string;
    no: string;
  };
  delivery: {
    title: string;
    deliveryTime: string;
    instant: string;
    instantDesc: string;
    activationPeriod: string;
    activationDesc: string;
  };
  note: { title: string; text: string };
  planTabs: { data: string; dataCalls: string };
  planSections: { fixed: string; daily: string; unlimited: string };
  speed: { normal: string; high: string };
  unlimitedHint: string;
  daysLabel: string;
  daysUnit: string;
  quantity: string;
  esimUnit: string;
  buyNow: string;
  addToCart: string;
  noPlans: string;
  trust: {
    rating: string;
    ratingCount: string;
    trustpilot: string;
    secure: string;
    support: string;
    refund: string;
  };
  greenBox: { line1: string; line2: string; line3: string };
  disclaimer: string;
  disclaimerLink: string;
  save: string;
  calTitle: string;
  calSelectStart: string;
  calSelectEnd: string;
  calClose: string;
  calConfirm: string;
  calDays: string;
  weekDays: string[];
}

// ===== Categorized plans =====
export interface CategorizedPlans {
  fixed: Plan[];
  daily: Plan[];
  unlimited: Plan[];
  callsFixed: Plan[];
}

export function categorizePlans(plans: Plan[]): CategorizedPlans {
  const result: CategorizedPlans = {
    fixed: [],
    daily: [],
    unlimited: [],
    callsFixed: [],
  };

  for (const p of plans) {
    const name = p.name.toLowerCase();
    const type = (p.type || "").toLowerCase();

    // calls plans — has sms/call minutes or type contains "call"
    if (
      (p.sms && p.sms > 0) ||
      (p.call && p.call > 0) ||
      type.includes("call") ||
      name.includes("gọi") ||
      name.includes("sms")
    ) {
      result.callsFixed.push(p);
      continue;
    }

    // unlimited — type "data-unlimited" or very large dataGb
    if (
      type === "data-unlimited" ||
      type.includes("unlimited") ||
      p.dataGb >= 9999 ||
      name.includes("unlimited") ||
      name.includes("không giới hạn")
    ) {
      result.unlimited.push(p);
      continue;
    }

    // daily — type "data-daily" or name pattern
    if (
      type === "data-daily" ||
      type.includes("daily") ||
      name.includes("/ngày") ||
      name.includes("/day") ||
      name.includes("daily") ||
      name.includes("/ngay")
    ) {
      result.daily.push(p);
      continue;
    }

    // fixed (everything else: "data-in-total", etc.)
    result.fixed.push(p);
  }

  // Sort by price ascending
  for (const key of Object.keys(result) as (keyof CategorizedPlans)[]) {
    result[key].sort((a, b) => a.price - b.price);
  }

  return result;
}

// ===== Shared props =====
export interface DestinationPlansProps {
  destination: Destination;
  slug: string;
  dict: DestinationDict;
  lang: string;
}
