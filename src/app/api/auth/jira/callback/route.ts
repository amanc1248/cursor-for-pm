import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/auth/crypto";

const JIRA_OAUTH_CLIENT_ID = process.env.JIRA_OAUTH_CLIENT_ID!;
const JIRA_OAUTH_CLIENT_SECRET = process.env.JIRA_OAUTH_CLIENT_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
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
      console.error("[jira/callback] token error:", tokenData);
      return NextResponse.redirect(`${APP_URL}/settings?error=jira_token_failed`);
    }

    const resourcesResp = await fetch(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const resources = await resourcesResp.json();

    if (!resources.length) {
      return NextResponse.redirect(`${APP_URL}/settings?error=no_jira_sites`);
    }

    const site = resources[0];

    // Only store refresh token + metadata (NOT the huge JWT access token)
    // This keeps the cookie/URL payload tiny (~150 bytes vs ~2700 bytes)
    const encrypted = encrypt(
      JSON.stringify({
        refreshToken: tokenData.refresh_token,
        cloudId: site.id,
        siteName: site.name,
      })
    );

    const redirectUrl = new URL(`${APP_URL}/settings`);
    redirectUrl.searchParams.set("connected", "jira");
    redirectUrl.searchParams.set("pending_token", encrypted);
    redirectUrl.searchParams.set("service", "jira");

    return NextResponse.redirect(redirectUrl.toString());
  } catch (err) {
    console.error("[jira/callback] error:", err);
    return NextResponse.redirect(`${APP_URL}/settings?error=jira_callback_error`);
  }
}
