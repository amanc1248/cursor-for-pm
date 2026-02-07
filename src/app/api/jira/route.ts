import { NextRequest, NextResponse } from "next/server";

const JIRA_EMAIL = process.env.JIRA_EMAIL!;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN!;
const JIRA_DOMAIN = process.env.JIRA_DOMAIN!;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY!;

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");

const headers = {
  Authorization: `Basic ${auth}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};

// POST /api/jira — create a ticket
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, type, priority, labels, acceptanceCriteria } =
      body;

    const issueTypeName =
      ({ Story: "Story", Task: "Task", Bug: "Bug", Epic: "Epic", Feature: "Feature" })[
        type as string
      ] ?? "Task";

    const priorityName =
      ({ Highest: "Highest", High: "High", Medium: "Medium", Low: "Low", Lowest: "Lowest" })[
        priority as string
      ] ?? "Medium";

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
      { method: "POST", headers, body: JSON.stringify(jiraPayload) }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Jira create error:", response.status, errorData);
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
    console.error("Jira create route error:", error);
    return NextResponse.json(
      { error: "Failed to create Jira ticket" },
      { status: 500 }
    );
  }
}

// GET /api/jira?status=In+Progress — search tickets
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const assignee = searchParams.get("assignee");
    const type = searchParams.get("type");
    const maxResults = searchParams.get("maxResults") ?? "20";

    // Build JQL
    const jqlParts = [`project = ${JIRA_PROJECT_KEY}`];
    if (status) jqlParts.push(`status = "${status}"`);
    if (assignee) {
      jqlParts.push(
        assignee === "unassigned"
          ? "assignee is EMPTY"
          : `assignee = "${assignee}"`
      );
    }
    if (type) jqlParts.push(`issuetype = "${type}"`);

    const jql = jqlParts.join(" AND ") + " ORDER BY updated DESC";

    const response = await fetch(
      `https://${JIRA_DOMAIN}/rest/api/3/search/jql`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          jql,
          maxResults: Number(maxResults),
          fields: ["summary", "status", "priority", "issuetype", "assignee", "labels", "updated"],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Jira search error:", response.status, errorData);
      return NextResponse.json(
        { error: `Jira search error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    const tickets = data.issues.map(
      (issue: {
        key: string;
        fields: {
          summary: string;
          status: { name: string };
          priority: { name: string };
          issuetype: { name: string };
          assignee: { displayName: string; emailAddress: string } | null;
          labels: string[];
          updated: string;
        };
      }) => ({
        ticketId: issue.key,
        title: issue.fields.summary,
        status: issue.fields.status?.name ?? "Unknown",
        priority: issue.fields.priority?.name ?? "Medium",
        type: issue.fields.issuetype?.name ?? "Task",
        assignee: issue.fields.assignee?.displayName ?? "Unassigned",
        assigneeEmail: issue.fields.assignee?.emailAddress ?? null,
        labels: issue.fields.labels ?? [],
        updatedAt: issue.fields.updated,
        url: `https://${JIRA_DOMAIN}/browse/${issue.key}`,
      })
    );

    return NextResponse.json({ tickets, total: data.total });
  } catch (error) {
    console.error("Jira search route error:", error);
    return NextResponse.json(
      { error: "Failed to search Jira tickets" },
      { status: 500 }
    );
  }
}

// PUT /api/jira — update or assign a ticket
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, action, ...params } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: "ticketId is required" },
        { status: 400 }
      );
    }

    // Assign ticket
    if (action === "assign") {
      const { assigneeEmail } = params;

      // Look up accountId from email
      const userResp = await fetch(
        `https://${JIRA_DOMAIN}/rest/api/3/user/search?query=${encodeURIComponent(assigneeEmail)}`,
        { method: "GET", headers }
      );
      const users = await userResp.json();
      if (!users.length) {
        return NextResponse.json(
          { error: `No Jira user found for: ${assigneeEmail}` },
          { status: 404 }
        );
      }
      const accountId = users[0].accountId;

      const assignResp = await fetch(
        `https://${JIRA_DOMAIN}/rest/api/3/issue/${ticketId}/assignee`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ accountId }),
        }
      );

      if (!assignResp.ok) {
        const err = await assignResp.text();
        console.error("Jira assign error:", assignResp.status, err);
        return NextResponse.json(
          { error: `Failed to assign: ${assignResp.status}` },
          { status: assignResp.status }
        );
      }

      return NextResponse.json({
        ticketId,
        assignee: users[0].displayName,
        assigneeEmail,
        action: "assigned",
        url: `https://${JIRA_DOMAIN}/browse/${ticketId}`,
      });
    }

    // Update ticket fields (status transition, summary, priority, etc.)
    if (action === "update") {
      const { summary, priority, labels, status } = params;

      // If status change, we need to use transitions
      if (status) {
        // Get available transitions
        const transResp = await fetch(
          `https://${JIRA_DOMAIN}/rest/api/3/issue/${ticketId}/transitions`,
          { method: "GET", headers }
        );
        const transData = await transResp.json();
        const transition = transData.transitions.find(
          (t: { name: string }) =>
            t.name.toLowerCase() === status.toLowerCase()
        );

        if (!transition) {
          const available = transData.transitions
            .map((t: { name: string }) => t.name)
            .join(", ");
          return NextResponse.json(
            {
              error: `Cannot transition to "${status}". Available: ${available}`,
            },
            { status: 400 }
          );
        }

        await fetch(
          `https://${JIRA_DOMAIN}/rest/api/3/issue/${ticketId}/transitions`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ transition: { id: transition.id } }),
          }
        );
      }

      // Update other fields
      const fieldsToUpdate: Record<string, unknown> = {};
      if (summary) fieldsToUpdate.summary = summary;
      if (priority) fieldsToUpdate.priority = { name: priority };
      if (labels) fieldsToUpdate.labels = labels;

      if (Object.keys(fieldsToUpdate).length > 0) {
        const updateResp = await fetch(
          `https://${JIRA_DOMAIN}/rest/api/3/issue/${ticketId}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({ fields: fieldsToUpdate }),
          }
        );

        if (!updateResp.ok) {
          const err = await updateResp.text();
          console.error("Jira update error:", updateResp.status, err);
          return NextResponse.json(
            { error: `Failed to update: ${updateResp.status}` },
            { status: updateResp.status }
          );
        }
      }

      return NextResponse.json({
        ticketId,
        action: "updated",
        changes: {
          ...(summary ? { summary } : {}),
          ...(priority ? { priority } : {}),
          ...(labels ? { labels } : {}),
          ...(status ? { status } : {}),
        },
        url: `https://${JIRA_DOMAIN}/browse/${ticketId}`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Jira update route error:", error);
    return NextResponse.json(
      { error: "Failed to update Jira ticket" },
      { status: 500 }
    );
  }
}
