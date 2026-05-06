import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type {
  Destination,
  Faq,
  WhyChooseUs,
  Blog,
  Plan,
  Region,
  PaginatedResponse,
  PlansByDestinationResponse,
} from "./api";
import type { Locale } from "./i18n-config";
import { useAuth } from "./auth";
import {
  getCart as getLocalCart,
  addToCart as addToLocalCart,
  updateQuantity as updateLocalQuantity,
  removeFromCart as removeFromLocalCart,
  clearCart as clearLocalCart,
  type CartItem,
  type Cart,
} from "./cart";

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

// ===== Infinite Destinations Hook (for all-destinations page) =====

const DESTINATIONS_PAGE_SIZE = 20;

export function useInfiniteDestinations(
  tab: "all" | "country" | "region" | "ultra",
  search?: string
) {
  const isRegion = tab === "region";
  const endpoint = isRegion ? "/api/v1/regions" : "/api/v1/destinations";

  return useInfiniteQuery({
    queryKey: [
      "destinations",
      "infinite",
      tab,
      search,
    ],
    queryFn: async ({ pageParam = 1, signal }) => {
      const params: Record<string, string> = {
        page: String(pageParam),
        limit: String(DESTINATIONS_PAGE_SIZE),
        orderBy: "name",
        order: "ASC",
      };
      if (search && search.trim()) {
        params.filters = JSON.stringify({ search: search.trim() });
      }
      return clientFetch<PaginatedResponse<Destination>>(
        endpoint,
        params,
        undefined,
        signal
      );
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasNextPage ? lastPageParam + 1 : undefined,
    select: (data) => ({
      pages: data.pages.map((page) => ({
        ...page,
        data: page.data.filter((d: any) => d.isActive),
      })),
      pageParams: data.pageParams,
    }),
  });
}

// ===== Region Hooks =====

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

export function useRegionBySlug(slug: string, lang?: string) {
  return useQuery({
    queryKey: [...queryKeys.regions.all, "detail", slug],
    queryFn: ({ signal }) =>
      clientFetch<Region>(
        `/api/v1/regions/slug/${encodeURIComponent(slug)}`,
        undefined,
        lang ? { "x-custom-lang": lang } : undefined,
        signal
      ),
    enabled: slug.length > 0,
  });
}

export function useDestinationBySlug(slug: string, lang?: string) {
  return useQuery({
    queryKey: [...queryKeys.destinations.all, "detail", slug],
    queryFn: ({ signal }) =>
      clientFetch<Destination>(
        `/api/v1/destinations/slug/${encodeURIComponent(slug)}`,
        undefined,
        lang ? { "x-custom-lang": lang } : undefined,
        signal
      ),
    enabled: slug.length > 0,
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

export function useFaqs(lang: Locale = "en", initialData?: Faq[]) {
  return useQuery({
    queryKey: queryKeys.faqs.list(lang),
    queryFn: ({ signal }) =>
      clientFetch<PaginatedResponse<Faq>>(
        "/api/v1/faqs",
        { limit: "20", page: "1" },
        { "x-custom-lang": lang },
        signal
      ),
    initialData: initialData
      ? { data: initialData, hasNextPage: false }
      : undefined,
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

export function usePlansBySlug(slug: string, lang?: string, initialData?: PlansByDestinationResponse) {
  return useQuery({
    queryKey: [...queryKeys.plans.all, "byDestination", slug || "initial"],
    queryFn: ({ signal }) =>
      clientFetch<PlansByDestinationResponse>(
        `/api/v1/plans/by-destination/${encodeURIComponent(slug)}`,
        undefined,
        lang ? { "x-custom-lang": lang } : undefined,
        signal
      ),
    enabled: slug.length > 0,
    ...(initialData ? { initialData, staleTime: 5 * 60 * 1000 } : {}),
  });
}

export function usePlansByRegionSlug(slug: string, lang?: string, initialData?: PlansByDestinationResponse) {
  return useQuery({
    queryKey: [...queryKeys.plans.all, "byRegion", slug || "initial"],
    queryFn: ({ signal }) =>
      clientFetch<PlansByDestinationResponse>(
        `/api/v1/plans/by-region/${encodeURIComponent(slug)}`,
        undefined,
        lang ? { "x-custom-lang": lang } : undefined,
        signal
      ),
    enabled: slug.length > 0,
    ...(initialData ? { initialData, staleTime: 5 * 60 * 1000 } : {}),
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
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/v1/orders`, {
        method: "POST",
        headers,
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
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateOrderItemInput) => {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/v1/order-items`, {
        method: "POST",
        headers,
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create order item");
      return res.json() as Promise<OrderItem>;
    },
  });
}

// ===== Payment Types =====

export interface CheckoutPayload {
  token?: string;
  paymentMethod: string;
  paymentId: string;
  currency: string;
  items: { planId: number; quantity: number }[];
  couponCode: string;
}

export interface CheckoutResponse {
  paymentUrl: string;
  orderNumber: string;
}

export interface EsimInfo {
  id: number;
  orderItemId: number;
  userId: number;
  iccid: string;
  smdpAddress: string;
  activationCode: string;
  lpa: string;
  matchId: string;
  qrcode: string;
  directAppleInstallationUrl: string;
  apnValue: string;
  isRoaming: boolean;
  status: string;
  dataUsed: string;
  dataTotal: string;
  expiresAt: Record<string, unknown> | string | null;
  activatedAt: Record<string, unknown> | string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface OrderItemPlan {
  id: number;
  name: string;
  slug: string;
  durationDays: number;
  dataMb: number;
  price: string;
  vndPrice: number;
  currency: string;
  speed?: string;
  operatorName?: string;
  countryCode?: string;
}

export interface OrderItem {
  id: number;
  planId: number;
  plan?: OrderItemPlan;
  orderRequestId: string;
  status: string;
  vndPrice: number;
  quantity: number;
  esims: EsimInfo[];
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  status: string;
  vndPrice: number;
  paymentMethod: string;
  couponCode: string;
  items: OrderItem[];
  createdAt: string;
}

// ===== Payment Checkout Mutation =====

export function useCheckout() {
  return useMutation({
    mutationFn: async (payload: CheckoutPayload): Promise<CheckoutResponse> => {
      const { token, ...body } = payload;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/payment/plan/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Checkout failed: ${res.status}`);
      }

      return res.json();
    },
  });
}

// ===== Order by Number Query =====

export function useOrderByNumber(orderNumber: string, enabled: boolean) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["order-by-number", orderNumber],
    queryFn: async ({ signal }): Promise<OrderResponse> => {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/my/by-number/${orderNumber}`,
        { headers, signal }
      );
      if (!res.ok) throw new Error(`Failed to fetch order: ${res.status}`);
      return res.json();
    },
    enabled: enabled && !!orderNumber && !!token,
    refetchInterval: (query) => {
      // Stop polling once we have eSIM data in any item
      const data = query.state.data;
      if (data?.items?.some((item) => item.esims && item.esims.length > 0)) {
        return false;
      }
      return 5000; // Poll every 5s
    },
    refetchIntervalInBackground: false,
    retry: 3,
    retryDelay: 2000,
  });
}

// ===== Cart API Types =====

interface ApiCartItemPlan {
  id: number;
  name: string;
  slug: string;
  dataMb: number;
  durationDays: number;
  vndPrice: number;
  currency: string;
  discount?: number;
  destination?: {
    id: number;
    name: string;
    slug: string;
    countryCode: string;
    flagUrl?: string;
  };
}

interface ApiCartItem {
  id: number;
  userId: number;
  planId: number;
  plan: ApiCartItemPlan;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

// ===== Cart API Functions =====

async function fetchApiCart(token: string): Promise<ApiCartItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/carts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch cart: ${res.status}`);
  return res.json();
}

async function addApiCartItem(
  token: string,
  planId: number,
  quantity: number
): Promise<ApiCartItem> {
  const res = await fetch(`${API_BASE_URL}/api/v1/carts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planId, quantity }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to add to cart: ${res.status}`);
  }
  return res.json();
}

async function updateApiCartItem(
  token: string,
  cartItemId: number,
  quantity: number
): Promise<ApiCartItem> {
  const res = await fetch(`${API_BASE_URL}/api/v1/carts/${cartItemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error(`Failed to update cart item: ${res.status}`);
  return res.json();
}

async function deleteApiCartItem(
  token: string,
  cartItemId: number
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/carts/${cartItemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to remove cart item: ${res.status}`);
}

// ===== useCart Hook =====
// When logged in → uses API; when guest → uses localStorage

export function useCart() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const isLoggedIn = !!user && !!token;

  // Fetch cart from API (only when logged in)
  const apiCartQuery = useQuery({
    queryKey: ["cart", "api"],
    queryFn: () => fetchApiCart(token!),
    enabled: isLoggedIn,
  });

  // Convert API cart items to the CartItem shape used by the UI (memoized to prevent re-renders)
  const apiCartItems: CartItem[] = useMemo(
    () =>
      (apiCartQuery.data || []).map((item) => {
        const mb = Number(item.plan?.dataMb || 0);
        const dataLabel = mb >= 1024
          ? `${parseFloat((mb / 1024).toFixed(1))} GB`
          : `${mb} MB`;
        const rawVndPrice = item.plan?.vndPrice || 0;
        const planDiscount = item.plan?.discount;
        const hasDiscount = planDiscount != null && planDiscount > 0;
        const discountedVndPrice = hasDiscount
          ? Math.round(rawVndPrice * (1 - planDiscount! / 100))
          : rawVndPrice;
        return {
          id: String(item.planId),
          name: item.plan?.name || `Plan #${item.planId}`,
          description: `${item.plan?.dataMb ? dataLabel : "?"} / ${item.plan?.durationDays || "?"} days`,
          price: 0,
          quantity: item.quantity,
          destination: item.plan?.destination?.name,
          dataMb: mb,
          durationDays: item.plan?.durationDays,
          flagUrl: item.plan?.destination?.flagUrl,
          vndPrice: discountedVndPrice,
          ...(hasDiscount ? { originalVndPrice: rawVndPrice, discount: planDiscount } : {}),
          _apiId: item.id,
        };
      }),
    [apiCartQuery.data]
  );

  const invalidateApiCart = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["cart", "api"] });
  }, [queryClient]);

  const addItem = useCallback(
    async (item: Omit<CartItem, "quantity">, quantity = 1) => {
      if (isLoggedIn) {
        await addApiCartItem(token!, Number(item.id), quantity);
        invalidateApiCart();
      } else {
        addToLocalCart(item, quantity);
      }
    },
    [isLoggedIn, token, invalidateApiCart]
  );

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      if (isLoggedIn) {
        // Find the API cart item id
        const apiItem = (apiCartQuery.data || []).find(
          (i) => String(i.planId) === itemId
        );
        if (apiItem) {
          await updateApiCartItem(token!, apiItem.id, quantity);
          invalidateApiCart();
        }
      } else {
        updateLocalQuantity(itemId, quantity);
      }
    },
    [isLoggedIn, token, apiCartQuery.data, invalidateApiCart]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      if (isLoggedIn) {
        const apiItem = (apiCartQuery.data || []).find(
          (i) => String(i.planId) === itemId
        );
        if (apiItem) {
          await deleteApiCartItem(token!, apiItem.id);
          invalidateApiCart();
        }
      } else {
        removeFromLocalCart(itemId);
      }
    },
    [isLoggedIn, token, apiCartQuery.data, invalidateApiCart]
  );

  const clear = useCallback(async () => {
    if (isLoggedIn) {
      // Delete all items
      const items = apiCartQuery.data || [];
      await Promise.all(items.map((i) => deleteApiCartItem(token!, i.id)));
      invalidateApiCart();
    } else {
      clearLocalCart();
    }
  }, [isLoggedIn, token, apiCartQuery.data, invalidateApiCart]);

  // For guest: get cart from localStorage
  const getLocalCartData = useCallback((): Cart => {
    return getLocalCart();
  }, []);

  return {
    /** Whether cart data is from API */
    isApiCart: isLoggedIn,
    /** API cart items (raw) */
    apiCartItems,
    /** API cart loading state */
    isLoading: isLoggedIn ? apiCartQuery.isLoading : false,
    /** Get localStorage cart (for guest) */
    getLocalCartData,
    /** Add item to cart */
    addItem,
    /** Update item quantity */
    updateItem,
    /** Remove item from cart */
    removeItem,
    /** Clear all cart items */
    clear,
    /** Refresh API cart */
    refetch: invalidateApiCart,
  };
}

