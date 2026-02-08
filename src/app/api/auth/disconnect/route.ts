import { NextRequest, NextResponse } from "next/server";
import { clearTokenCookieOnResponse, type ServiceName } from "@/lib/auth/cookies";

const serviceMap: Record<string, ServiceName> = {
  jira: "jira_tokens",
  slack: "slack_tokens",
  google: "google_tokens",
  github: "github_tokens",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { service } = body;

  const cookieName = serviceMap[service];
  if (!cookieName) {
    return NextResponse.json(
      { error: "Invalid service. Use: jira, slack, google, or github" },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ disconnected: service });
  clearTokenCookieOnResponse(response, cookieName);

  // Set a "disabled" flag so env var fallbacks are skipped
  response.cookies.set(`${service}_disabled`, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
