import { NextRequest, NextResponse } from "next/server";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN!;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channel, message } = body;

    // Use the provided channel or fall back to the default
    const targetChannel = channel?.startsWith("C")
      ? channel
      : SLACK_CHANNEL_ID;

    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
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
