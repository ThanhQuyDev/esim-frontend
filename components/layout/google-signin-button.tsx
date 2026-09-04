"use client";

import { useEffect, useRef } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GSI_SRC = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google?: any;
  }
}

let gsiPromise: Promise<void> | null = null;

function loadGsi(): Promise<void> {
  if (gsiPromise) return gsiPromise;

  gsiPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("gsi")));
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("gsi"));
    document.head.appendChild(script);
  });

  return gsiPromise;
}

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void;
  onError: () => void;
  disabled?: boolean;
  locale?: string;
}

export function GoogleSignInButton({
  onCredential,
  onError,
  disabled,
  locale,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep the latest callbacks reachable from the GSI callback, which is
  // registered once and would otherwise capture stale closures.
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let cancelled = false;

    loadGsi()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: { credential?: string }) => {
            if (response.credential) {
              onCredentialRef.current(response.credential);
            } else {
              onErrorRef.current();
            }
          },
        });

        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
          width: 320,
          locale: locale === "vi" ? "vi" : "en",
        });
      })
      .catch(() => {
        if (!cancelled) onErrorRef.current();
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div
      className={`flex justify-center ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <div ref={containerRef} />
    </div>
  );
}
