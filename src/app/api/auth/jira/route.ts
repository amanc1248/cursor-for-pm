import { NextResponse } from "next/server";

const JIRA_OAUTH_CLIENT_ID = process.env.JIRA_OAUTH_CLIENT_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET() {
  if (!JIRA_OAUTH_CLIENT_ID) {
    return NextResponse.json(
      { error: "JIRA_OAUTH_CLIENT_ID not configured" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    audience: "api.atlassian.com",
    client_id: JIRA_OAUTH_CLIENT_ID,
    scope:
      "read:jira-work write:jira-work read:jira-user offline_access",
    redirect_uri: `${APP_URL}/api/auth/jira/callback`,
    response_type: "code",
    prompt: "consent",
    state: crypto.randomUUID(),
  });

  return NextResponse.redirect(
    `https://auth.atlassian.com/authorize?${params.toString()}`
  );
}
