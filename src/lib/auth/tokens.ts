import { getTokenCookie, setTokenCookieOnResponse } from "./cookies";
import { NextResponse } from "next/server";

// ─── Jira ──────────────────────────────────────────────────

export interface JiraOAuthTokens {
  accessToken: string;
  refreshToken: string;
  cloudId: string;
  siteName: string;
  expiresAt: number; // epoch ms
}

export interface JiraCredentials {
  connected: boolean;
  mode: "oauth" | "basic" | "none";
  // OAuth mode
  accessToken?: string;
  cloudId?: string;
  siteName?: string;
  // Basic mode
  email?: string;
  apiToken?: string;
  domain?: string;
  projectKey?: string;
}

async function refreshJiraToken(
  tokens: JiraOAuthTokens
): Promise<{ tokens: JiraOAuthTokens; response?: NextResponse } | null> {
  try {
    const resp = await fetch("https://auth.atlassian.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: process.env.JIRA_OAUTH_CLIENT_ID,
        client_secret: process.env.JIRA_OAUTH_CLIENT_SECRET,
        refresh_token: tokens.refreshToken,
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return {
      tokens: {
        ...tokens,
        accessToken: data.access_token,
        refreshToken: data.refresh_token, // rotating refresh token
        expiresAt: Date.now() + data.expires_in * 1000,
      },
    };
  } catch {
    return null;
  }
}

export async function getJiraCredentials(): Promise<JiraCredentials> {
  // 1. Try cookie (OAuth)
  const tokens = await getTokenCookie<JiraOAuthTokens>("jira_tokens");
  if (tokens) {
    // Refresh if expired (with 60s buffer)
    if (tokens.expiresAt < Date.now() + 60_000) {
      const refreshed = await refreshJiraToken(tokens);
      if (refreshed) {
        // We'll save the refreshed token in the response via middleware
        // For now, return the refreshed access token
        return {
          connected: true,
          mode: "oauth",
          accessToken: refreshed.tokens.accessToken,
          cloudId: refreshed.tokens.cloudId,
          siteName: refreshed.tokens.siteName,
        };
      }
    }
    return {
      connected: true,
      mode: "oauth",
      accessToken: tokens.accessToken,
      cloudId: tokens.cloudId,
      siteName: tokens.siteName,
    };
  }

  // 2. Fall back to env vars (Basic Auth)
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;
  const domain = process.env.JIRA_DOMAIN;
  const projectKey = process.env.JIRA_PROJECT_KEY;

  if (email && apiToken && domain) {
    return {
      connected: true,
      mode: "basic",
      email,
      apiToken,
      domain,
      projectKey,
    };
  }

  return { connected: false, mode: "none" };
}

export function buildJiraRequest(
  creds: JiraCredentials,
  path: string
): { url: string; headers: Record<string, string> } {
  if (creds.mode === "oauth" && creds.accessToken && creds.cloudId) {
    return {
      url: `https://api.atlassian.com/ex/jira/${creds.cloudId}/rest/api/3${path}`,
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
  }
  if (creds.mode === "basic" && creds.email && creds.apiToken && creds.domain) {
    const auth = Buffer.from(`${creds.email}:${creds.apiToken}`).toString(
      "base64"
    );
    return {
      url: `https://${creds.domain}/rest/api/3${path}`,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
  }
  throw new Error("No Jira credentials available");
}

// ─── Slack ─────────────────────────────────────────────────

export interface SlackOAuthTokens {
  botToken: string;
  teamName: string;
  teamId: string;
}

export interface SlackCredentials {
  connected: boolean;
  botToken?: string;
  channelId?: string;
  teamName?: string;
}

export async function getSlackCredentials(): Promise<SlackCredentials> {
  // 1. Try cookie
  const tokens = await getTokenCookie<SlackOAuthTokens>("slack_tokens");
  if (tokens) {
    return {
      connected: true,
      botToken: tokens.botToken,
      teamName: tokens.teamName,
    };
  }

  // 2. Fall back to env vars
  const botToken = process.env.SLACK_BOT_TOKEN;
  const channelId = process.env.SLACK_CHANNEL_ID;

  if (botToken) {
    return { connected: true, botToken, channelId };
  }

  return { connected: false };
}

// ─── Google Calendar ───────────────────────────────────────

export interface GoogleOAuthTokens {
  refreshToken: string;
  email?: string;
}

export interface GoogleCredentials {
  connected: boolean;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  email?: string;
}

export async function getGoogleCredentials(): Promise<GoogleCredentials> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  // 1. Try cookie
  const tokens = await getTokenCookie<GoogleOAuthTokens>("google_tokens");
  if (tokens && clientId && clientSecret) {
    return {
      connected: true,
      clientId,
      clientSecret,
      refreshToken: tokens.refreshToken,
      email: tokens.email,
    };
  }

  // 2. Fall back to env vars
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (clientId && clientSecret && refreshToken) {
    return { connected: true, clientId, clientSecret, refreshToken };
  }

  return { connected: false };
}

// ─── Helper: save refreshed Jira tokens to response ───────

export async function saveRefreshedJiraTokens(
  response: NextResponse
): Promise<void> {
  const tokens = await getTokenCookie<JiraOAuthTokens>("jira_tokens");
  if (!tokens || tokens.expiresAt > Date.now() + 60_000) return;

  const refreshed = await refreshJiraToken(tokens);
  if (refreshed) {
    setTokenCookieOnResponse(response, "jira_tokens", { ...refreshed.tokens });
  }
}
