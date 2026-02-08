import { NextResponse } from "next/server";
import {
  getJiraCredentials,
  getSlackCredentials,
  getGoogleCredentials,
  getGitHubCredentials,
} from "@/lib/auth/tokens";

export async function GET() {
  const [jira, slack, google, github] = await Promise.all([
    getJiraCredentials(),
    getSlackCredentials(),
    getGoogleCredentials(),
    getGitHubCredentials(),
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
    github: {
      connected: github.connected,
      username: github.username,
    },
  });
}
