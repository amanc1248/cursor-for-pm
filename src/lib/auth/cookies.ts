import { cookies } from "next/headers";
import { encrypt, decrypt } from "./crypto";
import { NextResponse } from "next/server";

export type ServiceName = "jira_tokens" | "slack_tokens" | "google_tokens" | "github_tokens";

export async function getTokenCookie<T>(name: ServiceName): Promise<T | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(name);
    if (!cookie?.value) return null;
    return JSON.parse(decrypt(cookie.value)) as T;
  } catch {
    return null;
  }
}

export function setTokenCookieOnResponse(
  response: NextResponse,
  name: ServiceName,
  data: Record<string, unknown>
): void {
  const encrypted = encrypt(JSON.stringify(data));
  response.cookies.set(name, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

export async function isServiceDisabled(service: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return !!cookieStore.get(`${service}_disabled`)?.value;
  } catch {
    return false;
  }
}

export function clearTokenCookieOnResponse(
  response: NextResponse,
  name: ServiceName
): void {
  response.cookies.set(name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
