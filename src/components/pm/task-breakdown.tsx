"use client";

import { z } from "zod";

export const taskBreakdownSchema = z.object({
  title: z.string().describe("Sprint or breakdown title, e.g. 'Checkout Redesign — Sprint 3'"),
  feature: z.string().optional().describe("The parent feature being broken down"),
  tasks: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        assignee: z.string().optional(),
        storyPoints: z.number().min(1).max(21),
        status: z.enum(["todo", "in-progress", "done"]),
        type: z.enum(["frontend", "backend", "design", "qa"]),
      })
    )
    .describe("List of tasks with story points and metadata"),
});

export type TaskBreakdownProps = z.infer<typeof taskBreakdownSchema>;

const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  frontend: { label: "Frontend", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: "🖥️" },
  backend: { label: "Backend", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: "⚙️" },
  design: { label: "Design", color: "bg-pink-500/20 text-pink-300 border-pink-500/30", icon: "🎨" },
  qa: { label: "QA", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: "🧪" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  todo: { label: "To Do", color: "text-gray-400" },
  "in-progress": { label: "In Progress", color: "text-blue-400" },
  done: { label: "Done", color: "text-emerald-400" },
};

export function TaskBreakdown({ title, feature, tasks }: TaskBreakdownProps) {
  const taskList = tasks ?? [];
  const totalPoints = taskList.reduce((sum, t) => sum + t.storyPoints, 0);
  const donePoints = taskList
    .filter((t) => t.status === "done")
    .reduce((sum, t) => sum + t.storyPoints, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-3xl font-bold mb-1">{title ?? "Task Breakdown"}</h2>
        {feature && <p className="text-gray-400">Feature: {feature}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Tasks" value={String(taskList.length)} />
        <StatCard label="Story Points" value={String(totalPoints)} />
        <StatCard
          label="Progress"
          value={totalPoints > 0 ? `${Math.round((donePoints / totalPoints) * 100)}%` : "0%"}
        />
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {taskList.map((task, i) => {
          const type = typeConfig[task.type];
          const status = statusConfig[task.status];
          return (
            <div
              key={i}
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl border border-slate-700/50 p-5 hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${status?.color ?? "text-gray-400"}`}>
                      {status?.label ?? task.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${type?.color ?? ""}`}>
                      {type?.icon} {type?.label ?? task.type}
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-lg">{task.title}</h4>
                  <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                  {task.assignee && (
                    <span className="inline-block mt-2 text-xs text-gray-500">
                      👤 {task.assignee}
                    </span>
                  )}
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm px-3 py-1.5 rounded-full shrink-0">
                  {task.storyPoints} SP
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className="text-white text-2xl font-bold">{value}</div>
    </div>
  );
}
