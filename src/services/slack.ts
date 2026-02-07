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
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 600));

  return {
    messageId: `msg-${Date.now()}`,
    channel: input.channel,
    message: input.message,
    timestamp: new Date().toISOString(),
    status: "sent",
  };
}
