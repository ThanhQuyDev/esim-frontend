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
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  /** Send OTP to email (works for both login & register) */
  sendOtp: (email: string) => Promise<void>;
  /** Verify OTP and complete authentication */
  verifyOtp: (email: string, otp: string) => Promise<void>;
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

async function apiSendOtp(email: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/email/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to send OTP (${res.status})`);
  }
}

async function apiVerifyOtp(
  email: string,
  otp: string
): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/email/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `OTP verification failed (${res.status})`);
  }

  const data = await res.json();
  return {
    token: data.token,
    user: data.user ?? { id: 0, email },
  };
}

// ===== Provider =====

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const logoutRef = useRef<() => void>(() => {});

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

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const result = await apiVerifyOtp(email, otp);
    setToken(result.token);
    setUser(result.user);
    persistAuth(result.token, result.user);

    // Sync localStorage cart → API cart after login
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
                planId: Number(item.id),
                quantity: item.quantity,
              }),
            })
          )
        );
        // Clear localStorage cart after successful sync
        clearCart();
      }
    } catch {
      // Sync failed silently — user can still use the app
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    clearPersistedAuth();
  }, []);

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
