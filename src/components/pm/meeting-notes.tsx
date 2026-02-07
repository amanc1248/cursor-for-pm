"use client";

import { z } from "zod";

export const meetingNotesSchema = z.object({
  title: z.string().describe("Meeting title, e.g. 'Sprint 5 Standup'"),
  date: z.string().describe("Meeting date, e.g. 'Feb 7, 2026'"),
  attendees: z.array(z.string()).describe("List of attendee names"),
  summary: z.string().describe("Brief meeting summary"),
  decisions: z.array(z.string()).describe("Key decisions made"),
  actionItems: z
    .array(
      z.object({
        task: z.string(),
        owner: z.string(),
        dueDate: z.string().optional(),
        status: z.enum(["pending", "in-progress", "done"]),
      })
    )
    .describe("Action items from the meeting"),
  nextMeeting: z.string().optional().describe("Date/time of next meeting"),
});

export type MeetingNotesProps = z.infer<typeof meetingNotesSchema>;

const actionStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-gray-400", bg: "bg-gray-500/20" },
  "in-progress": { label: "In Progress", color: "text-blue-400", bg: "bg-blue-500/20" },
  done: { label: "Done", color: "text-emerald-400", bg: "bg-emerald-500/20" },
};

export function MeetingNotes({
  title,
  date,
  attendees,
  summary,
  decisions,
  actionItems,
  nextMeeting,
}: MeetingNotesProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600/20 to-blue-600/20 border-b border-slate-700 px-8 py-6">
        <div className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
          Meeting Notes
        </div>
        <h2 className="text-white text-2xl font-bold">{title ?? "Meeting Notes"}</h2>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
          <span>📅 {date}</span>
          {nextMeeting && <span>Next: {nextMeeting}</span>}
        </div>
      </div>

      <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
        {/* Attendees */}
        {attendees && attendees.length > 0 && (
          <div>
            <h3 className="text-white font-bold text-lg mb-3 pb-2 border-b border-slate-700/50">
              Attendees
            </h3>
            <div className="flex flex-wrap gap-2">
              {attendees.map((a, i) => (
                <span
                  key={i}
                  className="bg-slate-700/50 text-gray-300 text-sm px-3 py-1.5 rounded-full border border-slate-600/50"
                >
                  👤 {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div>
            <h3 className="text-white font-bold text-lg mb-3 pb-2 border-b border-slate-700/50">
              Summary
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Decisions */}
        {decisions && decisions.length > 0 && (
          <div>
            <h3 className="text-white font-bold text-lg mb-3 pb-2 border-b border-slate-700/50">
              Decisions
            </h3>
            <ul className="space-y-2">
              {decisions.map((d, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                  <span className="text-violet-400 shrink-0">✓</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Items */}
        {actionItems && actionItems.length > 0 && (
          <div>
            <h3 className="text-white font-bold text-lg mb-3 pb-2 border-b border-slate-700/50">
              Action Items
            </h3>
            <div className="space-y-3">
              {actionItems.map((item, i) => {
                const statusCfg = actionStatusConfig[item.status] ?? actionStatusConfig.pending;
                return (
                  <div
                    key={i}
                    className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 flex items-start gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{item.task}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span>👤 {item.owner}</span>
                        {item.dueDate && <span>📅 {item.dueDate}</span>}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.bg} ${statusCfg.color} shrink-0`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
