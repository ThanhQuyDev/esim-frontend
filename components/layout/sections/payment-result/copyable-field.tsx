"use client";

import { Copy } from "lucide-react";

interface CopyableFieldProps {
  label: string;
  value: string;
  fieldKey: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  copyLabel: string;
  copiedLabel: string;
}

export function CopyableField({
  label,
  value,
  fieldKey,
  copiedField,
  onCopy,
  copyLabel,
  copiedLabel,
}: CopyableFieldProps) {
  if (!value) return null;

  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        <button
          onClick={() => onCopy(value, fieldKey)}
          className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
          aria-label={`Copy ${label}`}
        >
          <Copy className="w-3.5 h-3.5" />
          {copiedField === fieldKey ? copiedLabel : copyLabel}
        </button>
      </div>
      <p className="text-base sm:text-sm font-mono text-gray-900 break-all leading-relaxed">
        {value}
      </p>
    </div>
  );
}
