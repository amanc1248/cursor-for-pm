import { z } from "zod";

// ─── Create Event ────────────────────────────────────────────────────

export const createCalendarEventSchema = z.object({
  title: z.string().describe("Event title/summary"),
  description: z.string().optional().describe("Event description or agenda"),
  startTime: z
    .string()
    .describe("Start time in ISO 8601 format, e.g. '2026-02-10T14:00:00'"),
  endTime: z
    .string()
    .describe("End time in ISO 8601 format, e.g. '2026-02-10T15:00:00'"),
  attendees: z
    .array(z.string())
    .optional()
    .describe("List of attendee email addresses"),
  location: z
    .string()
    .optional()
    .describe("Event location or meeting link"),
});

export const createCalendarEventOutputSchema = z.object({
  eventId: z.string(),
  title: z.string(),
  description: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  attendees: z.array(z.string()),
  location: z.string(),
  htmlLink: z.string(),
  status: z.string(),
});

export async function createCalendarEvent(
  input: z.infer<typeof createCalendarEventSchema>
) {
  const response = await fetch("/api/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error ?? `Failed to create calendar event (${response.status})`
    );
  }

  return response.json();
}

// ─── List Events ─────────────────────────────────────────────────────

export const listCalendarEventsSchema = z.object({
  days: z
    .number()
    .optional()
    .describe("Number of days ahead to look (default 7)"),
  maxResults: z
    .number()
    .optional()
    .describe("Max events to return (default 20)"),
});

export const listCalendarEventsOutputSchema = z.object({
  events: z.array(
    z.object({
      eventId: z.string(),
      title: z.string(),
      description: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      attendees: z.array(z.string()),
      location: z.string(),
      htmlLink: z.string(),
      status: z.string(),
    })
  ),
  total: z.number(),
});

export async function listCalendarEvents(
  input: z.infer<typeof listCalendarEventsSchema>
) {
  const params = new URLSearchParams();
  if (input.days) params.set("days", String(input.days));
  if (input.maxResults) params.set("maxResults", String(input.maxResults));

  const response = await fetch(`/api/calendar?${params.toString()}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error ?? `Failed to list calendar events (${response.status})`
    );
  }

  return response.json();
}

// ─── Check Availability ──────────────────────────────────────────────

export const checkAvailabilitySchema = z.object({
  startTime: z
    .string()
    .describe(
      "Start of time range to check in ISO 8601 format, e.g. '2026-02-10T09:00:00'"
    ),
  endTime: z
    .string()
    .describe(
      "End of time range to check in ISO 8601 format, e.g. '2026-02-10T17:00:00'"
    ),
});

export const checkAvailabilityOutputSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  busySlots: z.array(
    z.object({
      start: z.string(),
      end: z.string(),
    })
  ),
  totalBusySlots: z.number(),
});

export async function checkAvailability(
  input: z.infer<typeof checkAvailabilitySchema>
) {
  const response = await fetch("/api/calendar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error ?? `Failed to check availability (${response.status})`
    );
  }

  return response.json();
}
