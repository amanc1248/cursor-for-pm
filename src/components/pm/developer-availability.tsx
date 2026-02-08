"use client";

import { z } from "zod";

export const developerAvailabilitySchema = z.object({
  assignee: z.string(),
  totalActiveTickets: z.number(),
  available: z.boolean(),
  summary: z.string(),
  tickets: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        priority: z.string(),
        status: z.string(),
        url: z.string().optional(),
      })
    )
    .optional(),
});

export type DeveloperAvailabilityProps = z.infer<
  typeof developerAvailabilitySchema
>;

const priorityDots: Record<string, string> = {
  Highest: "bg-rose-400",
  High: "bg-orange-400",
  Medium: "bg-amber-400",
  Low: "bg-blue-400",
  Lowest: "bg-gray-400",
};

const statusColors: Record<string, string> = {
  "In Progress": "text-blue-400",
  "To Do": "text-slate-400",
  "In Review": "text-amber-400",
};

const statusDots: Record<string, string> = {
  "In Progress": "bg-blue-400",
  "To Do": "bg-slate-400",
  "In Review": "bg-amber-400",
};

export function DeveloperAvailability({
  assignee,
  totalActiveTickets,
  available,
  summary,
  tickets,
}: DeveloperAvailabilityProps) {
  const grouped = (tickets ?? []).reduce(
    (acc, t) => {
      const key = t.status || "To Do";
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    },
    {} as Record<string, typeof tickets>
  );

  const inProgressCount = grouped["In Progress"]?.length ?? 0;
  const toDoCount = grouped["To Do"]?.length ?? 0;
  const inReviewCount = grouped["In Review"]?.length ?? 0;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-600/30 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{assignee}</h3>
              <p className="text-gray-400 text-xs mt-0.5">Developer Workload</p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${
              available
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                available
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                  : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
              }`}
            />
            {available ? "Available" : "Busy"}
          </div>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/40 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-blue-300 text-xs font-medium">
              {inProgressCount} In Progress
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/40 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-slate-300 text-xs font-medium">
              {toDoCount} To Do
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/40 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-amber-300 text-xs font-medium">
              {inReviewCount} In Review
            </span>
          </div>
          <div className="ml-auto text-gray-500 text-xs">
            {totalActiveTickets} total active
          </div>
        </div>
      </div>

      {/* Ticket sections */}
      <div className="px-6 py-4 space-y-4">
        {Object.entries(grouped).map(([status, items]) => (
          <div key={status}>
            <h4
              className={`text-xs font-semibold uppercase tracking-wider mb-2 px-4 ${statusColors[status] ?? "text-gray-400"}`}
            >
              {status}
            </h4>
            <div className="space-y-0.5">
              {items!.map((t) => {
                const Row = (
                  <>
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${statusDots[status] ?? "bg-gray-400"}`}
                    />
                    <span className="text-blue-400 font-mono text-xs font-semibold shrink-0">
                      {t.id}
                    </span>
                    <span className="text-white/80 text-sm truncate group-hover:text-blue-300 transition-colors">
                      {t.title}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ml-auto ${priorityDots[t.priority] ?? "bg-gray-400"}`}
                      title={`${t.priority} priority`}
                    />
                  </>
                );
                return t.url ? (
                  <a
                    key={t.id}
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] rounded-xl transition-colors group"
                  >
                    {Row}
                  </a>
                ) : (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  >
                    {Row}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {totalActiveTickets === 0 && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-emerald-400 font-medium text-sm">
              No active tickets
            </p>
            <p className="text-gray-500 text-xs mt-1">
              This developer is free to take on new work
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
