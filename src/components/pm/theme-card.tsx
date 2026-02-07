"use client";

import { z } from "zod";

export const themeCardSchema = z.object({
    theme: z.string().describe("The theme or feature name from customer feedback"),
    count: z.number().describe("Number of times this theme was mentioned"),
    sentiment: z.enum(['positive', 'negative', 'neutral']).describe("Overall sentiment of the feedback"),
    trend: z.enum(['up', 'down', 'stable']).describe("Whether mentions are increasing, decreasing, or stable"),
});

export type ThemeCardProps = z.infer<typeof themeCardSchema>;

export function ThemeCard({ theme, count, sentiment, trend }: ThemeCardProps) {
    const trendIcons = { up: "↗", down: "↘", stable: "→" };
    const sentimentColors = {
        positive: "from-emerald-500/20 to-emerald-600/30 border-emerald-500/40",
        negative: "from-rose-500/20 to-rose-600/30 border-rose-500/40",
        neutral: "from-amber-500/20 to-amber-600/30 border-amber-500/40"
    };

    return (
        <div
            className={`relative group cursor-pointer rounded-2xl p-5 border backdrop-blur-sm bg-gradient-to-br ${sentimentColors[sentiment]} hover:scale-[1.02] transition-all duration-300`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">{theme}</h3>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-300">{count} mentions</span>
                        <span className="text-gray-500">•</span>
                        <span className={`font-medium ${sentiment === 'positive' ? 'text-emerald-400' :
                                sentiment === 'negative' ? 'text-rose-400' : 'text-amber-400'
                            }`}>
                            {sentiment}
                        </span>
                    </div>
                </div>
                <div className="text-3xl opacity-70">{trendIcons[trend]}</div>
            </div>
            <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
    );
}
