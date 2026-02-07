import { z } from "zod";

export const createJiraTicketSchema = z.object({
  title: z.string().describe("Ticket title/summary"),
  description: z.string().describe("Ticket description with context"),
  type: z
    .enum(["Story", "Task", "Bug", "Epic", "Feature"])
    .describe("Issue type"),
  priority: z
    .enum(["Highest", "High", "Medium", "Low", "Lowest"])
    .describe("Priority level"),
  labels: z
    .array(z.string())
    .optional()
    .describe("Labels to add, e.g. ['customer-feedback', 'q2']"),
  acceptanceCriteria: z
    .string()
    .optional()
    .describe("Acceptance criteria to include in the ticket"),
});

export const createJiraTicketOutputSchema = z.object({
  ticketId: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.string(),
  priority: z.string(),
  labels: z.array(z.string()),
  status: z.string(),
  createdAt: z.string(),
  url: z.string(),
});

export async function createJiraTicket(
  input: z.infer<typeof createJiraTicketSchema>
) {
  const response = await fetch("/api/jira", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error ?? `Failed to create Jira ticket (${response.status})`
    );
  }

  return response.json();
}
