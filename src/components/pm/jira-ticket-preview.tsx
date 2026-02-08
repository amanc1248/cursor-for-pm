"use client";

import { useState, useEffect } from "react";
import { z } from "zod";

export const jiraTicketPreviewSchema = z.object({
  ticketId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: z.string(),
  priority: z.string(),
  labels: z.array(z.string()).optional(),
  status: z.string().optional(),
  url: z.string().optional(),
  assignee: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  acceptanceCriteria: z.string().optional(),
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

const priorities = ["Highest", "High", "Medium", "Low", "Lowest"];
const statuses = ["To Do", "In Progress", "In Review", "Done"];
const types = ["Story", "Task", "Bug", "Epic", "Feature"];

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

export function JiraTicketPreview(props: JiraTicketPreviewProps) {
  const {
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
  } = props;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  // Editable fields
  const [editTitle, setEditTitle] = useState(title ?? "");
  const [editDescription, setEditDescription] = useState(description ?? "");
  const [editPriority, setEditPriority] = useState(priority ?? "Medium");
  const [editStatus, setEditStatus] = useState(status ?? "To Do");
  const [editType, setEditType] = useState(type ?? "Story");
  const [editAcceptanceCriteria, setEditAcceptanceCriteria] = useState(
    acceptanceCriteria ?? ""
  );

  // Sync when props change (e.g. AI updates)
  useEffect(() => {
    if (!editing) {
      setEditTitle(title ?? "");
      setEditDescription(description ?? "");
      setEditPriority(priority ?? "Medium");
      setEditStatus(status ?? "To Do");
      setEditType(type ?? "Story");
      setEditAcceptanceCriteria(acceptanceCriteria ?? "");
    }
  }, [title, description, priority, status, type, acceptanceCriteria, editing]);

  const hasChanges =
    editTitle !== (title ?? "") ||
    editDescription !== (description ?? "") ||
    editPriority !== (priority ?? "Medium") ||
    editStatus !== (status ?? "To Do") ||
    editType !== (type ?? "Story") ||
    editAcceptanceCriteria !== (acceptanceCriteria ?? "");

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const body: Record<string, unknown> = {
        ticketId,
        action: "update",
      };
      if (editTitle !== (title ?? "")) body.summary = editTitle;
      if (editPriority !== (priority ?? "Medium")) body.priority = editPriority;
      if (editStatus !== (status ?? "To Do")) body.status = editStatus;
      if (editDescription !== (description ?? "")) body.description = editDescription;

      await fetch("/api/jira", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setSaveStatus("saved");
      setEditing(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditTitle(title ?? "");
    setEditDescription(description ?? "");
    setEditPriority(priority ?? "Medium");
    setEditStatus(status ?? "To Do");
    setEditType(type ?? "Story");
    setEditAcceptanceCriteria(acceptanceCriteria ?? "");
  };

  const inputBase =
    "bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all";
  const selectBase =
    "bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer appearance-none transition-all";

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-blue-500/30 shadow-2xl overflow-hidden">
      {/* Header Banner */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-8 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
          {saveStatus === "saved" ? "✓" : "✓"}
        </div>
        <div>
          <div className="text-emerald-400 font-semibold text-sm">
            Jira Ticket
          </div>
          <div className="text-gray-400 text-xs">
            {ticketId ?? "Creating..."}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {saveStatus === "saved" && (
            <span className="text-emerald-400 text-xs font-medium animate-fade-in-up">
              Updated!
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-rose-400 text-xs font-medium">
              Failed to save
            </span>
          )}

          {/* Edit / Save / Cancel buttons */}
          {editing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="text-white/40 hover:text-white/70 text-xs px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update in Jira"
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-white/40 hover:text-white/70 text-xs px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-all flex items-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              Edit
            </button>
          )}

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              Open in Jira →
            </a>
          )}
        </div>
      </div>

      {/* Ticket Content */}
      <div className="px-8 py-6 space-y-4">
        {/* Type + Priority + Status Row */}
        <div className="flex items-center gap-3 flex-wrap">
          {editing ? (
            <>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className={`${selectBase} ${typeColors[editType] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}
              >
                {types.map((t) => (
                  <option key={t} value={t} className="bg-slate-800 text-white">
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className={`${selectBase} ${priorityColors[editPriority] ?? "text-gray-400"}`}
              >
                {priorities.map((p) => (
                  <option key={p} value={p} className="bg-slate-800 text-white">
                    {p} Priority
                  </option>
                ))}
              </select>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className={`${selectBase} ml-auto ${statusColors[editStatus] ?? "bg-slate-700/50 text-gray-300 border-slate-600/50"}`}
              >
                {statuses.map((s) => (
                  <option key={s} value={s} className="bg-slate-800 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Title */}
        {editing ? (
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className={`${inputBase} w-full text-xl font-bold`}
            placeholder="Ticket title..."
          />
        ) : (
          <h3 className="text-white text-xl font-bold">
            {title ?? "Loading..."}
          </h3>
        )}

        {/* Description */}
        {editing ? (
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={4}
            className={`${inputBase} w-full resize-none`}
            placeholder="Ticket description..."
          />
        ) : (
          description && (
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
              {description}
            </p>
          )
        )}

        {/* Acceptance Criteria */}
        {editing ? (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Acceptance Criteria
            </h4>
            <textarea
              value={editAcceptanceCriteria}
              onChange={(e) => setEditAcceptanceCriteria(e.target.value)}
              rows={3}
              className={`${inputBase} w-full resize-none`}
              placeholder="Acceptance criteria..."
            />
          </div>
        ) : (
          acceptanceCriteria && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
              <h4 className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Acceptance Criteria
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                {acceptanceCriteria}
              </p>
            </div>
          )
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
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

          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 px-4 py-3">
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
              Ticket ID
            </div>
            <span className="text-blue-400 font-mono text-sm font-semibold">
              {ticketId}
            </span>
          </div>

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
