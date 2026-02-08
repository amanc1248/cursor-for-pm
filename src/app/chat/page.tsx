"use client";

import { MessageList } from "@/components/custom/message-list";
import { MessageInput } from "@/components/custom/message-input";
import { CanvasView } from "@/components/custom/canvas-view";
import { ThreadSidebar } from "@/components/custom/thread-sidebar";
import Link from "next/link";
import { Settings } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-[#0a0a0f]">
      {/* LEFT — Chat Panel */}
      <div className="w-[420px] flex flex-col border-r border-white/[0.06] bg-[#0f0f17]/80 backdrop-blur-xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-semibold text-sm tracking-tight">
                  PM
                </span>
              </div>
              <div>
                <h1 className="text-white font-semibold text-[15px] tracking-[-0.01em]">
                  PMcrush
                </h1>
                <p className="text-white/40 text-[12px] tracking-wide">
                  Jira &middot; Slack &middot; Calendar &middot; GitHub
                </p>
              </div>
            </div>
            <Link
              href="/settings"
              className="p-2 text-white/30 hover:text-white/60 hover:bg-white/[0.06] rounded-xl transition-all duration-200"
              title="Integrations"
            >
              <Settings className="w-[18px] h-[18px]" />
            </Link>
          </div>
        </div>

        {/* Thread history */}
        <ThreadSidebar />

        {/* Messages */}
        <MessageList />

        {/* Input */}
        <MessageInput />
      </div>

      {/* RIGHT — Canvas */}
      <div className="flex-1 bg-[#0a0a0f]">
        <CanvasView />
      </div>
    </div>
  );
}
