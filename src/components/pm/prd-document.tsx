"use client";

import { useCallback } from "react";
import { z } from "zod";
import { useTamboStreamStatus } from "@tambo-ai/react";

export const prdDocumentSchema = z.object({
  title: z.string().describe("PRD title, e.g. 'Dark Mode Support'"),
  version: z.string().optional().describe("Document version, e.g. '1.0'"),
  author: z.string().optional().describe("Author name"),
  date: z.string().optional().describe("Date string, e.g. 'February 2026'"),
  overview: z.string().describe("Product overview and problem statement"),
  goals: z.array(z.string()).describe("Product goals"),
  userStories: z
    .array(
      z.object({
        asA: z.string(),
        iWant: z.string(),
        soThat: z.string(),
      })
    )
    .describe("User stories"),
  acceptanceCriteria: z.array(z.string()).describe("Acceptance criteria"),
  technicalSpec: z
    .string()
    .describe("Technical specification details"),
  timeline: z.string().optional().describe("Estimated timeline"),
  risks: z
    .array(z.string())
    .optional()
    .describe("Known risks and mitigations"),
  successMetrics: z
    .array(z.string())
    .optional()
    .describe("How success will be measured"),
});

export type PRDDocumentProps = z.infer<typeof prdDocumentSchema>;

export function PRDDocument({
  title,
  version,
  author,
  date,
  overview,
  goals,
  userStories,
  acceptanceCriteria,
  technicalSpec,
  timeline,
  risks,
  successMetrics,
}: PRDDocumentProps) {
  const { streamStatus } = useTamboStreamStatus<PRDDocumentProps>();

  const isStreaming = streamStatus.isStreaming;

  const generateMarkdown = useCallback(() => {
    const lines: string[] = [];
    lines.push(`# ${title ?? "Product Requirements Document"}`);
    lines.push("");
    if (version || author || date) {
      if (version) lines.push(`**Version:** ${version}`);
      if (author) lines.push(`**Author:** ${author}`);
      if (date) lines.push(`**Date:** ${date}`);
      lines.push("");
    }
    lines.push("---");
    lines.push("");

    if (overview) {
      lines.push("## Overview");
      lines.push(overview);
      lines.push("");
    }

    if (goals?.length) {
      lines.push("## Goals");
      goals.forEach((g, i) => lines.push(`${i + 1}. ${g}`));
      lines.push("");
    }

    if (userStories?.length) {
      lines.push("## User Stories");
      userStories.forEach((s) => {
        lines.push(
          `- As a **${s.asA}**, I want to **${s.iWant}** so that **${s.soThat}**`
        );
      });
      lines.push("");
    }

    if (acceptanceCriteria?.length) {
      lines.push("## Acceptance Criteria");
      acceptanceCriteria.forEach((c) => lines.push(`- [ ] ${c}`));
      lines.push("");
    }

    if (technicalSpec) {
      lines.push("## Technical Specification");
      lines.push(technicalSpec);
      lines.push("");
    }

    if (timeline) {
      lines.push("## Timeline");
      lines.push(timeline);
      lines.push("");
    }

    if (risks?.length) {
      lines.push("## Risks & Mitigations");
      risks.forEach((r) => lines.push(`- ${r}`));
      lines.push("");
    }

    if (successMetrics?.length) {
      lines.push("## Success Metrics");
      successMetrics.forEach((m) => lines.push(`- ${m}`));
      lines.push("");
    }

    return lines.join("\n");
  }, [
    title,
    version,
    author,
    date,
    overview,
    goals,
    userStories,
    acceptanceCriteria,
    technicalSpec,
    timeline,
    risks,
    successMetrics,
  ]);

  const handleDownload = useCallback(() => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title ?? "prd").toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generateMarkdown, title]);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
      {/* Document Header */}
      <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-b border-slate-700 px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Product Requirements Document
            </div>
            <h2 className="text-white text-2xl font-bold">
              {title ?? "Loading..."}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              {version && <span>v{version}</span>}
              {author && <span>{author}</span>}
              {date && <span>{date}</span>}
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={isStreaming}
            className={`font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg text-sm shrink-0 ${
              isStreaming
                ? "bg-white/[0.06] text-white/30 cursor-wait"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isStreaming ? "Generating..." : "Download .md"}
          </button>
        </div>
      </div>

      {/* Document Body */}
      <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
        {/* Overview */}
        {overview && (
          <Section title="Overview">
            <p className="text-gray-300 text-sm leading-relaxed">{overview}</p>
          </Section>
        )}

        {/* Goals */}
        {goals && goals.length > 0 && (
          <Section title="Goals">
            <ol className="list-decimal list-inside space-y-2">
              {goals.map((goal, i) => (
                <li key={i} className="text-gray-300 text-sm">
                  {goal}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* User Stories */}
        {userStories && userStories.length > 0 && (
          <Section title="User Stories">
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
          </Section>
        )}

        {/* Acceptance Criteria */}
        {acceptanceCriteria && acceptanceCriteria.length > 0 && (
          <Section title="Acceptance Criteria">
            <div className="space-y-2">
              {acceptanceCriteria.map((criteria, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-gray-300 text-sm"
                >
                  <div className="w-5 h-5 rounded border border-slate-600 flex items-center justify-center text-xs shrink-0">
                    {i + 1}
                  </div>
                  {criteria}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Technical Spec */}
        {technicalSpec && (
          <Section title="Technical Specification">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {technicalSpec}
              </p>
            </div>
          </Section>
        )}

        {/* Timeline */}
        {timeline && (
          <Section title="Timeline">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-gray-300 text-sm">{timeline}</p>
            </div>
          </Section>
        )}

        {/* Risks */}
        {risks && risks.length > 0 && (
          <Section title="Risks & Mitigations">
            <div className="space-y-2">
              {risks.map((risk, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-gray-300 text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  {risk}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Success Metrics */}
        {successMetrics && successMetrics.length > 0 && (
          <Section title="Success Metrics">
            <div className="space-y-2">
              {successMetrics.map((metric, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-gray-300 text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  {metric}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-white font-bold text-lg mb-3 pb-2 border-b border-slate-700/50">
        {title}
      </h3>
      {children}
    </div>
  );
}
