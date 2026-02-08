import { NextRequest, NextResponse } from "next/server";
import { ServiceName } from "@/lib/auth/cookies";

const VALID_SERVICES: ServiceName[] = [
  "jira_tokens",
  "slack_tokens",
  "google_tokens",
  "github_tokens",
];

export async function POST(req: NextRequest) {
  const { service, data } = await req.json();

  const cookieName = `${service}_tokens` as ServiceName;
  if (!VALID_SERVICES.includes(cookieName)) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }

  if (!data || typeof data !== "string") {
    return NextResponse.json({ error: "Missing token data" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });

  // Set the encrypted token cookie directly (data is already encrypted)
  response.cookies.set(cookieName, data, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  // Clear disabled flag
  response.cookies.set(`${service}_disabled`, "", { path: "/", maxAge: 0 });

  return response;
}
