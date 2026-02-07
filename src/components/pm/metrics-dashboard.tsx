"use client";

import { z } from "zod";

export const metricsDashboardSchema = z.object({
  title: z.string().describe("Dashboard title, e.g. 'User Engagement KPIs'"),
  period: z.string().optional().describe("Reporting period, e.g. 'January 2026'"),
  metrics: z
    .array(
      z.object({
        name: z.string(),
        value: z.number(),
        previousValue: z.number().optional(),
        target: z.number().optional(),
        unit: z.string().optional(),
        trend: z.enum(["up", "down", "stable"]),
      })
    )
    .describe("Metrics to display with trends"),
});

export type MetricsDashboardProps = z.infer<typeof metricsDashboardSchema>;

const trendConfig: Record<string, { icon: string; color: string; bg: string }> = {
  up: { icon: "↑", color: "text-emerald-400", bg: "bg-emerald-500/20" },
  down: { icon: "↓", color: "text-red-400", bg: "bg-red-500/20" },
  stable: { icon: "→", color: "text-gray-400", bg: "bg-gray-500/20" },
};

export function MetricsDashboard({ title, period, metrics }: MetricsDashboardProps) {
  const metricList = metrics ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-3xl font-bold mb-1">{title ?? "Metrics Dashboard"}</h2>
        {period && <p className="text-gray-400">{period}</p>}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metricList.map((metric, i) => {
          const trend = trendConfig[metric.trend] ?? trendConfig.stable;
          const formattedValue = metric.unit
            ? metric.unit === "%" || metric.unit === "x"
              ? `${metric.value}${metric.unit}`
              : `${metric.unit}${metric.value}`
            : String(metric.value);

          const changePercent =
            metric.previousValue && metric.previousValue !== 0
              ? Math.round(((metric.value - metric.previousValue) / metric.previousValue) * 100)
              : null;

          const targetPercent =
            metric.target && metric.target !== 0
              ? Math.min(100, Math.round((metric.value / metric.target) * 100))
              : null;

          return (
            <div
              key={i}
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-medium">{metric.name}</span>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend.bg} ${trend.color}`}>
                  {trend.icon}
                  {changePercent !== null && ` ${changePercent > 0 ? "+" : ""}${changePercent}%`}
                </span>
              </div>

              <div className="text-white text-3xl font-bold mb-1">{formattedValue}</div>

              {metric.previousValue !== undefined && (
                <div className="text-gray-500 text-xs mb-3">
                  Previous: {metric.unit === "%" || metric.unit === "x"
                    ? `${metric.previousValue}${metric.unit}`
                    : metric.unit
                      ? `${metric.unit}${metric.previousValue}`
                      : metric.previousValue}
                </div>
              )}

              {/* Target bar */}
              {targetPercent !== null && metric.target !== undefined && (
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Target: {metric.unit === "%" || metric.unit === "x"
                      ? `${metric.target}${metric.unit}`
                      : metric.unit
                        ? `${metric.unit}${metric.target}`
                        : metric.target}</span>
                    <span>{targetPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        targetPercent >= 100
                          ? "bg-emerald-500"
                          : targetPercent >= 70
                            ? "bg-blue-500"
                            : "bg-amber-500"
                      }`}
                      style={{ width: `${targetPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
