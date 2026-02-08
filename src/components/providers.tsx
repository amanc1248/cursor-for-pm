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
        text: "Hi! I'm your PM Assistant. I can help you analyze feedback, prioritize features, write PRDs, manage Jira tickets, post Slack updates, and schedule meetings. What are you working on today?",
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
