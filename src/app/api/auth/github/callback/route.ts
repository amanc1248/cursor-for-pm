import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/auth/crypto";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenResp.json();

  if (tokenData.error) {
    console.error("GitHub OAuth token error:", tokenData);
    return NextResponse.redirect(`${APP_URL}/settings?error=github_auth_failed`);
  }

  const userResp = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });
  const user = await userResp.json();

  const encrypted = encrypt(
    JSON.stringify({
      accessToken: tokenData.access_token,
      username: user.login,
    })
  );

  const redirectUrl = new URL(`${APP_URL}/settings`);
  redirectUrl.searchParams.set("connected", "github");
  redirectUrl.searchParams.set("pending_token", encrypted);
  redirectUrl.searchParams.set("service", "github");

  return NextResponse.redirect(redirectUrl.toString());
}
