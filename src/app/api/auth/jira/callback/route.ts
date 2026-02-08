import { NextRequest, NextResponse } from "next/server";
import { setTokenCookieOnResponse } from "@/lib/auth/cookies";

const JIRA_OAUTH_CLIENT_ID = process.env.JIRA_OAUTH_CLIENT_ID!;
const JIRA_OAUTH_CLIENT_SECRET = process.env.JIRA_OAUTH_CLIENT_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    // Exchange code for tokens
    const tokenResp = await fetch("https://auth.atlassian.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: JIRA_OAUTH_CLIENT_ID,
        client_secret: JIRA_OAUTH_CLIENT_SECRET,
        code,
        redirect_uri: `${APP_URL}/api/auth/jira/callback`,
      }),
    });

    const tokenData = await tokenResp.json();
    console.log("[jira/callback] token exchange status:", tokenResp.status, "has access_token:", !!tokenData.access_token);

    if (tokenData.error || !tokenData.access_token) {
      console.error("[jira/callback] token error:", tokenData);
      return NextResponse.redirect(
        `${APP_URL}/settings?error=jira_token_failed`
      );
    }

    // Get accessible resources (cloudId + site name)
    const resourcesResp = await fetch(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    const resources = await resourcesResp.json();
    console.log("[jira/callback] resources count:", resources.length);

    if (!resources.length) {
      return NextResponse.redirect(
        `${APP_URL}/settings?error=no_jira_sites`
      );
    }

    const site = resources[0];

    const response = NextResponse.redirect(
      `${APP_URL}/settings?connected=jira`
    );

    setTokenCookieOnResponse(response, "jira_tokens", {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      cloudId: site.id,
      siteName: site.name,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    });

    console.log("[jira/callback] cookie set, redirecting to settings");
    return response;
  } catch (err) {
    console.error("[jira/callback] unexpected error:", err);
    return NextResponse.redirect(
      `${APP_URL}/settings?error=jira_callback_error`
    );
  }
}
