"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A line cut short with "…" on a phone: tapping it shows the whole text in a
 * bubble (vande-0411 #080). Nothing happens when the text already fits.
 */
export function TapFull({
  text,
  className = "",
  align = "left",
}: {
  text: string;
  className?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <span ref={box} className={`relative block min-w-0 ${className}`}>
      <span
        ref={line}
        role="button"
        tabIndex={0}
        className="block truncate"
        data-testid="tap-full"
        onClick={(event) => {
          // A card it sits on may be a link or a toggle.
          event.preventDefault();
          event.stopPropagation();
          const el = line.current;
          if (el && el.scrollWidth > el.clientWidth) setOpen((value) => !value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") line.current?.click();
          if (event.key === "Escape") setOpen(false);
        }}
      >
        {text}
      </span>
      {open && (
        <span
          role="tooltip"
          data-testid="tap-full-bubble"
          className={`absolute top-full z-20 mt-1 w-max max-w-[16rem] rounded-[10px] bg-gray-900 px-3 py-2 text-left text-sm font-normal whitespace-normal text-white shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {text}
        </span>
      )}
    </span>
  );
}
