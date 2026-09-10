"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DATA_RATES, CHART_COLORS } from "./calculator-data";
import {
  buildDonutSegments,
  formatData,
  formatHours,
  formatShare,
  monthlyMb,
  totalDailyMb,
} from "@/lib/data-calculator-chart";

interface DonutChartProps {
  values: Record<string, number>;
  dict: Record<string, any>;
}

const EMPTY_COLOR = "#E2E2E4";

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) =>
    key in vars ? String(vars[key]) : "",
  );
}

/**
 * Ring of estimated data usage (#077).
 *
 * Slices are exactly proportional to the data each activity uses: no padding
 * angle (it used to swallow the small activities whole) and no zero-data
 * slices (they shifted the hover index onto the wrong activity). Separation
 * comes from a stroke, which is painted on top and does not change any angle.
 *
 * Hovering either the ring or a legend row highlights the same activity, and
 * the legend spells out the data and share behind every colour so the picture
 * can be checked against the numbers.
 */
export function DonutChart({ values, dict }: DonutChartProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const segments = buildDonutSegments(values, {
    rates: DATA_RATES,
    colors: CHART_COLORS,
    label: (key) => dict.activities?.[key]?.title,
  });

  const dailyMb = totalDailyMb(segments);
  const hasData = segments.length > 0 && dailyMb > 0;

  const chartData = hasData
    ? segments
    : [{ key: "empty", name: "", hours: 0, dailyMb: 1, share: 1, color: EMPTY_COLOR }];

  const activeSegment = segments.find((segment) => segment.key === activeKey) ?? null;

  const perDayLabel: string = dict.perDay ?? "mỗi ngày";
  const hoursPerDayTemplate: string = dict.hoursPerDay ?? "{{hours}} h/day";

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="w-full">
        <div className="relative flex items-center justify-center">
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="flex flex-col items-center text-center px-8">
              {activeSegment ? (
                /* Data first, time underneath — this is a data calculator, the
                   gigabytes are the answer and the hours are the input. */
                <>
                  <p className="body-xs text-text-tertiary">{activeSegment.name}</p>
                  <p
                    className="heading-xl text-text-primary"
                    data-testid="donut-active-data"
                  >
                    {formatData(activeSegment.dailyMb)}
                  </p>
                  <p className="body-xs text-text-tertiary" data-testid="donut-active-time">
                    {interpolate(hoursPerDayTemplate, {
                      hours: formatHours(activeSegment.hours),
                    })}{" "}
                    · {formatShare(activeSegment.share)}
                  </p>
                </>
              ) : (
                <>
                  <p className="body-xs text-text-tertiary">{dict.monthly}</p>
                  <p className="heading-xl text-text-primary" data-testid="donut-total-monthly">
                    {formatData(monthlyMb(dailyMb))}
                  </p>
                  <p className="body-xs text-text-tertiary" data-testid="donut-total-daily">
                    {formatData(dailyMb)} {perDayLabel}
                  </p>
                </>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={125}
                outerRadius={160}
                dataKey="dailyMb"
                nameKey="name"
                /* No paddingAngle: it subtracted a fixed angle from every
                   slice, which erased the small activities entirely (#077). */
                paddingAngle={0}
                startAngle={90}
                endAngle={-270}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
                stroke="#FFFFFF"
                strokeWidth={2}
                onMouseEnter={(_, index) => setActiveKey(chartData[index]?.key ?? null)}
                onMouseLeave={() => setActiveKey(null)}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.key}`}
                    fill={entry.color}
                    opacity={activeKey !== null && activeKey !== entry.key ? 0.5 : 1}
                    style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {hasData && (
        <ul className="flex flex-col gap-2 list-none p-0 m-0">
          {segments.map((segment) => (
            <li key={segment.key}>
              <button
                type="button"
                data-testid={`donut-legend-${segment.key}`}
                onMouseEnter={() => setActiveKey(segment.key)}
                onMouseLeave={() => setActiveKey(null)}
                onFocus={() => setActiveKey(segment.key)}
                onBlur={() => setActiveKey(null)}
                className={`flex w-full items-center gap-2 rounded-sm px-1 py-0.5 text-left transition-colors ${
                  activeKey === segment.key ? "bg-bg-secondary" : ""
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-sm"
                  style={{ backgroundColor: segment.color }}
                  aria-hidden="true"
                />
                <span className="body-2xs-medium text-text-secondary flex-1 truncate">
                  {segment.name}
                </span>
                {/* The numbers behind the colour, so a wrong slice is obvious */}
                <span className="body-2xs-medium text-text-tertiary shrink-0 tabular-nums">
                  {formatData(segment.dailyMb)} · {formatShare(segment.share)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
