import { NextRequest, NextResponse } from "next/server";
import { getSlackCredentials } from "@/lib/auth/tokens";

export async function POST(req: NextRequest) {
  try {
    const creds = await getSlackCredentials();
    if (!creds.connected || !creds.botToken) {
      return NextResponse.json(
        { error: "Slack not connected. Go to Settings to connect your Slack workspace." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { channel, message } = body;

    // Use the provided channel or fall back to the default
    const targetChannel = channel?.startsWith("C")
      ? channel
      : creds.channelId ?? channel;

    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: targetChannel,
        text: message,
        unfurl_links: false,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Slack API error:", data.error);
      return NextResponse.json(
        { error: `Slack API error: ${data.error}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      messageId: data.ts,
      channel: `#${data.channel}`,
      message,
      timestamp: new Date().toISOString(),
      status: "sent",
    });
  } catch (error) {
    console.error("Slack route error:", error);
    return NextResponse.json(
      { error: "Failed to post to Slack" },
      { status: 500 }
    );
  }
}
