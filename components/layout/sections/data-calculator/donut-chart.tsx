"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DATA_RATES, CHART_COLORS } from "./calculator-data";

interface DonutChartProps {
  values: Record<string, number>;
  dict: Record<string, any>;
}

function formatGB(mb: number): string {
  if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`;
  if (mb > 0) return `${Math.round(mb)} MB`;
  return "0 GB";
}

export function DonutChart({ values, dict }: DonutChartProps) {
  const segments = Object.entries(values)
    .filter(([, hours]) => hours > 0)
    .map(([key, hours]) => ({
      key,
      name: dict.activities?.[key]?.title || key,
      value: hours * (DATA_RATES[key] || 0),
      color: CHART_COLORS[key] || "#E2E2E4",
    }));

  const totalDailyMB = segments.reduce((sum, s) => sum + s.value, 0);
  const totalMonthlyMB = totalDailyMB * 30;

  // If no data, show empty ring
  const chartData =
    segments.length > 0 && totalDailyMB > 0
      ? segments
      : [{ key: "empty", name: "Empty", value: 1, color: "#E2E2E4" }];

  const legendItems = segments.filter((s) => s.value > 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="w-full">
        <div className="relative flex items-center justify-center">
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="flex flex-col items-center">
              <p className="body-xs text-text-tertiary">{dict.monthly}</p>
              <p className="heading-xl text-text-primary">
                {formatGB(totalMonthlyMB)}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={272}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={104}
                outerRadius={136}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {legendItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {legendItems.map((seg) => (
            <div key={seg.key} className="flex items-center gap-2">
              <div
                className="h-2 w-2 shrink-0 rounded-sm"
                style={{ backgroundColor: seg.color }}
              />
              <p className="body-2xs-medium text-text-secondary">{seg.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
