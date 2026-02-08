import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/auth/crypto";

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID!;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const tokenResp = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      code,
      redirect_uri: `${APP_URL}/api/auth/slack/callback`,
    }),
  });

  const data = await tokenResp.json();

  if (!data.ok) {
    console.error("Slack OAuth error:", data.error);
    return NextResponse.redirect(`${APP_URL}/settings?error=slack_auth_failed`);
  }

  const encrypted = encrypt(
    JSON.stringify({
      botToken: data.access_token,
      teamName: data.team?.name ?? "Workspace",
      teamId: data.team?.id ?? "",
    })
  );

  const redirectUrl = new URL(`${APP_URL}/settings`);
  redirectUrl.searchParams.set("connected", "slack");
  redirectUrl.searchParams.set("pending_token", encrypted);
  redirectUrl.searchParams.set("service", "slack");

  return NextResponse.redirect(redirectUrl.toString());
}
