import { NextResponse } from "next/server";
import {
  getJiraCredentials,
  getSlackCredentials,
  getGoogleCredentials,
  getGitHubCredentials,
} from "@/lib/auth/tokens";

const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

export async function GET() {
  const [jira, slack, google, github] = await Promise.all([
    safe(getJiraCredentials, { connected: false, mode: "none" as const }),
    safe(getSlackCredentials, { connected: false }),
    safe(getGoogleCredentials, { connected: false }),
    safe(getGitHubCredentials, { connected: false }),
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
