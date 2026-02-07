import { z } from "zod";

export const postToSlackSchema = z.object({
  channel: z
    .string()
    .describe("Slack channel name, e.g. '#product-updates'"),
  message: z.string().describe("The message text to post"),
  featureTitle: z
    .string()
    .optional()
    .describe("Feature title for formatting"),
  priority: z
    .string()
    .optional()
    .describe("Priority level to include"),
  mentions: z
    .number()
    .optional()
    .describe("Customer mention count to include"),
});

export const postToSlackOutputSchema = z.object({
  messageId: z.string(),
  channel: z.string(),
  message: z.string(),
  timestamp: z.string(),
  status: z.string(),
});

export async function postToSlack(
  input: z.infer<typeof postToSlackSchema>
) {
  const response = await fetch("/api/slack", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error ?? `Failed to post to Slack (${response.status})`
    );
  }

  return response.json();
}
