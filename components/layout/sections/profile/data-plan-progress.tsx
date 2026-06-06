"use client";

import type { ProfileDict } from "./translations";

interface DataPlanProgressProps {
  label: string;
  used: number;
  total: number;
  unit: string;
  color: "blue" | "emerald" | "amber";
  t: ProfileDict;
}

const colorMap = {
  blue: {
    bg: "bg-blue-100",
    fill: "bg-blue-500",
    text: "text-blue-600",
    light: "text-blue-500",
  },
  emerald: {
    bg: "bg-emerald-100",
    fill: "bg-emerald-500",
    text: "text-emerald-600",
    light: "text-emerald-500",
  },
  amber: {
    bg: "bg-amber-100",
    fill: "bg-amber-500",
    text: "text-amber-600",
    light: "text-amber-500",
  },
};

export function DataPlanProgress({ label, used, total, unit, color, t }: DataPlanProgressProps) {
  const remaining = Math.max(0, total - used);
  const percentage = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const c = colorMap[color];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-base sm:text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-base sm:text-sm font-semibold ${c.text}`}>
          {remaining} {unit} {t.remaining}
        </span>
      </div>

      {/* Progress bar */}
      <div className={`w-full h-3 rounded-full ${c.bg} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${c.fill} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {t.used}: {used} {unit}
        </span>
        <span>
          {t.of} {total} {unit}
        </span>
      </div>
    </div>
  );
}
