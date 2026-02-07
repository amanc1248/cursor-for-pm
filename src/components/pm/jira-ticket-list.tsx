"use client";

import { z } from "zod";

export const jiraTicketListSchema = z.object({
  tickets: z
    .array(
      z.object({
        ticketId: z.string().describe("Jira ticket key, e.g. 'KAN-4'"),
        title: z.string().describe("Ticket summary"),
        status: z.string().describe("Current status"),
        priority: z.string().describe("Priority level"),
        type: z.string().describe("Issue type"),
        assignee: z.string().describe("Assigned person or 'Unassigned'"),
        url: z.string().describe("Jira ticket URL"),
      })
    )
    .describe("List of Jira tickets"),
  filterLabel: z
    .string()
    .optional()
    .describe("Label describing the active filter, e.g. 'In Progress'"),
  total: z.number().optional().describe("Total matching tickets"),
});

export type JiraTicketListProps = z.infer<typeof jiraTicketListSchema>;

const statusColors: Record<string, string> = {
  "To Do": "bg-slate-500/20 text-slate-300 border-slate-500/30",
  "In Progress": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "In Review": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Done: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const typeIcons: Record<string, string> = {
  Story: "📖",
  Task: "✅",
  Bug: "🐛",
  Epic: "⚡",
  Feature: "✨",
};

const priorityDots: Record<string, string> = {
  Highest: "bg-rose-400",
  High: "bg-orange-400",
  Medium: "bg-amber-400",
  Low: "bg-blue-400",
  Lowest: "bg-gray-400",
};

export function JiraTicketList({
  tickets,
  filterLabel,
  total,
}: JiraTicketListProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-blue-500/30 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm">
            🎫
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Jira Tickets</h3>
            {filterLabel && (
              <p className="text-gray-400 text-xs">
                Filtered by: {filterLabel}
              </p>
            )}
          </div>
        </div>
        <div className="bg-slate-700/50 px-3 py-1 rounded-lg text-gray-300 text-sm font-medium">
          {total ?? tickets?.length ?? 0} tickets
        </div>
      </div>

      {/* Ticket Rows */}
      <div className="divide-y divide-slate-700/30">
        {(!tickets || tickets.length === 0) && (
          <div className="px-8 py-12 text-center text-gray-500">
            No tickets found matching the criteria.
          </div>
        )}
        {tickets?.map((ticket) => (
          <a
            key={ticket.ticketId}
            href={ticket.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-8 py-4 hover:bg-slate-700/20 transition-colors group"
          >
            {/* Type icon */}
            <span className="text-lg" title={ticket.type}>
              {typeIcons[ticket.type] ?? "📋"}
            </span>

            {/* Key + Title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-mono text-sm font-semibold">
                  {ticket.ticketId}
                </span>
                <span className="text-white text-sm truncate group-hover:text-blue-300 transition-colors">
                  {ticket.title}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gray-500 text-xs">
                  {ticket.assignee}
                </span>
              </div>
            </div>

            {/* Priority dot */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${priorityDots[ticket.priority] ?? "bg-gray-400"}`}
                title={`${ticket.priority} priority`}
              />
            </div>

            {/* Status badge */}
            <span
              className={`px-3 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap ${statusColors[ticket.status] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}
            >
              {ticket.status}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
