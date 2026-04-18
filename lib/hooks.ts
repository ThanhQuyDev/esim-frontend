import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Destination,
  Faq,
  WhyChooseUs,
  Blog,
  Plan,
  PaginatedResponse,
} from "./api";
import type { Locale } from "./i18n-config";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

// ===== Generic fetcher for client-side with AbortController =====

async function clientFetch<T>(
  endpoint: string,
  params?: Record<string, string>,
  headers?: Record<string, string>,
  signal?: AbortSignal
): Promise<T> {
  const searchParams = new URLSearchParams(params);
  const url = `${API_BASE_URL}${endpoint}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const res = await fetch(url, { headers, signal });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ===== Query Keys =====

export const queryKeys = {
  destinations: {
    all: ["destinations"] as const,
    list: (filters?: string) => ["destinations", "list", filters] as const,
    search: (query: string) => ["destinations", "search", query] as const,
    top: ["destinations", "top"] as const,
    detail: (id: string) => ["destinations", "detail", id] as const,
  },
  regions: {
    all: ["regions"] as const,
    list: (filters?: string) => ["regions", "list", filters] as const,
  },
  plans: {
    all: ["plans"] as const,
    byDestination: (destinationId: number) => ["plans", "destination", destinationId] as const,
  },
  exchangeRate: {
    usdToVnd: ["exchangeRate", "USD", "VND"] as const,
  },
  faqs: {
    all: ["faqs"] as const,
    list: (lang: string) => ["faqs", "list", lang] as const,
  },
  whyChooseUs: {
    all: ["whyChooseUs"] as const,
    list: (lang: string) => ["whyChooseUs", "list", lang] as const,
  },
  blogs: {
    all: ["blogs"] as const,
    list: (lang: string) => ["blogs", "list", lang] as const,
    detail: (id: string) => ["blogs", "detail", id] as const,
  },
};

// ===== Destination Hooks =====

export function useTopDestinations(limit = 10) {
  return useQuery({
    queryKey: queryKeys.destinations.top,
    queryFn: ({ signal }) =>
      clientFetch<PaginatedResponse<Destination>>(
        "/api/v1/destinations",
        {
          limit: String(limit),
          filters: JSON.stringify({ isPopular: true }),
          orderBy: "name",
          order: "ASC",
        },
        undefined,
        signal
      ),
    select: (data) => data.data.filter((d) => d.isActive).slice(0, limit),
  });
}

export function useSearchDestinations(query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.destinations.search(query),
    queryFn: ({ signal }) =>
      clientFetch<PaginatedResponse<Destination>>(
        "/api/v1/destinations",
        {
          limit: "20",
          filters: JSON.stringify({ search: query }),
        },
        undefined,
        signal
      ),
    select: (data) => data.data.filter((d) => d.isActive),
    enabled: enabled && query.trim().length > 0,
  });
}

export function useDestinations(
  filters?: string,
  orderBy?: string,
  order?: string,
  limit?: number
) {
  return useQuery({
    queryKey: queryKeys.destinations.list(filters),
    queryFn: ({ signal }) =>
      clientFetch<PaginatedResponse<Destination>>(
        "/api/v1/destinations",
        {
          limit: String(limit || 100),
          ...(filters && { filters }),
          ...(orderBy && { orderBy }),
          ...(order && { order }),
        },
        undefined,
        signal
      ),
    select: (data) => data.data.filter((d) => d.isActive),
  });
}

// ===== Region Interface & Hooks =====

export interface Region {
  id: number;
  name: string;
  slug: string;
  avatarUrl: string;
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  destinationCount: number;
}

export function useRegions(
  filters?: string,
  orderBy?: string,
  order?: string,
  limit?: number
) {
  return useQuery({
    queryKey: queryKeys.regions.list(filters),
    queryFn: ({ signal }) =>
      clientFetch<PaginatedResponse<Region>>(
        "/api/v1/regions",
        {
          limit: String(limit || 100),
          ...(filters && { filters }),
          ...(orderBy && { orderBy }),
          ...(order && { order }),
        },
        undefined,
        signal
      ),
    select: (data) => data.data.filter((r) => r.isActive),
  });
}

export function useSearchRegions(query: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.regions.all, "search", query],
    queryFn: ({ signal }) =>
      clientFetch<PaginatedResponse<Region>>(
        "/api/v1/regions",
        {
          limit: "20",
          filters: JSON.stringify({ search: query }),
        },
        undefined,
        signal
      ),
    select: (data) => data.data.filter((r) => r.isActive),
    enabled: enabled && query.trim().length > 0,
  });
}

// ===== FAQ Hooks =====

export function useFaqs(lang: Locale = "en") {
  return useQuery({
    queryKey: queryKeys.faqs.list(lang),
    queryFn: ({ signal }) =>
      clientFetch<PaginatedResponse<Faq>>(
        "/api/v1/faqs",
        { limit: "20", page: "1" },
        { "x-custom-lang": lang },
        signal
      ),
    select: (data) =>
      data.data
        .filter((f) => f.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
  });
}

// ===== Plans Hooks =====

export function usePlansByDestination(destinationId: number, lang?: string) {
  return useQuery({
    queryKey: queryKeys.plans.byDestination(destinationId),
    queryFn: ({ signal }) =>
      clientFetch<PaginatedResponse<Plan>>(
        "/api/v1/plans",
        {
          limit: "50",
          filters: JSON.stringify({ destinationId, isActive: true }),
        },
        lang ? { "x-custom-lang": lang } : undefined,
        signal
      ),
    select: (data) => data.data.filter((p) => p.isActive),
    enabled: destinationId > 0,
  });
}

// ===== Exchange Rate Hook =====

interface ExchangeRateResponse {
  result: string;
  conversion_rates: Record<string, number>;
}

const FALLBACK_USD_VND_RATE = 25_500;

/**
 * Fetches live USD → VND exchange rate from ExchangeRate-API (free, no key).
 * Falls back to a hardcoded rate if the API is unreachable.
 * Cached for 1 hour via staleTime.
 */
export function useExchangeRate() {
  return useQuery({
    queryKey: queryKeys.exchangeRate.usdToVnd,
    queryFn: async ({ signal }) => {
      try {
        const res = await fetch(
          "https://open.er-api.com/v6/latest/USD",
          { signal }
        );
        if (!res.ok) return FALLBACK_USD_VND_RATE;
        const data: ExchangeRateResponse = await res.json();
        return data.conversion_rates?.VND ?? FALLBACK_USD_VND_RATE;
      } catch {
        return FALLBACK_USD_VND_RATE;
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: 2,
  });
}

/**
 * Convert a USD amount to VND using the live rate, rounded to nearest 1000₫.
 */
export function convertUsdToVnd(usdAmount: number, rate: number): number {
  return Math.round((usdAmount * rate) / 1000) * 1000;
}

/**
 * Format a VND amount: "125.000₫"
 */
export function formatVnd(amount: number): string {
  return amount.toLocaleString("vi-VN") + "₫";
}

// ===== Why Choose Us Hooks =====

export function useWhyChooseUs(lang: Locale = "en") {
  return useQuery({
    queryKey: queryKeys.whyChooseUs.list(lang),
    queryFn: ({ signal }) =>
      clientFetch<PaginatedResponse<WhyChooseUs>>(
        "/api/v1/why-choose-us",
        { limit: "20", page: "1" },
        { "x-custom-lang": lang },
        signal
      ),
    select: (data) =>
      data.data
        .filter((item) => item.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
  });
}

// ===== Blog Hooks =====

export function useBlogs(lang: Locale = "en", limit = 6) {
  return useQuery({
    queryKey: queryKeys.blogs.list(lang),
    queryFn: ({ signal }) =>
      clientFetch<PaginatedResponse<Blog>>(
        "/api/v1/blogs",
        { limit: String(limit), page: "1" },
        { "x-custom-lang": lang },
        signal
      ),
    select: (data) => data.data.filter((b) => b.isPublished),
  });
}

// ===== Mutation Examples =====
// These are ready-to-use patterns for admin/CMS operations

export function useCreateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newFaq: {
      language: string;
      question: string;
      answer: string;
      sortOrder: number;
    }) => {
      const res = await fetch(`${API_BASE_URL}/api/v1/faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFaq),
      });
      if (!res.ok) throw new Error("Failed to create FAQ");
      return res.json() as Promise<Faq>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
    },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ question: string; answer: string; sortOrder: number; isActive: boolean }>;
    }) => {
      const res = await fetch(`${API_BASE_URL}/api/v1/faqs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update FAQ");
      return res.json() as Promise<Faq>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/v1/faqs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete FAQ");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
    },
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newBlog: {
      language: string;
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
      coverImage?: string;
      author?: string;
      tags?: string;
    }) => {
      const res = await fetch(`${API_BASE_URL}/api/v1/blogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBlog),
      });
      if (!res.ok) throw new Error("Failed to create blog");
      return res.json() as Promise<Blog>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
    },
  });
}

