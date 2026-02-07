import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

// Exchange auth code for tokens
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
      redirect_uri: "http://localhost:3000/api/auth/google/callback",
      grant_type: "authorization_code",
    }),
  });

  const data = await tokenResp.json();

  if (data.error) {
    return NextResponse.json(
      { error: data.error, description: data.error_description },
      { status: 400 }
    );
  }

  // Display the refresh token for the user to copy into .env.local
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>Google Calendar Connected</title></head>
    <body style="font-family: system-ui; max-width: 600px; margin: 80px auto; padding: 0 20px;">
      <h1 style="color: #22c55e;">Google Calendar Connected!</h1>
      <p>Copy this refresh token into your <code>.env.local</code> file:</p>
      <div style="background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 12px; word-break: break-all; font-family: monospace; font-size: 14px;">
        GOOGLE_REFRESH_TOKEN=${data.refresh_token}
      </div>
      <p style="margin-top: 16px; color: #64748b;">Then restart your dev server. You can close this page.</p>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
