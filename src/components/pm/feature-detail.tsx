"use client";

import { useState } from "react";
import { z } from "zod";

export const featureDetailSchema = z.object({
  title: z.string().describe("Feature title"),
  description: z.string().describe("Brief feature description"),
  priority: z.number().min(1).max(100).describe("Priority score 1-100"),
  status: z
    .enum(["recommended", "quick-win", "consider"])
    .describe("Feature status category"),
  impact: z.enum(["High", "Medium", "Low"]).describe("Expected business impact"),
  effort: z.enum(["High", "Medium", "Low"]).describe("Development effort required"),
  mentions: z.number().describe("Number of customer mentions"),
  userStories: z
    .array(
      z.object({
        asA: z.string().describe("User role, e.g. 'power user'"),
        iWant: z.string().describe("Desired action"),
        soThat: z.string().describe("Expected benefit"),
      })
    )
    .describe("User stories in standard format"),
  acceptanceCriteria: z
    .array(z.string())
    .describe("List of acceptance criteria"),
  evidenceSummary: z
    .string()
    .describe("Summary of evidence supporting this feature"),
  customerQuotes: z
    .array(
      z.object({
        user: z.string().describe("Customer name or identifier"),
        text: z.string().describe("The actual customer quote"),
        source: z
          .string()
          .optional()
          .describe("Source: interview, support ticket, survey, etc."),
      })
    )
    .describe("Customer quotes supporting this feature"),
  technicalConsiderations: z
    .array(
      z.object({
        area: z
          .string()
          .describe("e.g., Frontend, Backend, Design, Infrastructure"),
        details: z.string().describe("Technical details for this area"),
      })
    )
    .describe("Technical implementation considerations"),
  dependencies: z
    .array(z.string())
    .optional()
    .describe("Dependencies and blockers"),
  estimatedTimeline: z
    .string()
    .optional()
    .describe("e.g., '5-7 days'"),
  teamSize: z
    .string()
    .optional()
    .describe("e.g., '1 designer + 2 engineers'"),
});

export type FeatureDetailProps = z.infer<typeof featureDetailSchema>;

type Tab = "overview" | "evidence" | "spec";

