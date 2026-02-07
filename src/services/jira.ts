import { z } from "zod";

export const createJiraTicketSchema = z.object({
  title: z.string().describe("Ticket title/summary"),
  description: z.string().describe("Ticket description with context"),
  type: z
    .enum(["Story", "Task", "Bug", "Epic"])
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
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 800));

  const ticketNum = Math.floor(Math.random() * 9000) + 1000;
  return {
    ticketId: `PM-${ticketNum}`,
    title: input.title,
    description: input.description,
    type: input.type,
    priority: input.priority,
    labels: input.labels ?? [],
    status: "To Do",
    createdAt: new Date().toISOString(),
    url: `https://yourcompany.atlassian.net/browse/PM-${ticketNum}`,
  };
}
