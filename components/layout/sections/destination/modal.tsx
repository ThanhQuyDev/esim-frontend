"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Optional zIndex override; defaults to 600 (matches HTML reference). */
  zIndex?: number;
  /** Optional aria-label for the dialog. */
  ariaLabel?: string;
}

/**
 * Lightweight portal-based modal with backdrop click-to-close and Escape support.
 * Renders to <body> via React portals for proper stacking above sticky bars.
 */
export function Modal({ open, onClose, children, zIndex = 600, ariaLabel }: ModalProps) {
  // Keep onClose in a ref so the effect below only re-runs when `open` changes.
  // This prevents the body overflow from flickering when the parent re-renders
  // (e.g. when it passes an inline arrow function for onClose).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      // Center on desktop, anchor to bottom on small screens so children styled as
      // bottom sheets sit flush against the bottom edge.
      className="fixed inset-0 flex max-w-full overflow-x-hidden items-center justify-center max-[640px]:items-end animate-fade-in"
      style={{ zIndex, background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>,
    document.body
  );
}