const statusConfig = {
  recommended: { label: "Recommended", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  "quick-win": { label: "Quick Win", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  consider: { label: "Consider", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
};

const impactColors = {
  High: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  Medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

export function FeatureDetail({
  title,
  description,
  priority,
  status,
  impact,
  effort,
  mentions,
  userStories,
  acceptanceCriteria,
  evidenceSummary,
  customerQuotes,
  technicalConsiderations,
  dependencies,
  estimatedTimeline,
  teamSize,
}: FeatureDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "evidence", label: "Evidence" },
    { key: "spec", label: "Specification" },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700 px-8 py-6">
        <div className="flex items-start gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg px-5 py-3 rounded-2xl shadow-lg shrink-0">
            {priority ?? "—"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {status && (
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full border ${statusConfig[status]?.bg ?? ""} ${statusConfig[status]?.color ?? "text-gray-400"}`}
                >
                  {statusConfig[status]?.label ?? status}
                </span>
              )}
              {mentions != null && (
                <span className="text-gray-400 text-sm">
                  {mentions} customer mentions
                </span>
              )}
            </div>
            <h2 className="text-white text-2xl font-bold mb-1 truncate">
              {title ?? "Loading..."}
            </h2>
            {description && (
              <p className="text-gray-400 text-sm">{description}</p>
            )}
          </div>
        </div>

        {/* Impact / Effort badges */}
        <div className="flex items-center gap-3 mt-4">
          {impact && (
            <div
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${impactColors[impact]}`}
            >
              Impact: {impact}
            </div>
          )}
          {effort && (
            <div
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${impactColors[effort]}`}
            >
              Effort: {effort}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-8 pt-4 border-b border-slate-700/50">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 text-sm ${
              activeTab === tab.key
                ? "text-blue-400 border-blue-400"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-8 max-h-[60vh] overflow-y-auto">
        {activeTab === "overview" && (
          <OverviewTab
            userStories={userStories}
            acceptanceCriteria={acceptanceCriteria}
            impact={impact}
            effort={effort}
            mentions={mentions}
          />
        )}
        {activeTab === "evidence" && (
          <EvidenceTab
            evidenceSummary={evidenceSummary}
            customerQuotes={customerQuotes}
            mentions={mentions}
          />
        )}
        {activeTab === "spec" && (
          <SpecTab
            technicalConsiderations={technicalConsiderations}
            dependencies={dependencies}
            estimatedTimeline={estimatedTimeline}
            teamSize={teamSize}
          />
        )}
      </div>
    </div>
  );
}

function OverviewTab({
  userStories,
  acceptanceCriteria,
  impact,
  effort,
  mentions,
}: Pick<
  FeatureDetailProps,
  "userStories" | "acceptanceCriteria" | "impact" | "effort" | "mentions"
>) {
  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricBox label="Impact" value={impact ?? "—"} />
        <MetricBox label="Effort" value={effort ?? "—"} />
        <MetricBox label="User Mentions" value={String(mentions ?? "—")} />
      </div>

      {/* User Stories */}
      {userStories && userStories.length > 0 && (
        <div>
          <h3 className="text-white font-bold text-lg mb-3">User Stories</h3>
          <div className="space-y-2">
            {userStories.map((story, i) => (
              <div
                key={i}
                className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
              >
                <p className="text-gray-300 text-sm">
                  As a{" "}
                  <span className="text-blue-400 font-semibold">
                    {story.asA}
                  </span>
                  , I want to{" "}
                  <span className="text-blue-400 font-semibold">
                    {story.iWant}
                  </span>{" "}
                  so that{" "}
                  <span className="text-blue-400 font-semibold">
                    {story.soThat}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acceptance Criteria */}
      {acceptanceCriteria && acceptanceCriteria.length > 0 && (
        <div>
          <h3 className="text-white font-bold text-lg mb-3">
            Acceptance Criteria
          </h3>
          <div className="space-y-2">
            {acceptanceCriteria.map((criteria, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-gray-300 text-sm"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs shrink-0">
                  ✓
                </div>
                {criteria}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EvidenceTab({
  evidenceSummary,
  customerQuotes,
  mentions,
}: Pick<FeatureDetailProps, "evidenceSummary" | "customerQuotes" | "mentions">) {
  return (
    <div className="space-y-4">
      {/* Evidence Summary */}
      {evidenceSummary && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="text-blue-400 font-semibold mb-2">
            Evidence Summary
          </div>
          <p className="text-gray-300 text-sm">
            {evidenceSummary}
            {mentions != null && (
              <span className="text-white font-bold">
                {" "}
                ({mentions} customer mentions)
              </span>
            )}
          </p>
        </div>
      )}

      {/* Customer Quotes */}
      {customerQuotes && customerQuotes.length > 0 && (
        <>
          <h3 className="text-white font-bold text-lg">Customer Quotes</h3>
          {customerQuotes.map((quote, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-5 border border-slate-700/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                  {quote.user?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <div className="text-white font-semibold">{quote.user}</div>
                  {quote.source && (
                    <div className="text-gray-500 text-xs">{quote.source}</div>
                  )}
                </div>
              </div>
              <p className="text-gray-300 italic">&ldquo;{quote.text}&rdquo;</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function SpecTab({
  technicalConsiderations,
  dependencies,
  estimatedTimeline,
  teamSize,
}: Pick<
  FeatureDetailProps,
  "technicalConsiderations" | "dependencies" | "estimatedTimeline" | "teamSize"
>) {
  const areaColors: Record<string, string> = {
    Frontend: "text-blue-400",
    Backend: "text-purple-400",
    Design: "text-emerald-400",
    Infrastructure: "text-amber-400",
  };

  return (
    <div className="space-y-6">
      {/* Technical Considerations */}
      {technicalConsiderations && technicalConsiderations.length > 0 && (
        <div>
          <h3 className="text-white font-bold text-lg mb-3">
            Technical Considerations
          </h3>
          <div className="space-y-3">
            {technicalConsiderations.map((item, i) => (
              <div
                key={i}
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
              >
                <div
                  className={`font-semibold mb-1 ${areaColors[item.area] ?? "text-gray-400"}`}
                >
                  {item.area}
                </div>
                <p className="text-gray-300 text-sm">{item.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies */}
      {dependencies && dependencies.length > 0 && (
        <div>
          <h3 className="text-white font-bold text-lg mb-3">Dependencies</h3>
          <div className="space-y-2">
            {dependencies.map((dep, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-gray-300 text-sm"
              >
                <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                {dep}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {estimatedTimeline && (
        <div>
          <h3 className="text-white font-bold text-lg mb-3">
            Estimated Timeline
          </h3>
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-semibold">Total Effort</span>
              <span className="text-2xl font-bold text-blue-400">
                {estimatedTimeline}
              </span>
            </div>
            {teamSize && (
              <div className="text-gray-400 text-sm">{teamSize}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className="text-white text-2xl font-bold">{value}</div>
    </div>
  );
}
