"use client";

import { z } from "zod";

export const competitorMatrixSchema = z.object({
  title: z.string().describe("Matrix title, e.g. 'Competitive Analysis — Task Management'"),
  competitors: z
    .array(z.string())
    .describe("List of competitor names to compare"),
  features: z
    .array(
      z.object({
        name: z.string(),
        support: z
          .array(
            z.object({
              competitor: z.string().describe("Must match a name from the competitors array"),
              level: z.enum(["full", "partial", "none", "unknown"]),
            })
          )
          .describe("Support level per competitor for this feature"),
      })
    )
    .describe("Features to compare across competitors"),
  insights: z.string().optional().describe("Summary insights from the competitive analysis"),
});

export type CompetitorMatrixProps = z.infer<typeof competitorMatrixSchema>;

const supportConfig: Record<string, { icon: string; color: string; label: string }> = {
  full: { icon: "✅", color: "text-emerald-400", label: "Full" },
  partial: { icon: "◐", color: "text-amber-400", label: "Partial" },
  none: { icon: "✗", color: "text-red-400", label: "None" },
  unknown: { icon: "?", color: "text-gray-500", label: "Unknown" },
};

export function CompetitorMatrix({ title, competitors, features, insights }: CompetitorMatrixProps) {
  const cols = competitors ?? [];
  const rows = features ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-white text-3xl font-bold">{title ?? "Competitive Analysis"}</h2>

      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/80">
              <th className="text-left text-gray-400 font-semibold px-5 py-4 border-b border-slate-700/50">
                Feature
              </th>
              {cols.map((c) => (
                <th
                  key={c}
                  className="text-center text-gray-300 font-semibold px-5 py-4 border-b border-slate-700/50"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((feature, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? "bg-slate-900/30" : "bg-slate-800/20"}
              >
                <td className="text-white font-medium px-5 py-3.5 border-b border-slate-700/30">
                  {feature.name}
                </td>
                {cols.map((comp) => {
                  const entry = feature.support?.find((s) => s.competitor === comp);
                  const level = entry?.level ?? "unknown";
                  const cfg = supportConfig[level] ?? supportConfig.unknown;
                  return (
                    <td
                      key={comp}
                      className={`text-center px-5 py-3.5 border-b border-slate-700/30 ${cfg.color}`}
                      title={cfg.label}
                    >
                      <span className="text-lg">{cfg.icon}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-400">
        {Object.entries(supportConfig).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={cfg.color}>{cfg.icon}</span> {cfg.label}
          </span>
        ))}
      </div>

      {/* Insights */}
      {insights && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5">
          <h3 className="text-white font-bold mb-2">Key Insights</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{insights}</p>
        </div>
      )}
    </div>
  );
}
