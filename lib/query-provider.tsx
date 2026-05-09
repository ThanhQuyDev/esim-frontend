"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Safety net: if a mutation throws a 401-like error
            // (e.g. from code that doesn't use authFetch), force logout
            onError: (error: Error) => {
              if (
                error.message.includes("401") ||
                error.message.includes("Unauthorized")
              ) {
                localStorage.removeItem("esim_auth_token");
                localStorage.removeItem("esim_auth_user");
                // Reload to clear all in-memory state
                window.location.reload();
              }
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
