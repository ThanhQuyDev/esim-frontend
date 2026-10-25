"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /** "vi" or "en", for the eye button's label. */
  lang?: string;
  /** Classes for the input itself; the eye sits inside its right edge. */
  className?: string;
}

/**
 * A password box with an eye to show what was typed (vande #073): one wrong
 * character no longer means typing the whole password again blind.
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, lang, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);
  const vi = lang !== "en";
  return (
    <div className="relative">
      <input
        {...props}
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
          "pr-10",
        )}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={
          visible
            ? vi
              ? "Ẩn mật khẩu"
              : "Hide password"
            : vi
              ? "Hiện mật khẩu"
              : "Show password"
        }
        aria-pressed={visible}
        data-testid="password-toggle"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 transition-colors hover:text-gray-600 cursor-pointer"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