// ===== My Orders =====

export interface MyOrder {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  vndPrice: number;
  paymentMethod: string | null;
  couponCode: string | null;
  discountAmount: number;
  createdAt: string;
}

interface MyOrdersResponse {
  data: MyOrder[];
  hasNextPage: boolean;
}

export function useMyOrders() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["my-orders", token],
    enabled: !!token,
    queryFn: async ({ signal }): Promise<MyOrder[]> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/my/list`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
      const json: MyOrdersResponse = await res.json();
      return json.data;
    },
  });
}

// ===== My eSIMs =====

export interface MyEsim {
  id: number;
  orderItemId: number;
  userId: number;
  iccid: string;
  smdpAddress: string;
  activationCode: string;
  lpa: string;
  matchId: string;
  qrcode: string;
  directAppleInstallationUrl: string;
  apnValue: string;
  isRoaming: boolean;
  status: string;
  dataUsed: string;
  dataTotal: string;
  expiresAt: string | null;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface MyEsimsResponse {
  data: MyEsim[];
  hasNextPage: boolean;
}

// ===== eSIM Data Usage =====

export interface EsimDataUsage {
  remaining: number;   // MB remaining
  total: number;       // MB total
  dataUsed: number;    // MB used
  expiredAt: string | null;
  isUnlimited: boolean;
  status: string;
  lastUpdateTime: string | null;
}

export function useEsimDataUsage(esimId: number | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["esim-data-usage", esimId],
    enabled: !!token && !!esimId,
    queryFn: async ({ signal }): Promise<EsimDataUsage> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/esims/my/${esimId}/data-usage`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      if (!res.ok) throw new Error(`Failed to fetch data usage: ${res.status}`);
      return res.json();
    },
    staleTime: 30_000, // cache for 30s
  });
}

export function useMyEsims() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["my-esims", token],
    enabled: !!token,
    queryFn: async ({ signal }): Promise<MyEsim[]> => {
      const res = await fetch(`${API_BASE_URL}/api/v1/esims/my/list`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      if (!res.ok) throw new Error(`Failed to fetch eSIMs: ${res.status}`);
      const json: MyEsimsResponse = await res.json();
      return json.data;
    },
  });
}
