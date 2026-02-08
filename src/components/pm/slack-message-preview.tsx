"use client";

import { z } from "zod";

export const slackMessagePreviewSchema = z.object({
  channel: z.string().describe("Slack channel, e.g. '#product-updates'"),
  message: z.string().describe("The posted message text"),
  featureTitle: z
    .string()
    .optional()
    .describe("Feature title that was shared"),
  priority: z.string().optional().describe("Priority level"),
  mentions: z.number().optional().describe("Customer mention count"),
  timestamp: z.string().optional().describe("When the message was posted"),
  status: z
    .enum(["sent", "pending", "failed"])
    .describe("Message delivery status"),
});

export type SlackMessagePreviewProps = z.infer<
  typeof slackMessagePreviewSchema
>;

export function SlackMessagePreview({
  channel,
  message,
  featureTitle,
  priority,
  mentions,
  timestamp,
  status,
}: SlackMessagePreviewProps) {
  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "just now";

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden">
      {/* Success Banner */}
      <div className="bg-purple-500/10 border-b border-purple-500/20 px-8 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-lg">
          #
        </div>
        <div>
          <div className="text-purple-400 font-semibold text-sm">
            {status === "sent" ? "Posted to Slack" : "Posting to Slack..."}
          </div>
          <div className="text-gray-400 text-xs">
            {channel ?? "#product-updates"}
          </div>
        </div>
        {status === "sent" && (
          <div className="ml-auto text-emerald-400 text-sm font-medium">
            Delivered ✓
          </div>
        )}
      </div>

      {/* Slack-style Message */}
      <div className="px-8 py-6">
        <div className="flex items-start gap-3">
          {/* Bot Avatar */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            PM
          </div>

          <div className="flex-1 min-w-0">
            {/* Bot Name + Time */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-bold text-sm">
                PMcrush
              </span>
              <span className="bg-slate-700/50 text-gray-400 px-1.5 py-0.5 rounded text-[10px] font-medium">
                APP
              </span>
              <span className="text-gray-500 text-xs">{time}</span>
            </div>

            {/* Message Block */}
            <div className="space-y-3">
              {/* Feature Header (if present) */}
              {featureTitle && (
                <div className="border-l-4 border-blue-500 pl-3">
                  <div className="text-white font-semibold">
                    {featureTitle}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    {priority && <span>Priority: {priority}</span>}
                    {mentions != null && (
                      <span>{mentions} customer mentions</span>
                    )}
                  </div>
                </div>
              )}

              {/* Message Text */}
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
