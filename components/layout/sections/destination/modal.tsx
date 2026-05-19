"use client";

import { useEffect, type ReactNode } from "react";
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
  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 flex items-center justify-center"
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
