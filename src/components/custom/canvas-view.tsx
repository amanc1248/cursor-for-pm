"use client";

import { useTamboThread } from "@tambo-ai/react";

export function CanvasView() {
  const { thread } = useTamboThread();

  const renderedComponents = thread?.messages
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
          {/* Show the latest component prominently */}
          {latestComponent.component}

          {/* Show older components below, faded */}
          {renderedComponents.length > 1 && (
            <div className="space-y-6 pt-6 border-t border-slate-800">
              <h3 className="text-sm font-medium text-gray-500">
                Previous Results
              </h3>
              {renderedComponents
                .slice(0, -1)
                .reverse()
                .map((item) => (
                  <div key={item.id} className="opacity-60 hover:opacity-100 transition-opacity">
                    {item.component}
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Ready to analyze
            </h3>
            <p className="text-gray-400">
              Ask me to analyze feedback, show themes, or prioritize features
              to see visualizations here.
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <p>Try: &ldquo;Analyze this customer feedback&rdquo;</p>
              <p>Or: &ldquo;What should we build next quarter?&rdquo;</p>
              <p>Or: &ldquo;Show me details for dark mode feature&rdquo;</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
