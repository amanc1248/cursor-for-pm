"use client";

import { z } from "zod";

const ticketSchema = z.object({
  ticketId: z.string(),
  title: z.string(),
  priority: z.string(),
  type: z.string(),
  url: z.string(),
});

export const developerAvailabilitySchema = z.object({
  assignee: z.string().describe("Developer name or email"),
  totalActiveTickets: z.number().describe("Total non-Done tickets"),
  available: z.boolean().describe("Whether the developer is available"),
  summary: z.string().describe("Plain English availability summary"),
  inProgress: z
    .array(ticketSchema)
    .optional()
    .describe("Tickets currently in progress"),
  toDo: z
    .array(ticketSchema)
    .optional()
    .describe("Tickets in the to-do queue"),
  inReview: z
    .array(ticketSchema)
    .optional()
    .describe("Tickets in review"),
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

const typeIcons: Record<string, string> = {
  Story: "📖",
  Task: "✅",
  Bug: "🐛",
  Epic: "⚡",
  Feature: "✨",
};

function TicketRow({
  ticket,
}: {
  ticket: z.infer<typeof ticketSchema>;
}) {
  return (
    <a
      href={ticket.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] rounded-xl transition-colors group"
    >
      <span className="text-sm" title={ticket.type}>
        {typeIcons[ticket.type] ?? "📋"}
      </span>
      <span className="text-blue-400 font-mono text-xs font-semibold shrink-0">
        {ticket.ticketId}
      </span>
      <span className="text-white/80 text-sm truncate group-hover:text-blue-300 transition-colors">
        {ticket.title}
      </span>
      <div
        className={`w-2 h-2 rounded-full shrink-0 ml-auto ${priorityDots[ticket.priority] ?? "bg-gray-400"}`}
        title={`${ticket.priority} priority`}
      />
    </a>
  );
}

export function DeveloperAvailability({
  assignee,
  totalActiveTickets,
  available,
  summary,
  inProgress,
  toDo,
  inReview,
}: DeveloperAvailabilityProps) {
  const inProgressCount = inProgress?.length ?? 0;
  const toDoCount = toDo?.length ?? 0;
  const inReviewCount = inReview?.length ?? 0;

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

          {/* Availability badge */}
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

        {/* Summary */}
        <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>

        {/* Stats bar */}
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
        {inProgressCount > 0 && (
          <div>
            <h4 className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2 px-4">
              In Progress
            </h4>
            <div className="space-y-0.5">
              {inProgress!.map((t) => (
                <TicketRow key={t.ticketId} ticket={t} />
              ))}
            </div>
          </div>
        )}

        {toDoCount > 0 && (
          <div>
            <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 px-4">
              To Do
            </h4>
            <div className="space-y-0.5">
              {toDo!.map((t) => (
                <TicketRow key={t.ticketId} ticket={t} />
              ))}
            </div>
          </div>
        )}

        {inReviewCount > 0 && (
          <div>
            <h4 className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2 px-4">
              In Review
            </h4>
            <div className="space-y-0.5">
              {inReview!.map((t) => (
                <TicketRow key={t.ticketId} ticket={t} />
              ))}
            </div>
          </div>
        )}

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
