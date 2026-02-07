"use client";

import { z } from "zod";

export const featureCardSchema = z.object({
    title: z.string().describe("Feature title or name"),
    description: z.string().describe("Brief description of the feature"),
    priority: z.number().min(1).max(100).describe("Priority score (1-100)"),
    status: z.enum(['recommended', 'quick-win', 'consider']).describe("Feature status category"),
    impact: z.enum(['High', 'Medium', 'Low']).describe("Expected business impact"),
    effort: z.enum(['High', 'Medium', 'Low']).describe("Development effort required"),
    mentions: z.number().describe("Number of customer mentions"),
});

export type FeatureCardProps = z.infer<typeof featureCardSchema>;

export function FeatureCard({
    title,
    description,
    priority,
    status,
    impact,
    effort,
    mentions
}: FeatureCardProps) {
    const impactColors = {
        High: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        Medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        Low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    };

    const statusConfig = {
        recommended: { label: "Recommended", color: "text-blue-400", icon: "⭐" },
        "quick-win": { label: "Quick Win", color: "text-emerald-400", icon: "⚡" },
        consider: { label: "Consider", color: "text-amber-400", icon: "💭" },
    };

    return (
        <div
            className="group relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.01]"
        >
            {/* Priority Score Badge */}
            <div className="absolute -top-3 -right-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg">
                {priority}
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-3">
                <span className={`text-xl ${statusConfig[status]?.color || "text-gray-400"}`}>
                    {statusConfig[status]?.icon || "📋"}
                </span>
                <span className={`text-sm font-semibold ${statusConfig[status]?.color || "text-gray-400"}`}>
                    {statusConfig[status]?.label || status}
                </span>
            </div>

            {/* Title and Description */}
            <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>

            {/* Metrics */}
            <div className="flex items-center gap-4 mb-4">
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${impactColors[impact]}`}>
                    Impact: {impact}
                </div>
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${impactColors[effort]}`}>
                    Effort: {effort}
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <span>💬</span>
                    <span className="font-medium">{mentions}</span>
                </div>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    );
}
