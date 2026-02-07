import { z } from "zod";

// ─── Create Ticket ───────────────────────────────────────────────────

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

// ─── Search Tickets ──────────────────────────────────────────────────

export const searchJiraTicketsSchema = z.object({
  status: z
    .enum(["To Do", "In Progress", "In Review", "Done"])
    .optional()
    .describe("Filter by status"),
  type: z
    .enum(["Story", "Task", "Bug", "Epic", "Feature"])
    .optional()
    .describe("Filter by issue type"),
  assignee: z
    .string()
    .optional()
    .describe("Filter by assignee email, or 'unassigned'"),
  maxResults: z
    .number()
    .optional()
    .describe("Max results to return (default 20)"),
});

export const searchJiraTicketsOutputSchema = z.object({
  tickets: z.array(
    z.object({
      ticketId: z.string(),
      title: z.string(),
      status: z.string(),
      priority: z.string(),
      type: z.string(),
      assignee: z.string(),
      assigneeEmail: z.string().nullable(),
      labels: z.array(z.string()),
      updatedAt: z.string(),
      url: z.string(),
    })
  ),
  total: z.number(),
});

export async function searchJiraTickets(
  input: z.infer<typeof searchJiraTicketsSchema>
) {
  const params = new URLSearchParams();
  if (input.status) params.set("status", input.status);
  if (input.type) params.set("type", input.type);
  if (input.assignee) params.set("assignee", input.assignee);
  if (input.maxResults) params.set("maxResults", String(input.maxResults));

  const response = await fetch(`/api/jira?${params.toString()}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error ?? `Failed to search Jira tickets (${response.status})`
    );
  }

  return response.json();
}

// ─── Assign Ticket ───────────────────────────────────────────────────

export const assignJiraTicketSchema = z.object({
  ticketId: z
    .string()
    .describe("Jira ticket key, e.g. 'KAN-4'"),
  assigneeEmail: z
    .string()
    .describe("Email of the person to assign the ticket to"),
});

export const assignJiraTicketOutputSchema = z.object({
  ticketId: z.string(),
  assignee: z.string(),
  assigneeEmail: z.string(),
  action: z.string(),
  url: z.string(),
});

export async function assignJiraTicket(
  input: z.infer<typeof assignJiraTicketSchema>
) {
  const response = await fetch("/api/jira", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, action: "assign" }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error ?? `Failed to assign Jira ticket (${response.status})`
    );
  }

  return response.json();
}

// ─── Update Ticket ───────────────────────────────────────────────────

export const updateJiraTicketSchema = z.object({
  ticketId: z
    .string()
    .describe("Jira ticket key, e.g. 'KAN-4'"),
  summary: z.string().optional().describe("New title/summary"),
  priority: z
    .enum(["Highest", "High", "Medium", "Low", "Lowest"])
    .optional()
    .describe("New priority level"),
  status: z
    .enum(["To Do", "In Progress", "In Review", "Done"])
    .optional()
    .describe("Transition to this status"),
  labels: z
    .array(z.string())
    .optional()
    .describe("Replace labels with these"),
});

export const updateJiraTicketOutputSchema = z.object({
  ticketId: z.string(),
  action: z.string(),
  changes: z.object({
    summary: z.string().optional(),
    priority: z.string().optional(),
    status: z.string().optional(),
    labels: z.array(z.string()).optional(),
  }),
  url: z.string(),
});

export async function updateJiraTicket(
  input: z.infer<typeof updateJiraTicketSchema>
) {
  const response = await fetch("/api/jira", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, action: "update" }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error ?? `Failed to update Jira ticket (${response.status})`
    );
  }

  return response.json();
}
