"use client";

import { z } from "zod";

export const calendarEventPreviewSchema = z.object({
  eventId: z.string().optional().describe("Google Calendar event ID"),
  title: z.string().describe("Event title"),
  description: z.string().optional().describe("Event description or agenda"),
  startTime: z.string().describe("Start time in ISO 8601"),
  endTime: z.string().describe("End time in ISO 8601"),
  attendees: z
    .array(z.string())
    .optional()
    .describe("Attendee email addresses"),
  location: z.string().optional().describe("Location or meeting link"),
  htmlLink: z.string().optional().describe("Link to open in Google Calendar"),
  status: z.string().optional().describe("Event status"),
});

export type CalendarEventPreviewProps = z.infer<
  typeof calendarEventPreviewSchema
>;

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
  } catch {
    return "";
  }
}

export function CalendarEventPreview({
  title,
  description,
  startTime,
  endTime,
  attendees,
  location,
  htmlLink,
}: CalendarEventPreviewProps) {
  const duration = getDuration(startTime, endTime);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-8 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
          📅
        </div>
        <div>
          <div className="text-indigo-400 font-semibold text-sm">
            Calendar Event Created
          </div>
          <div className="text-gray-400 text-xs">Google Calendar</div>
        </div>
        {htmlLink && (
          <a
            href={htmlLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            Open in Calendar →
          </a>
        )}
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-4">
        {/* Title */}
        <h3 className="text-white text-xl font-bold">
          {title ?? "Loading..."}
        </h3>

        {/* Time */}
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/10 rounded-xl border border-indigo-500/20 px-4 py-3 flex-1">
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
              When
            </div>
            <div className="text-white text-sm font-medium">
              {formatDateTime(startTime)}
            </div>
            <div className="text-gray-400 text-xs mt-0.5">
              to {formatTime(endTime)} ({duration})
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-400 text-sm leading-relaxed">
            {description}
          </p>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Location */}
          {location && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 px-4 py-3">
              <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                Location
              </div>
              <span className="text-gray-300 text-sm">{location}</span>
            </div>
          )}

          {/* Attendees count */}
          {attendees && attendees.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 px-4 py-3">
              <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
                Attendees
              </div>
              <span className="text-gray-300 text-sm">
                {attendees.length} invited
              </span>
            </div>
          )}
        </div>

        {/* Attendee list */}
        {attendees && attendees.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              Invited:
            </span>
            {attendees.map((email, i) => (
              <span
                key={i}
                className="bg-slate-700/50 text-gray-300 px-2.5 py-1 rounded-md text-xs border border-slate-600/50"
              >
                {email}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
