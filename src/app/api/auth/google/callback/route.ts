import { NextRequest, NextResponse } from "next/server";
import { setTokenCookieOnResponse } from "@/lib/auth/cookies";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `${APP_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  const data = await tokenResp.json();

  if (data.error) {
    console.error("Google OAuth error:", data);
    return NextResponse.redirect(`${APP_URL}/settings?error=google_auth_failed`);
  }

  let email: string | undefined;
  if (data.access_token) {
    try {
      const userResp = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        { headers: { Authorization: `Bearer ${data.access_token}` } }
      );
      const user = await userResp.json();
      email = user.email;
    } catch {
      // non-critical
    }
  }

  const redirectUrl = `${APP_URL}/settings?connected=google`;
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${redirectUrl}"><script>window.location.href="${redirectUrl}";</script></head><body>Redirecting...</body></html>`;
  const response = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });

  setTokenCookieOnResponse(response, "google_tokens", {
    refreshToken: data.refresh_token,
    email: email ?? undefined,
  });

  response.cookies.set("google_disabled", "", { path: "/", maxAge: 0 });

  return response;
}
