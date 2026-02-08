import { NextResponse } from "next/server";
import {
  getJiraCredentials,
  getSlackCredentials,
  getGoogleCredentials,
  getGitHubCredentials,
} from "@/lib/auth/tokens";

const safe = async <T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    console.error(`[auth/status] ${label} error:`, err);
    return fallback;
  }
};

export async function GET() {
  const [jira, slack, google, github] = await Promise.all([
    safe("jira", getJiraCredentials, { connected: false, mode: "none" as const }),
    safe("slack", getSlackCredentials, { connected: false }),
    safe("google", getGoogleCredentials, { connected: false }),
    safe("github", getGitHubCredentials, { connected: false }),
  ]);

  console.log("[auth/status] results:", {
    jira: jira.connected,
    slack: slack.connected,
    google: google.connected,
    github: github.connected,
  });

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
