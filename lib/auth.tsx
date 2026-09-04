"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getCart, clearCart } from "@/lib/cart";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

// ===== Auth expiry callback (module-level, set by AuthProvider) =====

let _onAuthExpired: (() => void) | null = null;

/**
 * Register a callback to be invoked when an API call returns 401.
 * Called internally by AuthProvider.
 */
export function setOnAuthExpired(cb: (() => void) | null) {
  _onAuthExpired = cb;
}

/**
 * Drop-in replacement for `fetch()` that:
 * 1. Attaches `Authorization: Bearer <token>` if token is provided
 * 2. On 401 response: triggers logout via the registered callback
 * 3. Otherwise behaves identically to native `fetch()`
 */
export async function authFetch(
  url: string | URL,
  token: string | null | undefined,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers });

  if (res.status === 401 && _onAuthExpired) {
    _onAuthExpired();
  }

  return res;
}

// ===== Types =====

export interface AuthUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  hasPassword?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  /** Send OTP to email (works for both login & register) */
  sendOtp: (email: string) => Promise<void>;
  /** Verify OTP and complete authentication */
  verifyOtp: (email: string, otp: string) => Promise<AuthUser>;
  /** Log in with email + password (fallback when email delivery fails) */
  loginWithPassword: (email: string, password: string) => Promise<AuthUser>;
  /** Log in with a Google ID token */
  loginWithGoogle: (idToken: string) => Promise<AuthUser>;
  /** Set a password for an account that doesn't have one yet */
  setPassword: (password: string) => Promise<void>;
  /** Request a password reset email */
  forgotPassword: (email: string) => Promise<void>;
  logout: () => void;
  /** Opens the auth modal */
  openAuthModal: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

// ===== Context =====

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// ===== Storage helpers =====

const STORAGE_KEY_TOKEN = "esim_auth_token";
const STORAGE_KEY_USER = "esim_auth_user";

function persistAuth(token: string, user: AuthUser) {
  localStorage.setItem(STORAGE_KEY_TOKEN, token);
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}

function clearPersistedAuth() {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USER);
}

function loadPersistedAuth(): { token: string; user: AuthUser } | null {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    if (token && userStr) {
      return { token, user: JSON.parse(userStr) };
    }
  } catch {
    // ignore
  }
  return null;
}

// ===== API calls =====

/**
 * Error carrying the backend's machine-readable error code.
 *
 * The API returns 422 as `{ status, errors: { <field>: "<code>" } }` with no
 * top-level `message`, so reading `body.message` alone always yields
 * undefined. Callers should branch on `code` (e.g. "passwordNotSet") and
 * render their own localized text.
 */
export class AuthError extends Error {
  code: string;
  field: string;

  constructor(code: string, field: string) {
    super(code);
    this.name = "AuthError";
    this.code = code;
    this.field = field;
  }
}

async function throwApiError(res: Response, fallback: string): Promise<never> {
  const body = await res.json().catch(() => ({}));
  const errors = body?.errors;

  if (errors && typeof errors === "object") {
    const [field, code] = Object.entries(errors)[0] ?? [];
    if (typeof code === "string") {
      throw new AuthError(code, field ?? "");
    }
  }

  throw new AuthError(body?.message || `${fallback} (${res.status})`, "");
}

async function apiSendOtp(email: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/email/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    await throwApiError(res, "Failed to send OTP");
  }
}

async function apiLogin(
  path: string,
  payload: Record<string, string>,
  fallback: string
): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    await throwApiError(res, fallback);
  }

  const data = await res.json();
  return {
    token: data.token,
    user: data.user ?? { id: 0, email: payload.email ?? "" },
  };
}

// ===== Provider =====

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const logoutRef = useRef<() => void>(() => {});
  const queryClient = useQueryClient();

  // Hydrate from localStorage on mount
  useEffect(() => {
    const persisted = loadPersistedAuth();
    if (persisted) {
      setToken(persisted.token);
      setUser(persisted.user);
    }
    setIsLoading(false);
  }, []);

  // Register the auth-expired callback so authFetch can trigger logout on 401
  useEffect(() => {
    setOnAuthExpired(() => logoutRef.current());
    return () => setOnAuthExpired(null);
  }, []);

  const sendOtp = useCallback(async (email: string) => {
    await apiSendOtp(email);
  }, []);

  const completeLogin = useCallback(
    async (result: { token: string; user: AuthUser }) => {
      setToken(result.token);
      setUser(result.user);
      persistAuth(result.token, result.user);

      // Sync localStorage cart → API cart after login.
      // IMPORTANT: this must run to completion BEFORE we invalidate the
      // `["cart", "api"]` React Query cache. Otherwise the query would
      // refetch an empty cart (because `setToken` already flipped
      // `isLoggedIn` to true and kicked off a fetch against an empty
      // server cart), and the UI would show an empty cart until a manual
      // page reload. See https://... (cart-empty-after-login bug).
      try {
        const localCart = getCart();
        if (localCart.items.length > 0) {
          await Promise.all(
            localCart.items.map((item) =>
              fetch(`${API_BASE_URL}/api/v1/carts`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${result.token}`,
                },
                body: JSON.stringify({
                  planId: item.planId ?? Number(item.id),
                  quantity: item.quantity,
                  ...(item.durationDays ? { periodNum: item.durationDays } : {}),
                }),
              })
            )
          );
          // Clear localStorage cart after successful sync
          clearCart();
        }
      } catch {
        // Sync failed silently — user can still use the app
      } finally {
        // Force React Query to refetch the API cart now that the sync has
        // finished (or there was nothing to sync). This ensures the cart
        // UI picks up the freshly-populated server cart without needing a
        // manual F5.
        queryClient.invalidateQueries({ queryKey: ["cart", "api"] });
      }

      return result.user;
    },
    [queryClient]
  );

  const verifyOtp = useCallback(
    async (email: string, otp: string) => {
      const result = await apiLogin(
        "/api/v1/auth/email/otp/verify",
        { email, otp },
        "OTP verification failed"
      );
      return completeLogin(result);
    },
    [completeLogin]
  );

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      const result = await apiLogin(
        "/api/v1/auth/email/login",
        { email, password },
        "Login failed"
      );
      return completeLogin(result);
    },
    [completeLogin]
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const result = await apiLogin(
        "/api/v1/auth/google/login",
        { idToken },
        "Google login failed"
      );
      return completeLogin(result);
    },
    [completeLogin]
  );

  const setPassword = useCallback(
    async (password: string) => {
      const res = await authFetch(
        `${API_BASE_URL}/api/v1/auth/me/password`,
        token,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      if (!res.ok) {
        await throwApiError(res, "Failed to set password");
      }

      const updated = await res.json();
      setUser(updated);
      if (token) {
        persistAuth(token, updated);
      }
    },
    [token]
  );

  const forgotPassword = useCallback(async (email: string) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      await throwApiError(res, "Failed to send reset email");
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    clearPersistedAuth();
    // Clear the API cart cache so a different user logging in won't see
    // the previous user's cart data.
    queryClient.removeQueries({ queryKey: ["cart", "api"] });
  }, [queryClient]);

  // Keep logoutRef in sync so authFetch can always call the latest logout
  logoutRef.current = logout;

  const openAuthModal = useCallback(() => {
    setAuthModalOpen(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        sendOtp,
        verifyOtp,
        loginWithPassword,
        loginWithGoogle,
        setPassword,
        forgotPassword,
        logout,
        openAuthModal,
        authModalOpen,
        setAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
