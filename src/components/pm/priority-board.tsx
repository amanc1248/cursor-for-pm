"use client";

import { z } from "zod";

export const priorityBoardSchema = z.object({
  title: z
    .string()
    .describe("Board title, e.g. 'Q2 Feature Priorities'"),
  subtitle: z
    .string()
    .optional()
    .describe("Board subtitle or context"),
  features: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        priority: z.number().min(1).max(100),
        status: z.enum(["recommended", "quick-win", "consider"]),
        impact: z.enum(["High", "Medium", "Low"]),
        effort: z.enum(["High", "Medium", "Low"]),
        mentions: z.number(),
      })
    )
    .describe("List of prioritized features to display"),
});

export type PriorityBoardProps = z.infer<typeof priorityBoardSchema>;

const statusConfig: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  recommended: { label: "Recommended", color: "text-blue-400", icon: "⭐" },
  "quick-win": { label: "Quick Win", color: "text-emerald-400", icon: "⚡" },
  consider: { label: "Consider", color: "text-amber-400", icon: "💭" },
};

const impactColors: Record<string, string> = {
  High: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  Medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

export function PriorityBoard({
  title,
  subtitle,
  features,
}: PriorityBoardProps) {
  const sortedFeatures = features
    ? [...features].sort((a, b) => b.priority - a.priority)
    : [];

  const quickWins = sortedFeatures.filter((f) => f.status === "quick-win").length;
  const avgPriority =
    sortedFeatures.length > 0
      ? Math.round(
          sortedFeatures.reduce((sum, f) => sum + f.priority, 0) /
            sortedFeatures.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-3xl font-bold mb-1">
          {title ?? "Feature Priorities"}
        </h2>
        {subtitle && <p className="text-gray-400">{subtitle}</p>}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Features" value={String(sortedFeatures.length)} />
        <StatCard label="Avg Priority" value={String(avgPriority)} />
        <StatCard label="Quick Wins" value={String(quickWins)} />
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {sortedFeatures.map((feature, i) => (
          <BoardFeatureCard key={i} feature={feature} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className="text-white text-2xl font-bold">{value}</div>
    </div>
  );
}

function BoardFeatureCard({
  feature,
  rank,
}: {
  feature: PriorityBoardProps["features"][number];
  rank: number;
}) {
  const cfg = statusConfig[feature.status];

  return (
    <div className="group relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all duration-300">
      {/* Priority Badge */}
      <div className="absolute -top-3 -right-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg">
        #{rank}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xl ${cfg?.color ?? "text-gray-400"}`}>
          {cfg?.icon ?? "📋"}
        </span>
        <span
          className={`text-sm font-semibold ${cfg?.color ?? "text-gray-400"}`}
        >
          {cfg?.label ?? feature.status}
        </span>
        <span className="text-gray-500 text-xs ml-auto">
          Score: {feature.priority}
        </span>
      </div>

      {/* Title + Description */}
      <h3 className="text-white text-xl font-bold mb-2">{feature.title}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {feature.description}
      </p>

      {/* Metrics */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${impactColors[feature.impact] ?? ""}`}
        >
          Impact: {feature.impact}
        </div>
        <div
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${impactColors[feature.effort] ?? ""}`}
        >
          Effort: {feature.effort}
        </div>
        <div className="flex items-center gap-1.5 text-gray-400 text-sm ml-auto">
          <span>💬</span>
          <span className="font-medium">{feature.mentions}</span>
        </div>
      </div>
    </div>
  );
}
