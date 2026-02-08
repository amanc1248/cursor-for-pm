import { NextRequest, NextResponse } from "next/server";
import { getGoogleCredentials } from "@/lib/auth/tokens";

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string> {
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await resp.json();
  if (data.error) {
    throw new Error(`Google token error: ${data.error_description}`);
  }
  return data.access_token;
}

function gcalHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

// POST /api/calendar — create an event
export async function POST(req: NextRequest) {
  try {
    const creds = await getGoogleCredentials();
    if (
      !creds.connected ||
      !creds.clientId ||
      !creds.clientSecret ||
      !creds.refreshToken
    ) {
      return NextResponse.json(
        { error: "Google Calendar not connected. Go to Settings to connect your Google account." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, startTime, endTime, attendees, location } =
      body;

    const accessToken = await getAccessToken(
      creds.clientId,
      creds.clientSecret,
      creds.refreshToken
    );

    const event: Record<string, unknown> = {
      summary: title,
      description: description ?? "",
      start: {
        dateTime: startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    if (location) event.location = location;
    if (attendees && attendees.length > 0) {
      event.attendees = attendees.map((email: string) => ({ email }));
    }

    const resp = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: gcalHeaders(accessToken),
        body: JSON.stringify(event),
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      console.error("Google Calendar create error:", resp.status, err);
      return NextResponse.json(
        { error: `Calendar API error: ${resp.status}`, details: err },
        { status: resp.status }
      );
    }

    const data = await resp.json();

    return NextResponse.json({
      eventId: data.id,
      title: data.summary,
      description: data.description ?? "",
      startTime: data.start?.dateTime ?? data.start?.date,
      endTime: data.end?.dateTime ?? data.end?.date,
      attendees: (data.attendees ?? []).map(
        (a: { email: string }) => a.email
      ),
      location: data.location ?? "",
      htmlLink: data.htmlLink,
      status: "confirmed",
    });
  } catch (error) {
    console.error("Calendar create route error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create event",
      },
      { status: 500 }
    );
  }
}

// GET /api/calendar?days=7 — list upcoming events
export async function GET(req: NextRequest) {
  try {
    const creds = await getGoogleCredentials();
    if (
      !creds.connected ||
      !creds.clientId ||
      !creds.clientSecret ||
      !creds.refreshToken
    ) {
      return NextResponse.json(
        { error: "Google Calendar not connected. Go to Settings to connect your Google account." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days") ?? "7");
    const maxResults = searchParams.get("maxResults") ?? "20";

    const accessToken = await getAccessToken(
      creds.clientId,
      creds.clientSecret,
      creds.refreshToken
    );

    const timeMin = new Date().toISOString();
    const timeMax = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    ).toISOString();

    const params = new URLSearchParams({
      timeMin,
      timeMax,
      maxResults,
      singleEvents: "true",
      orderBy: "startTime",
    });

    const resp = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: gcalHeaders(accessToken) }
    );

    if (!resp.ok) {
      const err = await resp.text();
      console.error("Google Calendar list error:", resp.status, err);
      return NextResponse.json(
        { error: `Calendar API error: ${resp.status}` },
        { status: resp.status }
      );
    }

    const data = await resp.json();

    const events = (data.items ?? []).map(
      (e: {
        id: string;
        summary?: string;
        description?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
        attendees?: { email: string; responseStatus?: string }[];
        location?: string;
        htmlLink?: string;
        status?: string;
      }) => ({
        eventId: e.id,
        title: e.summary ?? "(No title)",
        description: e.description ?? "",
        startTime: e.start?.dateTime ?? e.start?.date ?? "",
        endTime: e.end?.dateTime ?? e.end?.date ?? "",
        attendees: (e.attendees ?? []).map((a) => a.email),
        location: e.location ?? "",
        htmlLink: e.htmlLink ?? "",
        status: e.status ?? "confirmed",
      })
    );

    return NextResponse.json({ events, total: events.length });
  } catch (error) {
    console.error("Calendar list route error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list events",
      },
      { status: 500 }
    );
  }
}

// PUT /api/calendar — check availability (freebusy)
export async function PUT(req: NextRequest) {
  try {
    const creds = await getGoogleCredentials();
    if (
      !creds.connected ||
      !creds.clientId ||
      !creds.clientSecret ||
      !creds.refreshToken
    ) {
      return NextResponse.json(
        { error: "Google Calendar not connected. Go to Settings to connect your Google account." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { startTime, endTime } = body;

    const accessToken = await getAccessToken(
      creds.clientId,
      creds.clientSecret,
      creds.refreshToken
    );

    const resp = await fetch(
      "https://www.googleapis.com/calendar/v3/freeBusy",
      {
        method: "POST",
        headers: gcalHeaders(accessToken),
        body: JSON.stringify({
          timeMin: startTime,
          timeMax: endTime,
          items: [{ id: "primary" }],
        }),
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      console.error("Google Calendar freebusy error:", resp.status, err);
      return NextResponse.json(
        { error: `Calendar API error: ${resp.status}` },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    const busy =
      data.calendars?.primary?.busy?.map(
        (b: { start: string; end: string }) => ({
          start: b.start,
          end: b.end,
        })
      ) ?? [];

    return NextResponse.json({
      startTime,
      endTime,
      busySlots: busy,
      totalBusySlots: busy.length,
    });
  } catch (error) {
    console.error("Calendar freebusy route error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to check availability",
      },
      { status: 500 }
    );
  }
}
