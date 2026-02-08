"use client";

import { components, tools, contextHelpers } from "@/lib/tambo";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { TamboProvider, type InitialTamboThreadMessage } from "@tambo-ai/react";

const initialMessages: InitialTamboThreadMessage[] = [
  {
    role: "assistant",
    content: [
      {
        type: "text",
        text: "Hi! I'm PMcrush. Hook up Jira, Slack, Calendar & GitHub in Settings, upload customer feedback, and I'll handle the rest — PRDs, tickets, roadmaps, sprint planning, and more. What are you working on?",
      },
    ],
  },
];

export function Providers({ children }: { children: React.ReactNode }) {
  const mcpServers = useMcpServers();

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      contextHelpers={contextHelpers}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
      initialMessages={initialMessages}
    >
      {children}
    </TamboProvider>
  );
}
