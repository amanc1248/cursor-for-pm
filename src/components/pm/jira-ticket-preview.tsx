"use client";

import { z } from "zod";

export const jiraTicketPreviewSchema = z.object({
  ticketId: z.string().describe("Jira ticket ID, e.g. 'KAN-4'"),
  title: z.string().describe("Ticket title"),
  description: z.string().optional().describe("Ticket description"),
  type: z
    .string()
    .describe("Issue type, e.g. Story, Task, Bug, Epic, Feature"),
  priority: z
    .string()
    .describe("Priority level, e.g. Highest, High, Medium, Low, Lowest"),
  labels: z.array(z.string()).optional().describe("Ticket labels"),
  status: z.string().optional().describe("Current status, e.g. 'To Do'"),
  url: z.string().optional().describe("Jira ticket URL"),
  assignee: z.string().optional().describe("Assigned person's name"),
  createdAt: z.string().optional().describe("Creation timestamp"),
  updatedAt: z.string().optional().describe("Last updated timestamp"),
  acceptanceCriteria: z
    .string()
    .optional()
    .describe("Acceptance criteria for the ticket"),
});

export type JiraTicketPreviewProps = z.infer<typeof jiraTicketPreviewSchema>;

const typeColors: Record<string, string> = {
  Story: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Task: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Bug: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  Epic: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Feature: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

const priorityColors: Record<string, string> = {
  Highest: "text-rose-400",
  High: "text-orange-400",
  Medium: "text-amber-400",
  Low: "text-blue-400",
  Lowest: "text-gray-400",
};

const statusColors: Record<string, string> = {
  "To Do": "bg-slate-500/20 text-slate-300 border-slate-500/30",
  "In Progress": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "In Review": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Done: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function JiraTicketPreview({
  ticketId,
  title,
  description,
  type,
  priority,
  labels,
  status,
  url,
  assignee,
  createdAt,
  updatedAt,
  acceptanceCriteria,
}: JiraTicketPreviewProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-blue-500/30 shadow-2xl overflow-hidden">
      {/* Header Banner */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-8 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
          ✓
        </div>
        <div>
          <div className="text-emerald-400 font-semibold text-sm">
            Jira Ticket
          </div>
          <div className="text-gray-400 text-xs">
            {ticketId ?? "Creating..."}
          </div>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            Open in Jira →
          </a>
        )}
      </div>

      {/* Ticket Content */}
      <div className="px-8 py-6 space-y-4">
        {/* Type + Priority + Status Row */}
        <div className="flex items-center gap-3 flex-wrap">
          {type && (
            <span
              className={`px-3 py-1 rounded-lg border text-xs font-semibold ${typeColors[type] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}
            >
              {type}
            </span>
          )}
          {priority && (
            <span
              className={`text-sm font-medium ${priorityColors[priority] ?? "text-gray-400"}`}
            >
              {priority} Priority
            </span>
          )}
          {status && (
            <span
              className={`ml-auto px-3 py-1 rounded-lg border text-xs font-semibold ${statusColors[status] ?? "bg-slate-700/50 text-gray-300 border-slate-600/50"}`}
            >
              {status}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-white text-xl font-bold">
          {title ?? "Loading..."}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
            {description}
          </p>
        )}

        {/* Acceptance Criteria */}
        {acceptanceCriteria && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Acceptance Criteria
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
              {acceptanceCriteria}
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Assignee */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 px-4 py-3">
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
              Assignee
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {assignee
                  ? assignee
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                  : "?"}
              </div>
              <span className="text-gray-300 text-sm">
                {assignee ?? "Unassigned"}
              </span>
            </div>
          </div>

          {/* Ticket ID */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 px-4 py-3">
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
              Ticket ID
            </div>
            <span className="text-blue-400 font-mono text-sm font-semibold">
              {ticketId}
            </span>
          </div>

          {/* Created */}
          {createdAt && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 px-4 py-3">
              <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                Created
              </div>
              <span className="text-gray-300 text-sm">
                {formatDate(createdAt)}
              </span>
            </div>
          )}

          {/* Updated */}
          {updatedAt && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 px-4 py-3">
              <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                Updated
              </div>
              <span className="text-gray-300 text-sm">
                {formatDate(updatedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Labels */}
        {labels && labels.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              Labels:
            </span>
            {labels.map((label, i) => (
              <span
                key={i}
                className="bg-slate-700/50 text-gray-300 px-2.5 py-1 rounded-md text-xs border border-slate-600/50"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
