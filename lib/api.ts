// API base URL - configure via environment variable
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

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
