import { NextResponse } from "next/server";

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET() {
  if (!SLACK_CLIENT_ID) {
    return NextResponse.json(
      { error: "SLACK_CLIENT_ID not configured" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: SLACK_CLIENT_ID,
    scope: "chat:write,chat:write.public,channels:read",
    redirect_uri: `${APP_URL}/api/auth/slack/callback`,
    state: crypto.randomUUID(),
  });

  return NextResponse.redirect(
    `https://slack.com/oauth/v2/authorize?${params.toString()}`
  );
}
