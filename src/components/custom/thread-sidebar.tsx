"use client";

import {
  useTamboThread,
  useTamboThreadList,
} from "@tambo-ai/react";
import { Plus, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ThreadSidebar() {
  const { data: threads, isLoading } = useTamboThreadList();
  const { switchCurrentThread, startNewThread, thread: currentThread } =
    useTamboThread();
  const [expanded, setExpanded] = useState(true);

  const threadItems = threads?.items ?? [];

  const handleNewThread = async () => {
    try {
      await startNewThread();
    } catch (e) {
      console.error("Failed to create thread:", e);
    }
  };

  const handleSwitch = (threadId: string) => {
    if (threadId !== currentThread?.id) {
      switchCurrentThread(threadId);
    }
  };

  return (
    <div className="border-b border-white/[0.06]">
      {/* Toggle header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 text-white/40 hover:text-white/60 transition-colors cursor-pointer"
        role="button"
      >
        <span className="text-[11px] font-medium uppercase tracking-widest">
          Conversations
          {threadItems.length > 0 && (
            <span className="ml-1.5 text-white/20">{threadItems.length}</span>
          )}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNewThread();
            }}
            className="p-1 hover:bg-white/[0.06] rounded-md transition-colors"
            title="New conversation"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </div>

      {/* Thread list */}
      {expanded && (
        <div className="px-3 pb-3 max-h-[200px] overflow-y-auto space-y-0.5">
          {isLoading && (
            <div className="text-white/20 text-xs px-2 py-3 text-center">
              Loading...
            </div>
          )}

          {!isLoading && threadItems.length === 0 && (
            <div className="text-white/20 text-xs px-2 py-3 text-center">
              No conversations yet
            </div>
          )}

          {threadItems.map((thread) => {
            const isActive = currentThread?.id === thread.id;
            return (
              <button
                key={thread.id}
                onClick={() => handleSwitch(thread.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150 group ${
                  isActive
                    ? "bg-indigo-500/10 border border-indigo-500/20"
                    : "hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <MessageSquare
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? "text-indigo-400" : "text-white/20"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[12.5px] truncate ${
                      isActive
                        ? "text-white font-medium"
                        : "text-white/50 group-hover:text-white/70"
                    }`}
                  >
                    {thread.name || `Thread ${thread.id.substring(0, 8)}`}
                  </p>
                </div>
                <span className="text-[10px] text-white/20 shrink-0">
                  {formatRelativeDate(thread.createdAt)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
