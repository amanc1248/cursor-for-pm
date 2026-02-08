"use client";

import { z } from "zod";
import { useTamboStreamStatus } from "@tambo-ai/react";

export const codeDependencyAnalysisSchema = z.object({
  repo: z.string().optional(),
  featureDescription: z.string().optional(),
  relatedFiles: z
    .array(
      z.object({
        path: z.string(),
        relevance: z.string(),
        snippet: z.string().optional(),
      })
    )
    .optional(),
  dependencies: z.array(z.string()).optional(),
  affectedData: z.array(z.string()).optional(),
  suggestedApproach: z.string().optional(),
  error: z.string().optional(),
});

type Props = z.infer<typeof codeDependencyAnalysisSchema>;

export function CodeDependencyAnalysis({
  repo,
  featureDescription,
  relatedFiles = [],
  dependencies = [],
  affectedData = [],
  suggestedApproach,
  error,
}: Props) {
  const { streamStatus } = useTamboStreamStatus<Props>();

  if (streamStatus.isPending) {
    return (
      <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 rounded bg-white/[0.06]" />
          <div className="h-4 w-48 rounded bg-white/[0.06]" />
        </div>
        <div className="space-y-3">
          <div className="h-3 w-full rounded bg-white/[0.04]" />
          <div className="h-3 w-3/4 rounded bg-white/[0.04]" />
          <div className="h-20 w-full rounded-lg bg-white/[0.03] mt-4" />
          <div className="h-20 w-full rounded-lg bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#12121a] border border-red-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-red-400 text-sm font-semibold">GitHub Not Connected</span>
        </div>
        <p className="text-white/50 text-[13px]">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#12121a] border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 mb-1">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/60" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-white/80 text-[14px] font-semibold">Code Dependency Analysis</span>
        </div>
        {repo && <p className="text-white/30 text-[12px] font-mono">{repo}</p>}
        {featureDescription && (
          <p className="text-white/50 text-[13px] mt-1">{featureDescription}</p>
        )}
      </div>

      {/* Related Files */}
      {relatedFiles.length > 0 && (
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h4 className="text-white/40 text-[11px] font-medium uppercase tracking-widest mb-3">
            Related Files ({relatedFiles.length})
          </h4>
          <div className="space-y-2">
            {relatedFiles.map((file, i) => (
              <div key={i} className="bg-white/[0.03] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-indigo-400 text-[12px] font-mono">{file.path}</span>
                </div>
                <p className="text-white/30 text-[11px]">{file.relevance}</p>
                {file.snippet && (
                  <pre className="mt-2 text-[11px] text-white/40 font-mono bg-black/30 rounded p-2 overflow-x-auto">
                    {file.snippet}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies & Affected Data side by side */}
      <div className="flex divide-x divide-white/[0.06]">
        {dependencies.length > 0 && (
          <div className="flex-1 px-5 py-4">
            <h4 className="text-white/40 text-[11px] font-medium uppercase tracking-widest mb-3">
              Dependencies ({dependencies.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {dependencies.map((dep, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-violet-500/10 text-violet-300 text-[11px] rounded-md font-mono"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}

        {affectedData.length > 0 && (
          <div className="flex-1 px-5 py-4">
            <h4 className="text-white/40 text-[11px] font-medium uppercase tracking-widest mb-3">
              Affected Data ({affectedData.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {affectedData.map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-amber-500/10 text-amber-300 text-[11px] rounded-md font-mono"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggested Approach */}
      {suggestedApproach && (
        <div className="px-5 py-4 border-t border-white/[0.06] bg-white/[0.02]">
          <h4 className="text-white/40 text-[11px] font-medium uppercase tracking-widest mb-2">
            Suggested Approach
          </h4>
          <p className="text-white/60 text-[13px] leading-relaxed">{suggestedApproach}</p>
        </div>
      )}
    </div>
  );
}
