import { NextResponse } from "next/server";
import {
  getJiraCredentials,
  getSlackCredentials,
  getGoogleCredentials,
} from "@/lib/auth/tokens";

export async function GET() {
  const [jira, slack, google] = await Promise.all([
    getJiraCredentials(),
    getSlackCredentials(),
    getGoogleCredentials(),
  ]);

  return NextResponse.json({
    jira: {
      connected: jira.connected,
      mode: jira.mode,
      siteName: jira.mode === "oauth" ? jira.siteName : jira.domain,
    },
    slack: {
      connected: slack.connected,
      teamName: slack.teamName,
    },
    google: {
      connected: google.connected,
      email: google.email,
    },
  });
}
