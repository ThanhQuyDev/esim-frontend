// API base URL - configure via environment variable
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

import { mockSupportedDevices } from "./mock-supported-devices";

// ===== Types =====

export interface Destination {
  id: number;
  name: string;
  slug: string;
  countryCode: string;
  parentId?: number;
  flagUrl?: string;
  avatarUrl?: string;
  keySearch?: string;
  isPopular: boolean;
  isActive: boolean;
  description?: string;
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

export interface Blog {
  id: string;
  language: string;
  publishedAt: string | null;
  isPublished: boolean;
  author: string | null;
  tags: string | null;
  coverImage: string | null;
  excerpt: string | null;
  content: string;
  slug: string;
  title: string;
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
  destinations?: Destination[];
  destinationCount?: number;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  vndPrice: number;
}

/** Response shape from /api/v1/plans/by-destination/{slug} */
export interface PlansByDestinationResponse {
  dataPlans: Plan[];
  slowUnlimited: Plan[];
  fastUnlimited: Plan[];
  dailyUnlimited: Plan[];
}

export interface PaginatedResponse<T> {
  data: T[];
  hasNextPage: boolean;
}

interface FetchOptions {
  page?: number;
  limit?: number;
  filters?: string;
  orderBy?: string;
  order?: string;
  lang?: string;
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
  options: FetchOptions = {}
): Promise<PaginatedResponse<Faq>> {
  return apiFetch<PaginatedResponse<Faq>>(
    "/api/v1/faqs",
    { limit: 20, ...options },
    300
  );
}

export async function getWhyChooseUs(
  options: FetchOptions = {}
): Promise<PaginatedResponse<WhyChooseUs>> {
  return apiFetch<PaginatedResponse<WhyChooseUs>>(
    "/api/v1/why-choose-us",
    { limit: 20, ...options },
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
