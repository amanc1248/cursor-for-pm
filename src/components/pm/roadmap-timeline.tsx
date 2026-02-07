"use client";

import { z } from "zod";

export const roadmapTimelineSchema = z.object({
  title: z.string().describe("Roadmap title, e.g. 'Q2 2026 Product Roadmap'"),
  timeframe: z.string().describe("Overall timeframe, e.g. 'Q2 2026 — Q4 2026'"),
  phases: z
    .array(
      z.object({
        name: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        status: z.enum(["completed", "in-progress", "planned"]),
        items: z.array(z.string()),
      })
    )
    .describe("Roadmap phases with milestones"),
});

export type RoadmapTimelineProps = z.infer<typeof roadmapTimelineSchema>;

const phaseStatus: Record<string, { label: string; color: string; bar: string; dot: string }> = {
  completed: {
    label: "Completed",
    color: "text-emerald-400",
    bar: "bg-emerald-500/30 border-emerald-500/40",
    dot: "bg-emerald-400",
  },
  "in-progress": {
    label: "In Progress",
    color: "text-blue-400",
    bar: "bg-blue-500/30 border-blue-500/40",
    dot: "bg-blue-400",
  },
  planned: {
    label: "Planned",
    color: "text-gray-400",
    bar: "bg-slate-700/50 border-slate-600/50",
    dot: "bg-gray-500",
  },
};

export function RoadmapTimeline({ title, timeframe, phases }: RoadmapTimelineProps) {
  const phaseList = phases ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-3xl font-bold mb-1">{title ?? "Roadmap"}</h2>
        <p className="text-gray-400">{timeframe}</p>
      </div>

      {/* Timeline */}
      <div className="relative space-y-0">
        {phaseList.map((phase, i) => {
          const cfg = phaseStatus[phase.status] ?? phaseStatus.planned;
          const isLast = i === phaseList.length - 1;

          return (
            <div key={i} className="relative flex gap-6">
              {/* Timeline bar */}
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full ${cfg.dot} shrink-0 z-10 ring-4 ring-slate-900`} />
                {!isLast && <div className="w-0.5 flex-1 bg-slate-700/80 min-h-[2rem]" />}
              </div>

              {/* Phase card */}
              <div className={`flex-1 mb-6 rounded-xl border p-5 ${cfg.bar}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold text-lg">{phase.name}</h3>
                  <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                </div>
                <p className="text-gray-400 text-xs mb-3">
                  {phase.startDate} — {phase.endDate}
                </p>
                <ul className="space-y-1.5">
                  {phase.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
