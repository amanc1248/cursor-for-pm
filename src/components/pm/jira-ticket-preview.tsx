"use client";

import { z } from "zod";

export const jiraTicketPreviewSchema = z.object({
  ticketId: z.string().describe("Jira ticket ID, e.g. 'PM-1234'"),
  title: z.string().describe("Ticket title"),
  description: z.string().describe("Ticket description"),
  type: z
    .enum(["Story", "Task", "Bug", "Epic"])
    .describe("Issue type"),
  priority: z
    .enum(["Highest", "High", "Medium", "Low", "Lowest"])
    .describe("Priority level"),
  labels: z.array(z.string()).optional().describe("Ticket labels"),
  status: z.string().describe("Current status, e.g. 'To Do'"),
  url: z.string().describe("Jira ticket URL"),
});

export type JiraTicketPreviewProps = z.infer<typeof jiraTicketPreviewSchema>;

const typeColors: Record<string, string> = {
  Story: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Task: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Bug: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  Epic: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const priorityColors: Record<string, string> = {
  Highest: "text-rose-400",
  High: "text-orange-400",
  Medium: "text-amber-400",
  Low: "text-blue-400",
  Lowest: "text-gray-400",
};

export function JiraTicketPreview({
  ticketId,
  title,
  description,
  type,
  priority,
  labels,
  status,
  url,
}: JiraTicketPreviewProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-blue-500/30 shadow-2xl overflow-hidden">
      {/* Success Banner */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-8 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
          ✓
        </div>
        <div>
          <div className="text-emerald-400 font-semibold text-sm">
            Jira Ticket Created
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
        {/* Type + Priority Row */}
        <div className="flex items-center gap-3">
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
            <span className="ml-auto bg-slate-700/50 text-gray-300 px-3 py-1 rounded-lg text-xs font-medium border border-slate-600/50">
              {status}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-white text-xl font-bold">{title ?? "Loading..."}</h3>

        {/* Description */}
        {description && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
            {description}
          </p>
        )}

        {/* Labels */}
        {labels && labels.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
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
