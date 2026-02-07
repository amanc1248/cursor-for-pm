"use client";

import { z } from "zod";

export const statusReportSchema = z.object({
  title: z.string().describe("Report title, e.g. 'Weekly Status — Checkout Redesign'"),
  period: z.string().describe("Reporting period, e.g. 'Week of Feb 3, 2026'"),
  status: z.enum(["on-track", "at-risk", "off-track"]).describe("Overall project status"),
  highlights: z.array(z.string()).describe("Key accomplishments and highlights"),
  risks: z.array(z.string()).describe("Current risks and blockers"),
  nextSteps: z.array(z.string()).describe("Planned next steps"),
  metrics: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        trend: z.enum(["up", "down", "stable"]),
      })
    )
    .optional()
    .describe("Key metrics with trends"),
});

export type StatusReportProps = z.infer<typeof statusReportSchema>;

const statusBadge: Record<string, { label: string; color: string; bg: string }> = {
  "on-track": { label: "On Track", color: "text-emerald-300", bg: "bg-emerald-500/20 border-emerald-500/30" },
  "at-risk": { label: "At Risk", color: "text-amber-300", bg: "bg-amber-500/20 border-amber-500/30" },
  "off-track": { label: "Off Track", color: "text-red-300", bg: "bg-red-500/20 border-red-500/30" },
};

const trendIcon: Record<string, string> = { up: "↑", down: "↓", stable: "→" };
const trendColor: Record<string, string> = {
  up: "text-emerald-400",
  down: "text-red-400",
  stable: "text-gray-400",
};

export function StatusReport({ title, period, status, highlights, risks, nextSteps, metrics }: StatusReportProps) {
  const badge = statusBadge[status] ?? statusBadge["on-track"];

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-slate-700 px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Status Report
            </div>
            <h2 className="text-white text-2xl font-bold">{title ?? "Status Report"}</h2>
            <p className="text-gray-400 text-sm mt-1">{period}</p>
          </div>
          <span className={`px-4 py-2 rounded-full border font-semibold text-sm ${badge.bg} ${badge.color}`}>
            {badge.label}
          </span>
        </div>
      </div>

      <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
        {/* Metrics Row */}
        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="text-gray-400 text-xs mb-1">{m.label}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-white text-2xl font-bold">{m.value}</span>
                  <span className={`text-sm font-medium ${trendColor[m.trend] ?? ""}`}>
                    {trendIcon[m.trend] ?? ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Highlights */}
        {highlights && highlights.length > 0 && (
          <Section title="Highlights" icon="🎯">
            <ul className="space-y-2">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Risks */}
        {risks && risks.length > 0 && (
          <Section title="Risks & Blockers" icon="⚠️">
            <ul className="space-y-2">
              {risks.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Next Steps */}
        {nextSteps && nextSteps.length > 0 && (
          <Section title="Next Steps" icon="🚀">
            <ul className="space-y-2">
              {nextSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-white font-bold text-lg mb-3 pb-2 border-b border-slate-700/50">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}
