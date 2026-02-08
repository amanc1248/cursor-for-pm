"use client";

import { components, tools, contextHelpers } from "@/lib/tambo";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { TamboProvider } from "@tambo-ai/react";

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
    >
      {children}
    </TamboProvider>
  );
}
