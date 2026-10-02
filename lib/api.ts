// API base URL - configure via environment variable
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

import { mockSupportedDevices } from "./mock-supported-devices";
import { pickContextFaqs } from "./faq-context";

// ===== Types =====

/** A region a destination belongs to, as returned inside the destination payload. */
export interface RegionRef {
  id: number;
  name: string;
  slug: string;
  slugVi?: string | null;
  avatarUrl?: string | null;
}

export interface Destination {
  id: number;
  name: string;
  slug: string;
  slugVi?: string;
  countryCode: string;
  /**
   * Regions (and global packs) that include this country. Only `/destinations/
   * slug/:slug` loads the relation; list endpoints leave it undefined.
   */
  regions?: RegionRef[];
  parentId?: number;
  flagUrl?: string;
  avatarUrl?: string;
  keySearch?: string;
  isPopular: boolean;
  isActive: boolean;
  title?: string;
  titleVi?: string;
  description?: string;
  descriptionVi?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Faq {
  id: string;
  language: string;
  isActive: boolean;
  sortOrder: number;
  answer: string;
  question: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhyChooseUs {
  id: string;
  language: string;
  isActive: boolean;
  sortOrder: number;
  icon: string | null;
  description: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogMiniTag {
  id: string;
  image: string | null;
  title: string;
  description: string | null;
  contentButton: string | null;
  linkUrl: string | null;
  /** English copy for English posts; each falls back to the field above (#059). */
  titleEn?: string | null;
  descriptionEn?: string | null;
  contentButtonEn?: string | null;
  linkUrlEn?: string | null;
}

export interface BlogAuthor {
  id: number;
  userId: number;
  name: string;
  /** English name; empty means show the Vietnamese one (#025). */
  nameEn?: string | null;
  slug: string;
  avatar?: string | null;
  description?: string | null;
  /** English summary; empty means show the Vietnamese one (#025). */
  descriptionEn?: string | null;
}

/** Author name and summary in the page's language, Vietnamese as fallback. */
export function localizedAuthor(author: BlogAuthor, locale: string) {
  const english = locale === "en";
  return {
    name: (english && author.nameEn?.trim()) || author.name,
    description: (english && author.descriptionEn?.trim()) || author.description || null,
  };
}

export interface Blog {
  id: string;
  language: string;
  publishedAt: string | null;
  isPublished: boolean;
  author: string | null;
  authorAvatar?: string | null;
  authorBio?: string | null;
  authorSlug?: string | null;
  authorProfile?: BlogAuthor | null;
  tags?: string | null;
  coverImage: string | null;
  excerpt: string | null;
  content: string;
  slug: string;
  title: string;
  category: string | null;
  parent?: string | null;
  timeRead: number | string | null;
  miniTag: BlogMiniTag | null;
  planIds: number[] | string[] | null;
  plans: Plan[] | null;
  relatedBlogs?: Blog[] | null;
  isPopular?: boolean;
  faqEnabled?: boolean;
  faqIds?: string[];
  faqs?: Faq[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  device: string;
}

export interface Manufacturer {
  manufacturer: string;
  devices: Device[];
  /**
   * An extra note for this brand, managed in the CMS (#079). Absent when the
   * brand has none — the page used to show a single note from the locale file,
   * hard-coded to appear under iPhone.
   */
  note?: string | null;
}

export interface DeviceType {
  type: string;
  manufacturers: Manufacturer[];
}

export interface SupportedDevicesResponse {
  data: DeviceType[];
}

export interface Region {
  id: number;
  name: string;
  slug: string;
  slugVi?: string;
  destinations?: Destination[];
  destinationCount?: number;
  avatarUrl?: string;
  iconUrl?: string;
  title?: string;
  titleVi?: string;
  description?: string;
  descriptionVi?: string;
  isActive: boolean;
  fromPrice?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

/** Marketing/UI tags attached to a plan. */
export type PlanTag = "popular" | "best-seller" | "new" | "hot-deal";

export interface Plan {
  id: number;
  provider: string;
  providerPlanId: string;
  name: string;
  slug: string;
  countryCode?: string;
  destinationId?: number;
  destination?: Destination;
  regionId?: number;
  region?: Region;
  durationDays: number;
  dataMb: number;
  costPrice: number;
  price: number;
  retailPrice: number;
  currency: string;
  sms?: number | null;
  call?: number | null;
  type: string;
  topUp: boolean;
  speed?: string;
  operatorName?: string;
  fupSpeed?: string;
  isCheapest: boolean;
  isAbleMultidate?: boolean;
  discount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  vndPrice: number;
  /** Marketing tags shown as chips on the plan card. */
  tags?: PlanTag[] | string[];
  /** True when the plan uses local provider inventory (e.g. Viettel) — show a provider badge. */
  isLocalInventory?: boolean;
  /**
   * eSIM nội địa — SIM data dùng trong nước, thuộc tab riêng ở trang chủ.
   *
   * Khác `isLocalInventory`, cờ đó chỉ nói "giá niêm yết bằng VND" và eSIM du
   * lịch của Viettel cũng mang nó. Việc chia nhóm do backend làm, nên trang bán
   * hàng hiếm khi cần đọc cờ này — có ở đây để kiểu dữ liệu khớp API.
   */
  isDomesticEsim?: boolean;
  /**
   * Unsold eSIMs left for a local-inventory plan. Undefined for API
   * providers, which create an eSIM on demand and can never be out of stock.
   */
  availableStock?: number | null;
  /** True when the plan requires KYC verification before activation. */
  isKyc?: boolean;
  /**
   * The date the eSIM has to be activated by, as `yyyy-mm-dd` in Vietnam time
   * (#070). Computed by the API from the day the customer views the product, or
   * taken from the printed expiry of local stock. Absent when the supplier has
   * not stated a window — show the generic wording then, never a guessed date.
   */
  activationDeadline?: string | null;
  /** Days the supplier allows for activation, if stated (#070). */
  activationValidityDays?: number | null;
  /**
   * When the daily allowance starts over (#063, shown by #071). `"rolling_24h"`
   * is a 24-hour cycle from installation; `"calendar_day"` ends at 23:59 in
   * `dailyResetUtcOffset`. Absent when the supplier has not stated it.
   */
  dailyResetPolicy?: "rolling_24h" | "calendar_day" | null;
  /** Hours east of UTC a calendar-day reset is counted in, e.g. 7 or 8. */
  dailyResetUtcOffset?: number | null;
  /**
   * True for a plan whose traffic exits on a local IP instead of being routed
   * through Hong Kong — the variant TikTok / ChatGPT work on. Captured at sync
   * time from the provider package name; see lib/plan-nonhkip.ts (#041).
   */
  isNonHkIp?: boolean;
  /**
   * Whether TikTok and ChatGPT work on this plan, decided by the API from the
   * uploaded APN table or the esimaccess "nonhkip" marker (#065, #067).
   *
   * `tiktokAllDevices` is the only one safe to put behind a filter: TikTok differs
   * by device platform (APN `cmhk` works on iPhone, not on Android) and the page
   * does not know what the visitor is holding.
   */
  appSupport?: {
    tiktokIos: boolean;
    tiktokAndroid: boolean;
    tiktokAllDevices: boolean;
    chatGpt: boolean;
    /**
     * Whether the APN table had an answer at all. All-false with `known: false`
     * means "not listed" — true of every plan outside China — and must never be
     * printed as "TikTok does not work" (#068).
     */
    known: boolean;
  } | null;
  /** Whether the plan allows hotspot / tethering. */
  hotSpot?: boolean;
  /** Hotspot data allowance in GB per day (e.g. 2 means 2 GB/day). */
  /**
   * Free-text hotspot allowance as stored by the backend (`string | null`),
   * e.g. "10GB", "300MB", "1.5GB" — occasionally a bare number ("180").
   * It was typed `number` here, which is what let a caller append its own
   * "GB" and render "10GBGB/ngày".
   */
  hotSpotAllow?: string | null;
}

/** Response shape from /api/v1/plans/by-destination/{slug} */
export interface PlansByDestinationResponse {
  dataPlans: Plan[];
  slowUnlimited: Plan[];
  fastUnlimited: Plan[];
  dailyUnlimited: Plan[];
  smsCallEsim?: Plan[];
  localEsim?: Plan[];
  /**
   * Fixed-data plans that work with TikTok but lost the price de-duplication
   * (#067). They are NOT part of the default view — `dataPlans` stays exactly the
   * de-duplicated list it is today — and are merged in only when the customer asks
   * to see plans that work with TikTok (#068).
   */
  tiktokHiddenByPrice?: Plan[];
}

/**
 * Normalize a raw plans-by-destination payload into the canonical
 * `PlansByDestinationResponse` shape.
 *
 * Some backend versions return the SMS/Call list under a differently-cased
 * key (`SmsCallEsim` instead of `smsCallEsim`). Without this, the SMS/Call
 * category tab never renders because `plans.smsCallEsim` stays `undefined`.
 * This maps any casing variant back to `smsCallEsim`.
 */
export function normalizePlansByDestination(
  raw: PlansByDestinationResponse | Record<string, unknown> | null | undefined
): PlansByDestinationResponse {
  const EMPTY: PlansByDestinationResponse = {
    dataPlans: [],
    slowUnlimited: [],
    fastUnlimited: [],
    dailyUnlimited: [],
    smsCallEsim: [],
    localEsim: [],
  };
  if (!raw || typeof raw !== "object") return EMPTY;

  const r = raw as Record<string, unknown>;
  const dataPlans = Array.isArray(r.dataPlans) ? (r.dataPlans as Plan[]) : [];
  const slowUnlimited = Array.isArray(r.slowUnlimited) ? (r.slowUnlimited as Plan[]) : [];
  const fastUnlimited = Array.isArray(r.fastUnlimited) ? (r.fastUnlimited as Plan[]) : [];
  const dailyUnlimited = Array.isArray(r.dailyUnlimited) ? (r.dailyUnlimited as Plan[]) : [];
  const localEsim = Array.isArray(r.localEsim) ? (r.localEsim as Plan[]) : [];

  // Accept the SMS/Call list under any common casing of "smsCallEsim".
  const smsCallRaw =
    r.smsCallEsim ?? r.SmsCallEsim ?? r.SMSCallEsim ?? r.smscallesim ?? null;
  const smsCallEsim = Array.isArray(smsCallRaw) ? (smsCallRaw as Plan[]) : [];

  // Carried through explicitly: this function builds a fresh object, so a group
  // it does not name is dropped on the floor (#067).
  const tiktokHiddenByPrice = Array.isArray(r.tiktokHiddenByPrice)
    ? (r.tiktokHiddenByPrice as Plan[])
    : [];

  return {
    dataPlans,
    slowUnlimited,
    fastUnlimited,
    dailyUnlimited,
    smsCallEsim,
    localEsim,
    tiktokHiddenByPrice
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  hasNextPage: boolean;
}

export type InfinityPaginationResponse<T> = PaginatedResponse<T>;

export interface FileType {
  id?: string | number;
  path?: string | null;
  url?: string | null;
  publicUrl?: string | null;
  public_url?: string | null;
  secureUrl?: string | null;
  secure_url?: string | null;
  location?: string | null;
  name?: string | null;
  fileName?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  mime?: string | null;
  size?: number | null;
  [key: string]: unknown;
}

export interface HeroBanner {
  id: string;
  title?: string | null;
  language?: string | null;
  firstIcon?: string | null;
  firstContent?: string | null;
  secondIcon?: string | null;
  secondContent?: string | null;
  description?: string | null;
  image?: FileType | string | null;
  active: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Footer {
  id: string;
  title: string;
  titleVi: string;
  /** URL on the Vietnamese site. */
  url: string;
  /** URL on the English site; falls back to `url` (#043). */
  urlEn?: string | null;
  sortOrder?: number;
  /** Column heading, default/English — also the grouping key (#088). */
  categories?: string | null;
  /** Column heading in Vietnamese; falls back to categories. */
  categoriesVi?: string | null;
  iconUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface TopBar {
  id: string;
  icon?: FileType | string | null;
  title: string;
  titleVi: string;
  buttonContent: string;
  url: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface FetchOptions {
  page?: number;
  limit?: number;
  filters?: string;
  orderBy?: string;
  order?: string;
  lang?: string;
  /**
   * Current page URL/pathname. Used by `/api/v1/faqs/by-context` to scope
   * FAQs to the page that is calling the API (e.g. `"/vi/coupon"`).
   */
  url?: string;
  /**
   * Blog id. Used by `/api/v1/faqs/by-context` when the caller is a blog
   * detail page so the backend can return FAQs attached to that post.
   */
  blogId?: string;
  /** Generic `type` query param (e.g. `trang_chu` | `quoc_gia` | `khu_vuc`). */
  type?: string;
}

type PublicListResponse<T> = InfinityPaginationResponse<T> | T[];

function normalizeListResponse<T>(response: PublicListResponse<T>): T[] {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.data)) return response.data;
  return [];
}

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedBase}/${normalizedPath}`;
}

export function resolveFileUrl(file?: FileType | string | null): string | null {
  if (!file) return null;

  if (typeof file === "string") {
    const value = file.trim();
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("//")) return `https:${value}`;
    return joinUrl(API_BASE_URL, value);
  }

  const candidates = [
    file.url,
    file.path,
    file.publicUrl,
    file.public_url,
    file.secureUrl,
    file.secure_url,
    file.location,
  ];

  const value = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0
  );

  if (!value) return null;

  const trimmedValue = value.trim();
  if (/^https?:\/\//i.test(trimmedValue)) return trimmedValue;
  if (trimmedValue.startsWith("//")) return `https:${trimmedValue}`;

  return joinUrl(API_BASE_URL, trimmedValue);
}

export function pickLocalizedTitle(
  item: { title?: string | null; titleVi?: string | null },
  locale?: string
): string {
  if (locale === "vi") return item.titleVi || item.title || "";
  return item.title || item.titleVi || "";
}

// ===== Generic fetcher =====

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
  revalidate: number = 60
): Promise<T> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.filters) params.set("filters", options.filters);
  if (options.orderBy) params.set("orderBy", options.orderBy);
  if (options.order) params.set("order", options.order);
  if (options.type) params.set("type", options.type);
  if (options.url) params.set("url", options.url);
  if (options.blogId) params.set("blogId", options.blogId);
  if (options.lang) params.set("language", options.lang);

  const queryString = params.toString();
  const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ""}`;

  const headers: Record<string, string> = {};
  if (options.lang) {
    headers["x-custom-lang"] = options.lang;
  }

  const res = await fetch(url, {
    headers,
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ===== API functions =====

async function getPublicLandingList<T>(
  endpoint: string,
  options: FetchOptions,
  revalidate: number
): Promise<T[]> {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const versionedEndpoint = `/api/v1${normalizedEndpoint}`;

  try {
    const response = await apiFetch<PublicListResponse<T>>(
      normalizedEndpoint,
      options,
      revalidate
    );
    return normalizeListResponse(response);
  } catch (primaryError) {
    try {
      const response = await apiFetch<PublicListResponse<T>>(
        versionedEndpoint,
        options,
        revalidate
      );
      return normalizeListResponse(response);
    } catch (fallbackError) {
      console.warn(
        `Failed to fetch public landing endpoint ${normalizedEndpoint}:`,
        fallbackError,
        "Primary endpoint error:",
        primaryError
      );
      return [];
    }
  }
}

export async function getHeroBanners(
  options: FetchOptions = {}
): Promise<HeroBanner[]> {
  return getPublicLandingList<HeroBanner>(
    "/api/v1/hero-banners",
    { limit: 6, ...options },
    300
  );
}

export async function getFooters(
  options: FetchOptions = {}
): Promise<Footer[]> {
  return getPublicLandingList<Footer>(
    "/api/v1/footers",
    { limit: 100, ...options },
    300
  );
}

export async function getTopBars(
  options: FetchOptions = {}
): Promise<TopBar[]> {
  return getPublicLandingList<TopBar>(
    "/api/v1/top-bars",
    { limit: 10, ...options },
    300
  );
}

/** A third-party snippet injected on every page, managed from the CMS (#075). */
export interface SiteScript {
  id: string;
  name: string;
  content: string;
  placement: string;
  isActive: boolean;
  sortOrder: number;
}

/** Active snippets grouped by where they belong in the document. */
export interface SiteScriptsByPlacement {
  head?: SiteScript[];
  bodyEnd?: SiteScript[];
}

/**
 * The site-wide scripts (#075).
 *
 * Analytics has to be on every page, and before this it could only be attached to
 * one page at a time through the SEO record. Returns `{}` on failure: a page must
 * still render when the API is down, and losing a pageview beats losing the page.
 */
export async function getSiteScripts(): Promise<SiteScriptsByPlacement> {
  try {
    return await apiFetch<SiteScriptsByPlacement>(
      "/api/v1/site-scripts/active",
      {},
      300
    );
  } catch {
    return {};
  }
}

/** One card in a mega-menu "Explore" carousel, managed from the CMS (#073). */
export interface MenuSlide {
  id: string;
  menuKey: string;
  title: string;
  description: string;
  href: string;
  image: string;
  imageAlt?: string | null;
  language: string;
  sortOrder: number;
  isActive: boolean;
}

/** The four mega-menu panels, each with its slides in display order. */
export type GroupedMenuSlides = Record<string, MenuSlide[]>;

/**
 * Slides for every mega-menu panel in one request (#073).
 *
 * Returns `{}` rather than throwing when the API is unreachable: the navbar is on
 * every page, and a menu that renders its built-in cards is better than a page
 * that fails to render at all.
 */
export async function getMenuSlides(
  options: FetchOptions = {}
): Promise<GroupedMenuSlides> {
  try {
    return await apiFetch<GroupedMenuSlides>(
      "/api/v1/menu-slides/grouped",
      options,
      300
    );
  } catch {
    return {};
  }
}

export async function getDestinations(
  options: FetchOptions = {}
): Promise<PaginatedResponse<Destination>> {
  return apiFetch<PaginatedResponse<Destination>>(
    "/api/v1/destinations",
    { limit: 100, ...options },
    300 // cache for 5 minutes
  );
}

export async function searchDestinations(
  query: string,
  limit: number = 10
): Promise<Destination[]> {
  try {
    const result = await getDestinations({
      filters: JSON.stringify({ keySearch: { $contL: query } }),
      limit,
    });
    return result.data.filter((d) => d.isActive);
  } catch {
    return [];
  }
}

export async function getFaqs(
  options: FetchOptions & { urls?: string[] } = {}
): Promise<PaginatedResponse<Faq>> {
  const { urls, ...rest } = options;

  if (urls && urls.length > 0) {
    const results = await Promise.all(
      urls.map((u) =>
        apiFetch<PaginatedResponse<Faq>>(
          "/api/v1/faqs/by-context",
          { ...rest, url: u },
          300
        ).catch(() => ({ data: [], hasNextPage: false }) as PaginatedResponse<Faq>)
      )
    );
    // Priority, not union — same rule as the client hook: a page with its own
    // FAQs must not also show the blanket ones (#053).
    return { data: pickContextFaqs(results), hasNextPage: false };
  }

  return apiFetch<PaginatedResponse<Faq>>(
    "/api/v1/faqs/by-context",
    options,
    300
  );
}

export async function getWhyChooseUs(
  options: FetchOptions = {}
): Promise<PaginatedResponse<WhyChooseUs>> {
  return apiFetch<PaginatedResponse<WhyChooseUs>>(
    "/api/v1/why-choose-us",
    { limit: 6, ...options },
    300
  );
}

export async function getBlogs(
  options: FetchOptions = {}
): Promise<PaginatedResponse<Blog>> {
  return apiFetch<PaginatedResponse<Blog>>(
    "/api/v1/blogs",
    { limit: 10, ...options },
    120
  );
}

export async function getBlogCategories(
  lang?: string
): Promise<string[]> {
  const headers: Record<string, string> = {};
  if (lang) headers["x-custom-lang"] = lang;

  const url = `${API_BASE_URL}/api/v1/blogs/categories`;
  const res = await fetch(url, {
    headers,
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getBlogParentsByCategory(
  lang?: string
): Promise<Record<string, string[]>> {
  const headers: Record<string, string> = {};
  if (lang) headers["x-custom-lang"] = lang;

  const url = `${API_BASE_URL}/api/v1/blogs/parents`;
  const res = await fetch(url, {
    headers,
    next: { revalidate: 300 },
  });

  if (!res.ok) return {};
  return res.json();
}

export async function getBlogsByCategory(
  category: string,
  options: FetchOptions = {}
): Promise<PaginatedResponse<Blog>> {
  return apiFetch<PaginatedResponse<Blog>>(
    "/api/v1/blogs",
    {
      limit: 6,
      ...options,
      filters: JSON.stringify({ category }),
    },
    120
  );
}

export async function getBlogsByCategoryAndParent(
  category: string,
  parent: string,
  options: FetchOptions = {}
): Promise<PaginatedResponse<Blog>> {
  return apiFetch<PaginatedResponse<Blog>>(
    "/api/v1/blogs",
    {
      limit: 10,
      ...options,
      filters: JSON.stringify({ category, parent }),
    },
    120
  );
}

export async function getBlogsByAuthor(
  authorSlug: string,
  options: FetchOptions = {}
): Promise<PaginatedResponse<Blog>> {
  return apiFetch<PaginatedResponse<Blog>>(
    "/api/v1/blogs",
    {
      limit: 20,
      ...options,
      filters: JSON.stringify({ authorSlug }),
    },
    120
  );
}

export async function getBlogAuthor(authorSlug: string): Promise<BlogAuthor | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/blogs/authors/${encodeURIComponent(authorSlug)}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getBlogById(
  id: string,
  lang?: string
): Promise<Blog> {
  const url = `${API_BASE_URL}/api/v1/blogs/${id}`;
  const headers: Record<string, string> = {};
  if (lang) headers["x-custom-lang"] = lang;

  const res = await fetch(url, {
    headers,
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getBlogBySlug(
  slug: string,
  lang?: string
): Promise<Blog | null> {
  try {
    const url = `${API_BASE_URL}/api/v1/blogs/by-slug/${encodeURIComponent(slug)}`;
    const headers: Record<string, string> = {};
    if (lang) headers["x-custom-lang"] = lang;

    const res = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getSupportedDevices(
  search?: string,
  lang?: string
): Promise<SupportedDevicesResponse> {
  try {
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/v1/supported-devices/grouped${queryString ? `?${queryString}` : ""}`;

    const headers: Record<string, string> = {};
    if (lang) {
      headers["x-custom-lang"] = lang;
    }

    const res = await fetch(url, {
      headers,
      next: { revalidate: 300 }, // cache for 5 minutes
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.warn("Failed to fetch supported devices, using mock data:", error);
    return mockSupportedDevices;
  }
}

// ===== Plans API =====

export async function getPlans(
  options: FetchOptions = {}
): Promise<PaginatedResponse<Plan>> {
  return apiFetch<PaginatedResponse<Plan>>(
    "/api/v1/plans",
    { limit: 50, ...options },
    300
  );
}

export async function getPlansByDestination(
  destinationId: number,
  lang?: string
): Promise<PaginatedResponse<Plan>> {
  return getPlans({
    filters: JSON.stringify({ destinationId, isActive: true }),
    lang,
  });
}

/**
 * Server-side: fetch categorized plans by destination slug.
 * Returns the same shape as the client-side usePlansBySlug hook.
 * The raw payload is normalized (e.g. `SmsCallEsim` → `smsCallEsim`) so the
 * SMS/Call category tab renders when the backend returns such plans.
 */
export async function getPlansByDestinationSlug(
  slug: string,
  lang?: string
): Promise<PlansByDestinationResponse | null> {
  try {
    const raw = await apiFetch<PlansByDestinationResponse>(
      `/api/v1/plans/by-destination/${encodeURIComponent(slug)}`,
      { lang },
      300
    );
    return normalizePlansByDestination(raw);
  } catch {
    return null;
  }
}

/**
 * Server-side: fetch categorized plans by region slug.
 * Returns the same shape as the client-side usePlansByRegionSlug hook.
 * The raw payload is normalized (e.g. `SmsCallEsim` → `smsCallEsim`) so the
 * SMS/Call category tab renders when the backend returns such plans.
 */
export async function getPlansByRegionSlug(
  slug: string,
  lang?: string
): Promise<PlansByDestinationResponse | null> {
  try {
    const raw = await apiFetch<PlansByDestinationResponse>(
      `/api/v1/plans/by-region/${encodeURIComponent(slug)}`,
      { lang },
      300
    );
    return normalizePlansByDestination(raw);
  } catch {
    return null;
  }
}

/**
 * A domestic carrier for the "eSIM nội địa" tab, grouped from `isDomesticEsim`
 * plans. Viettel is NOT one of these: it only sells travel eSIMs, which list
 * under Quốc gia → Việt Nam.
 * `fromVndPrice` is the cheapest plan price so the card can show "Từ {n}đ".
 */
export interface LocalCarrier {
  provider: string;
  fromVndPrice: number;
  planCount: number;
}

/**
 * Server-side: list domestic eSIM carriers (grouped from local-inventory plans).
 * Returns [] on error so the tab renders an empty state instead of throwing.
 */
export async function getLocalCarriers(): Promise<LocalCarrier[]> {
  try {
    return await apiFetch<LocalCarrier[]>(
      "/api/v1/plans/local-carriers",
      {},
      300
    );
  } catch {
    return [];
  }
}

/**
 * Server-side: fetch categorized domestic plans for one carrier slug.
 * Same grouped shape as getPlansByDestinationSlug (normalized casing).
 */
export async function getLocalPlansByCarrier(
  carrier: string,
  lang?: string
): Promise<PlansByDestinationResponse | null> {
  try {
    const raw = await apiFetch<PlansByDestinationResponse>(
      `/api/v1/plans/local/${encodeURIComponent(carrier)}`,
      { lang },
      300
    );
    return normalizePlansByDestination(raw);
  } catch {
    return null;
  }
}

export async function getDestinationBySlug(
  slug: string,
  lang?: string
): Promise<Destination | null> {
  try {
    return await apiFetch<Destination>(
      `/api/v1/destinations/slug/${encodeURIComponent(slug)}`,
      { lang },
      300
    );
  } catch {
    return null;
  }
}

// ===== Regions API =====

export async function getRegions(
  options: FetchOptions = {}
): Promise<PaginatedResponse<Region>> {
  return apiFetch<PaginatedResponse<Region>>(
    "/api/v1/regions",
    { limit: 100, ...options },
    300
  );
}

export async function getRegionBySlug(
  slug: string,
  lang?: string
): Promise<Region | null> {
  try {
    return await apiFetch<Region>(
      `/api/v1/regions/slug/${encodeURIComponent(slug)}`,
      { lang },
      300
    );
  } catch {
    return null;
  }
}

// Client-side search for supported devices (no next.revalidate, works in browser)
export async function searchSupportedDevices(
  search: string,
  lang?: string
): Promise<SupportedDevicesResponse> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/v1/supported-devices/grouped${queryString ? `?${queryString}` : ""}`;

  const headers: Record<string, string> = {};
  if (lang) {
    headers["x-custom-lang"] = lang;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ===== Coupon Types =====

export interface Coupon {
  id: number;
  code: string;
  discountPercent: number;
  maxUsage: number;
  maxUsagePerUser: number;
  usageCount: number;
  minOrderAmount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ===== Coupon API =====

export async function getCoupons(
  options: FetchOptions = {}
): Promise<PaginatedResponse<Coupon>> {
  return apiFetch<PaginatedResponse<Coupon>>(
    "/api/v1/coupons",
    { limit: 20, ...options },
    120 // cache for 2 minutes
  );
}

// ===== Help Center Types =====

export interface HelpCenterArticle {
  id: string;
  /** Canonical slug from the CMS used for the article URL. */
  slug: string;
  title: string;
  content: string;
  order: number;
  category: string;
  parent: string;
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===== SEO Config Types =====

export interface SeoConfig {
  id: number;
  url: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  structuredData: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ===== SEO Config API =====

export async function fetchSeoConfigByUrl(
  url: string | string[],
  options: { revalidate?: number } = {}
): Promise<SeoConfig | null> {
  const urls = Array.isArray(url) ? url : [url];

  // Not cached by default: with `revalidate: 300` an edit saved in the CMS was
  // still missing from the live <title> well past five minutes (confirmed on
  // beta with the database and API already updated). SEO is the one thing an
  // admin edits and expects to see; it is a single indexed row.
  // Statically generated pages must pass `revalidate`: an uncached fetch there
  // is dynamic usage, which Next raises as an error — the catch below swallows
  // it and every such page answered 500 instead (#L021).
  const cacheOptions: RequestInit =
    options.revalidate === undefined
      ? { cache: "no-store" }
      : { next: { revalidate: options.revalidate } };

  for (const u of urls) {
    try {
      const encodedUrl = encodeURIComponent(u);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/seo-configs/by-url?url=${encodedUrl}`,
        cacheOptions
      );
      if (!res.ok) continue;
      const data: SeoConfig = await res.json();
      if (data.isActive) return data;
    } catch {
      continue;
    }
  }
  return null;
}

export interface HelpCenterResponse {
  data: HelpCenterArticle[];
  hasNextPage: boolean;
}

// ===== Help Center API =====

export async function fetchHelpCenterArticles(lang?: string): Promise<HelpCenterResponse> {
  const headers: Record<string, string> = {};
  if (lang) {
    headers["x-custom-lang"] = lang;
  }
  const res = await fetch(`${API_BASE_URL}/api/v1/help-center?limit=100`, {
    headers,
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch popular help-center articles (server-side filter via `isPopular=true`).
 * Used for the "Related articles" block at the bottom of an article detail page.
 */
export async function fetchPopularHelpCenterArticles(
  lang?: string,
  limit = 6
): Promise<HelpCenterResponse> {
  const headers: Record<string, string> = {};
  if (lang) {
    headers["x-custom-lang"] = lang;
  }
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/help-center?isPopular=true&limit=${limit}`,
      {
        headers,
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) {
      return { data: [], hasNextPage: false };
    }
    return res.json();
  } catch {
    return { data: [], hasNextPage: false };
  }
}

export async function fetchHelpCenterBySlug(slug: string, lang?: string): Promise<HelpCenterArticle | null> {
  const headers: Record<string, string> = {};
  if (lang) {
    headers["x-custom-lang"] = lang;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/help-center/by-slug/${encodeURIComponent(slug)}`, {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function searchHelpCenterArticles(keyword: string, lang?: string, page = 1, limit = 10): Promise<HelpCenterResponse> {
  const headers: Record<string, string> = {};
  if (lang) {
    headers["x-custom-lang"] = lang;
  }
  const params = new URLSearchParams({
    q: keyword,
    page: String(page),
    limit: String(limit),
  });
  if (lang) {
    params.set("language", lang);
  }
  const res = await fetch(
    `${API_BASE_URL}/api/v1/help-center/search?${params.toString()}`,
    { headers, next: { revalidate: 0 } }
  );
  if (!res.ok) {
    return { data: [], hasNextPage: false };
  }
  return res.json();
}