export function useCreateWhyChooseUs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      language: string;
      title: string;
      description: string;
      icon?: string;
      sortOrder: number;
    }) => {
      const res = await fetch(`${API_BASE_URL}/api/v1/why-choose-us`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create item");
      return res.json() as Promise<WhyChooseUs>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.whyChooseUs.all });
    },
  });
}

// ===== Order & Payment Hooks =====

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  paymentMethod?: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  userId: number;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status?: string;
  paymentMethod?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  planId: number;
  planPriceId: number;
  price: number;
  currency: string;
  quantity: number;
}

export interface CreateOrderItemInput {
  orderId: number;
  planId: number;
  planPriceId: number;
  price: number;
  currency: string;
  quantity?: number;
}

export const orderQueryKeys = {
  all: ["orders"] as const,
  detail: (id: string) => ["orders", id] as const,
  items: (orderId: string) => ["orders", orderId, "items"] as const,
};

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create order");
      return res.json() as Promise<Order>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.all });
    },
  });
}

export function useCreateOrderItem() {
  return useMutation({
    mutationFn: async (input: CreateOrderItemInput) => {
      const res = await fetch(`${API_BASE_URL}/api/v1/order-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create order item");
      return res.json() as Promise<OrderItem>;
    },
  });
}

/**
 * Full checkout flow:
 * 1. Create order via backend API
 * 2. Create order item(s)
 * 3. Request OnePay payment URL from our Next.js API route
 * 4. Redirect user to OnePay
 */
export function useCheckout() {
  const createOrder = useCreateOrder();
  const createOrderItem = useCreateOrderItem();

  return useMutation({
    mutationFn: async (input: {
      userId: number;
      planId: number;
      planPriceId: number;
      price: number;
      currency: string;
      locale?: string;
    }) => {
      // Step 1: Create order
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const order = await createOrder.mutateAsync({
        userId: input.userId,
        orderNumber,
        totalAmount: input.price,
        currency: input.currency,
        status: "pending",
        paymentMethod: "onepay",
      });

      // Step 2: Create order item
      await createOrderItem.mutateAsync({
        orderId: order.id,
        planId: input.planId,
        planPriceId: input.planPriceId,
        price: input.price,
        currency: input.currency,
        quantity: 1,
      });

      // Step 3: Get OnePay payment URL
      const paymentRes = await fetch("/api/payment/create-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          amount: input.price,
          orderInfo: `Saily eSIM - Order ${orderNumber}`,
          locale: input.locale || "en",
        }),
      });

      if (!paymentRes.ok) throw new Error("Failed to create payment URL");
      const { paymentUrl } = await paymentRes.json();

      // Step 4: Redirect to OnePay
      window.location.href = paymentUrl;

      return { order, paymentUrl };
    },
  });
}
