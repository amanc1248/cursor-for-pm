"use client";

import { useTamboThread } from "@tambo-ai/react";

export function CanvasView() {
  const { thread } = useTamboThread();

  const renderedComponents =
    thread?.messages
      .filter((message) => message.renderedComponent)
      .map((message) => ({
        id: message.id,
        component: message.renderedComponent,
      })) ?? [];

  const latestComponent = renderedComponents[renderedComponents.length - 1];

  return (
    <div className="h-full overflow-y-auto p-8">
      {latestComponent ? (
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Latest — prominent */}
          <div className="animate-fade-in-up">{latestComponent.component}</div>

          {/* Previous — faded */}
          {renderedComponents.length > 1 && (
            <div className="space-y-6 pt-6 border-t border-white/[0.04]">
              <h3 className="text-[12px] font-medium text-white/25 uppercase tracking-widest">
                Previous
              </h3>
              {renderedComponents
                .slice(0, -1)
                .reverse()
                .map((item) => (
                  <div
                    key={item.id}
                    className="opacity-50 hover:opacity-100 transition-opacity duration-300"
                  >
                    {item.component}
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-sm">
            {/* Gradient orb */}
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-xl" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-white/[0.06] flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 opacity-60" />
              </div>
            </div>

            <h3 className="text-white/80 font-semibold text-[17px] tracking-[-0.01em] mb-2">
              Ready when you are
            </h3>
            <p className="text-white/30 text-[13px] leading-relaxed mb-8">
              Ask me to analyze feedback, prioritize features, create Jira
              tickets, or schedule meetings.
            </p>

            <div className="space-y-2">
              {[
                "What should we build next quarter?",
                "Show my in-progress Jira tickets",
                "Schedule a sprint planning for Monday",
              ].map((prompt, i) => (
                <p
                  key={i}
                  className="text-white/15 text-[12.5px] italic"
                >
                  &ldquo;{prompt}&rdquo;
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
