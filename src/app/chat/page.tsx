"use client";

import { MessageList } from "@/components/custom/message-list";
import { MessageInput } from "@/components/custom/message-input";
import { CanvasView } from "@/components/custom/canvas-view";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools, contextHelpers } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";

export default function Home() {
  const mcpServers = useMcpServers();

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      contextHelpers={contextHelpers}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
    >
      <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* LEFT SIDEBAR - Chat Interface */}
        <div className="w-96 flex flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          {/* Branded Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">PM</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">
                  Product Assistant
                </h1>
                <p className="text-gray-500 text-sm">AI-powered insights</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <MessageList />

          {/* Input */}
          <MessageInput />
        </div>

        {/* MAIN CONTENT - Canvas for Components */}
        <div className="flex-1">
          <CanvasView />
        </div>
      </div>
    </TamboProvider>
  );
}
