/**
 * Help Center category & parent (section) configuration.
 *
 * The API may return either the canonical English key (e.g. `getting_started`)
 * or a localized key (e.g. `bat_dau` for Vietnamese). To make UI rendering and
 * URL building locale-stable, we keep a single source-of-truth table here and
 * expose helpers that:
 *  - resolve any incoming variant (canonical / en / vi) to a canonical id
 *  - return the localized human label
 *  - go from a label back to the canonical key
 */

type LocaleEntry = { key: string; label: string };

interface CategoryEntry {
  /** Canonical id used everywhere internally (matches the EN key). */
  id: string;
  en: LocaleEntry;
  vi: LocaleEntry;
}

// ---------- Categories (top-level) ----------

const CATEGORIES: CategoryEntry[] = [
  {
    id: "getting_started",
    en: { key: "getting_started", label: "Getting Started" },
    vi: { key: "bat_dau", label: "Bắt đầu" },
  },
  {
    id: "plans_and_payments",
    en: { key: "plans_and_payments", label: "Plans & Payments" },
    vi: { key: "goi_cuoc_thanh_toan", label: "Gói cước & Thanh toán" },
  },
  {
    id: "troubleshooting",
    en: { key: "troubleshooting", label: "Troubleshooting" },
    vi: { key: "khac_phuc_su_co", label: "Khắc phục sự cố" },
  },
  {
    id: "faq",
    en: { key: "faq", label: "FAQ" },
    vi: { key: "cau_hoi_thuong_gap", label: "Câu hỏi thường gặp" },
  },
];

// ---------- Parents (sections inside a category) ----------

const PARENTS: CategoryEntry[] = [
  {
    id: "setting_up",
    en: { key: "setting_up", label: "Setting up" },
    vi: { key: "cai_dat", label: "Cài đặt" },
  },
  {
    id: "using_esim",
    en: { key: "using_esim", label: "Using esim.vn eSIM" },
    vi: { key: "su_dung_esim", label: "Sử dụng eSIM esim.vn" },
  },
  {
    id: "device_compatibility",
    en: { key: "device_compatibility", label: "Device compatibility" },
    vi: { key: "tuong_thich_thiet_bi", label: "Tương thích thiết bị" },
  },
  {
    id: "payments",
    en: { key: "payments", label: "Payments" },
    vi: { key: "thanh_toan", label: "Thanh toán" },
  },
  {
    id: "plans",
    en: { key: "plans", label: "Plans" },
    vi: { key: "goi_cuoc", label: "Gói cước" },
  },
  {
    id: "find_an_answer",
    en: { key: "find_an_answer", label: "Find an answer" },
    vi: { key: "tim_cau_tra_loi", label: "Tìm câu trả lời" },
  },
  {
    id: "esim_functions",
    en: { key: "esim_functions", label: "eSIM functions" },
    vi: { key: "chuc_nang_esim", label: "Chức năng eSIM" },
  },
  {
    id: "esim_basics",
    en: { key: "esim_basics", label: "eSIM basics" },
    vi: { key: "co_ban_ve_esim", label: "Cơ bản về eSIM" },
  },
  {
    id: "about_esimvn",
    en: { key: "about_esimvn", label: "About esim.vn" },
    vi: { key: "ve_esim_vn", label: "Về esim.vn" },
  },
];

// ---------- Index lookups (built once at module load) ----------

function buildIndexes(entries: CategoryEntry[]) {
  const byAnyKey = new Map<string, CategoryEntry>();
  const byLabel = new Map<string, CategoryEntry>();

  for (const entry of entries) {
    byAnyKey.set(entry.id, entry);
    byAnyKey.set(entry.en.key, entry);
    byAnyKey.set(entry.vi.key, entry);

    byLabel.set(entry.en.label.toLowerCase(), entry);
    byLabel.set(entry.vi.label.toLowerCase(), entry);
  }

  return { byAnyKey, byLabel };
}

const CATEGORY_INDEX = buildIndexes(CATEGORIES);
const PARENT_INDEX = buildIndexes(PARENTS);

// ---------- Generic helpers ----------

function fallbackLabel(key: string): string {
  return key.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getEntry(
  index: { byAnyKey: Map<string, CategoryEntry> },
  key: string | null | undefined
): CategoryEntry | null {
  if (!key) return null;
  return index.byAnyKey.get(key) ?? null;
}

function getEntryFromLabel(
  index: { byLabel: Map<string, CategoryEntry> },
  label: string | null | undefined
): CategoryEntry | null {
  if (!label) return null;
  return index.byLabel.get(label.trim().toLowerCase()) ?? null;
}

// ---------- Public API ----------

/** Resolve any variant of a category key to its canonical id. */
export function resolveCategoryKey(key: string | null | undefined): string {
  return getEntry(CATEGORY_INDEX, key)?.id ?? (key ?? "");
}

/** Resolve any variant of a parent (section) key to its canonical id. */
export function resolveParentKey(key: string | null | undefined): string {
  return getEntry(PARENT_INDEX, key)?.id ?? (key ?? "");
}

/** Get the localized label for a category key (canonical / en / vi). */
export function getCategoryLabel(key: string, lang = "en"): string {
  const entry = getEntry(CATEGORY_INDEX, key);
  if (entry) {
    return (lang === "vi" ? entry.vi.label : entry.en.label) || entry.en.label;
  }
  return fallbackLabel(key);
}

/** Get the localized label for a parent (section) key. */
export function getParentLabel(key: string, lang = "en"): string {
  const entry = getEntry(PARENT_INDEX, key);
  if (entry) {
    return (lang === "vi" ? entry.vi.label : entry.en.label) || entry.en.label;
  }
  return fallbackLabel(key);
}

/** Reverse lookup: human label → canonical category key (or null). */
export function getCategoryKeyFromLabel(label: string): string | null {
  return getEntryFromLabel(CATEGORY_INDEX, label)?.id ?? null;
}

/** Reverse lookup: human label → canonical parent key (or null). */
export function getParentKeyFromLabel(label: string): string | null {
  return getEntryFromLabel(PARENT_INDEX, label)?.id ?? null;
}

/**
 * Legacy alias — kept for places that still call `formatParent(...)`.
 * New code should prefer `getParentLabel(...)`.
 */
export function formatParent(parent: string, lang = "en"): string {
  return getParentLabel(parent, lang);
}

/** Expose the raw tables for advanced consumers (e.g. building filters). */
export const helpCenterCategories = CATEGORIES.map(({ id, en, vi }) => ({
  id,
  en,
  vi,
}));
export const helpCenterParents = PARENTS.map(({ id, en, vi }) => ({
  id,
  en,
  vi,
}));
