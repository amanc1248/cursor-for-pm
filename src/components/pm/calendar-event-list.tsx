"use client";

import { z } from "zod";

export const calendarEventListSchema = z.object({
  events: z
    .array(
      z.object({
        title: z.string().describe("Event title"),
        startTime: z.string().describe("Start time ISO 8601"),
        endTime: z.string().describe("End time ISO 8601"),
        attendees: z
          .array(z.string())
          .optional()
          .describe("Attendee emails"),
        location: z.string().optional().describe("Location"),
        htmlLink: z.string().optional().describe("Link to Google Calendar"),
      })
    )
    .describe("List of calendar events"),
  total: z.number().optional().describe("Total events"),
  label: z
    .string()
    .optional()
    .describe("Label for the list, e.g. 'Next 7 days'"),
});

export type CalendarEventListProps = z.infer<typeof calendarEventListSchema>;

function formatDay(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function getDuration(start: string, end: string) {
  try {
    const mins = Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 60000
    );
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
  } catch {
    return "";
  }
}

export function CalendarEventList({
  events,
  total,
  label,
}: CalendarEventListProps) {
  // Group events by day
  const grouped: Record<string, typeof events> = {};
  events?.forEach((e) => {
    const day = formatDay(e.startTime);
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(e);
  });

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm">
            📅
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Calendar</h3>
            {label && <p className="text-gray-400 text-xs">{label}</p>}
          </div>
        </div>
        <div className="bg-slate-700/50 px-3 py-1 rounded-lg text-gray-300 text-sm font-medium">
          {total ?? events?.length ?? 0} events
        </div>
      </div>

      {/* Events grouped by day */}
      <div className="divide-y divide-slate-700/30">
        {(!events || events.length === 0) && (
          <div className="px-8 py-12 text-center text-gray-500">
            No upcoming events found.
          </div>
        )}
        {Object.entries(grouped).map(([day, dayEvents]) => (
          <div key={day}>
            {/* Day header */}
            <div className="px-8 py-2 bg-slate-800/50">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                {day}
              </span>
            </div>
            {/* Events for this day */}
            {dayEvents.map((event, i) => (
              <a
                key={i}
                href={event.htmlLink ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-8 py-3 hover:bg-slate-700/20 transition-colors group"
              >
                {/* Time */}
                <div className="w-20 flex-shrink-0 text-right">
                  <div className="text-indigo-400 text-sm font-medium">
                    {formatTime(event.startTime)}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {getDuration(event.startTime, event.endTime)}
                  </div>
                </div>

                {/* Divider */}
                <div className="w-0.5 h-10 bg-indigo-500/30 rounded-full" />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate group-hover:text-indigo-300 transition-colors">
                    {event.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {event.location && (
                      <span className="text-gray-500 text-xs truncate">
                        {event.location}
                      </span>
                    )}
                    {event.attendees && event.attendees.length > 0 && (
                      <span className="text-gray-600 text-xs">
                        · {event.attendees.length} attendees
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
