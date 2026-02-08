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

    if (tokenData.error || !tokenData.access_token) {
      console.error("Jira OAuth token error:", tokenData);
      return NextResponse.redirect(
        `${APP_URL}/settings?error=jira_auth_failed`
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

    if (!resources.length) {
      return NextResponse.redirect(
        `${APP_URL}/settings?error=no_jira_sites`
      );
    }

    const site = resources[0];

    // Use NextResponse with explicit status 302 and location header
    const redirectUrl = `${APP_URL}/settings?connected=jira`;
    const response = new NextResponse(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });

    setTokenCookieOnResponse(response, "jira_tokens", {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      cloudId: site.id,
      siteName: site.name,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    });

    return response;
  } catch (err) {
    console.error("Jira callback error:", err);
    return NextResponse.redirect(
      `${APP_URL}/settings?error=jira_auth_failed`
    );
  }
}
