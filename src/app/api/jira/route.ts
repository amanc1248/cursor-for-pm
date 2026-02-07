import { NextRequest, NextResponse } from "next/server";

const JIRA_EMAIL = process.env.JIRA_EMAIL!;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN!;
const JIRA_DOMAIN = process.env.JIRA_DOMAIN!;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY!;

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, type, priority, labels, acceptanceCriteria } =
      body;

    // Map friendly type names to Jira issue type names
    const typeMap: Record<string, string> = {
      Story: "Story",
      Task: "Task",
      Bug: "Bug",
      Epic: "Epic",
      Feature: "Feature",
    };
    const issueTypeName = typeMap[type] ?? "Task";

    // Map priority names to Jira priority names
    const priorityMap: Record<string, string> = {
      Highest: "Highest",
      High: "High",
      Medium: "Medium",
      Low: "Low",
      Lowest: "Lowest",
    };
    const priorityName = priorityMap[priority] ?? "Medium";

    // Build description with acceptance criteria
    let fullDescription = description;
    if (acceptanceCriteria) {
      fullDescription += `\n\n*Acceptance Criteria:*\n${acceptanceCriteria}`;
    }

    const jiraPayload = {
      fields: {
        project: { key: JIRA_PROJECT_KEY },
        summary: title,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: fullDescription }],
            },
          ],
        },
        issuetype: { name: issueTypeName },
        priority: { name: priorityName },
        ...(labels && labels.length > 0 ? { labels } : {}),
      },
    };

    const response = await fetch(
      `https://${JIRA_DOMAIN}/rest/api/3/issue`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(jiraPayload),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Jira API error:", response.status, errorData);
      return NextResponse.json(
        { error: `Jira API error: ${response.status}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const ticketId = data.key;

    return NextResponse.json({
      ticketId,
      title,
      description,
      type: issueTypeName,
      priority: priorityName,
      labels: labels ?? [],
      status: "To Do",
      createdAt: new Date().toISOString(),
      url: `https://${JIRA_DOMAIN}/browse/${ticketId}`,
    });
  } catch (error) {
    console.error("Jira route error:", error);
    return NextResponse.json(
      { error: "Failed to create Jira ticket" },
      { status: 500 }
    );
  }
}
