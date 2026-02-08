import { NextRequest, NextResponse } from "next/server";
import { getJiraCredentials, buildJiraRequest } from "@/lib/auth/tokens";

// POST /api/jira — create a ticket
export async function POST(req: NextRequest) {
  try {
    const creds = await getJiraCredentials();
    if (!creds.connected) {
      return NextResponse.json(
        { error: "Jira not connected. Go to Settings to connect your Jira account." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, type, priority, labels, acceptanceCriteria, projectKey } =
      body;

    // Use provided projectKey, or env fallback
    const resolvedProjectKey =
      projectKey || creds.projectKey || process.env.JIRA_PROJECT_KEY || "KAN";

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
        project: { key: resolvedProjectKey },
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

    const { url, headers } = buildJiraRequest(creds, "/issue");
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(jiraPayload),
    });

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

    // Build browse URL based on auth mode
    const browseUrl =
      creds.mode === "oauth" && creds.siteName
        ? `https://${creds.siteName}.atlassian.net/browse/${ticketId}`
        : creds.domain
          ? `https://${creds.domain}/browse/${ticketId}`
          : `#${ticketId}`;

    return NextResponse.json({
      ticketId,
      title,
      description,
      type: issueTypeName,
      priority: priorityName,
      labels: labels ?? [],
      status: "To Do",
      createdAt: new Date().toISOString(),
      url: browseUrl,
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
    const creds = await getJiraCredentials();
    if (!creds.connected) {
      return NextResponse.json(
        { error: "Jira not connected. Go to Settings to connect your Jira account." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const assignee = searchParams.get("assignee");
    const type = searchParams.get("type");
    const maxResults = searchParams.get("maxResults") ?? "20";
    const projectKey =
      searchParams.get("projectKey") ||
      creds.projectKey ||
      process.env.JIRA_PROJECT_KEY;

    // Build JQL
    const jqlParts: string[] = [];
    if (projectKey) jqlParts.push(`project = ${projectKey}`);
    if (status) jqlParts.push(`status = "${status}"`);
    if (assignee) {
      jqlParts.push(
        assignee === "unassigned"
          ? "assignee is EMPTY"
          : `assignee = "${assignee}"`
      );
    }
    if (type) jqlParts.push(`issuetype = "${type}"`);

    const jql =
      (jqlParts.length > 0 ? jqlParts.join(" AND ") : "order by updated") +
      " ORDER BY updated DESC";

    const { url, headers } = buildJiraRequest(creds, "/search/jql");
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jql,
        maxResults: Number(maxResults),
        fields: [
          "summary",
          "status",
          "priority",
          "issuetype",
          "assignee",
          "labels",
          "updated",
        ],
      }),
    });

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
      }) => {
        const browseUrl =
          creds.mode === "oauth" && creds.siteName
            ? `https://${creds.siteName}.atlassian.net/browse/${issue.key}`
            : creds.domain
              ? `https://${creds.domain}/browse/${issue.key}`
              : `#${issue.key}`;

        return {
          ticketId: issue.key,
          title: issue.fields.summary,
          status: issue.fields.status?.name ?? "Unknown",
          priority: issue.fields.priority?.name ?? "Medium",
          type: issue.fields.issuetype?.name ?? "Task",
          assignee: issue.fields.assignee?.displayName ?? "Unassigned",
          assigneeEmail: issue.fields.assignee?.emailAddress ?? null,
          labels: issue.fields.labels ?? [],
          updatedAt: issue.fields.updated,
          url: browseUrl,
        };
      }
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
    const creds = await getJiraCredentials();
    if (!creds.connected) {
      return NextResponse.json(
        { error: "Jira not connected. Go to Settings to connect your Jira account." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { ticketId, action, ...params } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: "ticketId is required" },
        { status: 400 }
      );
    }

    const browseUrl =
      creds.mode === "oauth" && creds.siteName
        ? `https://${creds.siteName}.atlassian.net/browse/${ticketId}`
        : creds.domain
          ? `https://${creds.domain}/browse/${ticketId}`
          : `#${ticketId}`;

    // Assign ticket
    if (action === "assign") {
      const { assigneeEmail } = params;

      const { url: searchUrl, headers } = buildJiraRequest(
        creds,
        `/user/search?query=${encodeURIComponent(assigneeEmail)}`
      );
      const userResp = await fetch(searchUrl, { method: "GET", headers });
      const users = await userResp.json();
      if (!users.length) {
        return NextResponse.json(
          { error: `No Jira user found for: ${assigneeEmail}` },
          { status: 404 }
        );
      }
      const accountId = users[0].accountId;

      const { url: assignUrl, headers: assignHeaders } = buildJiraRequest(
        creds,
        `/issue/${ticketId}/assignee`
      );
      const assignResp = await fetch(assignUrl, {
        method: "PUT",
        headers: assignHeaders,
        body: JSON.stringify({ accountId }),
      });

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
        url: browseUrl,
      });
    }

    // Update ticket fields
    if (action === "update") {
      const { summary, priority, labels, status } = params;

      if (status) {
        const { url: transUrl, headers: transHeaders } = buildJiraRequest(
          creds,
          `/issue/${ticketId}/transitions`
        );
        const transResp = await fetch(transUrl, {
          method: "GET",
          headers: transHeaders,
        });
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

        await fetch(transUrl, {
          method: "POST",
          headers: transHeaders,
          body: JSON.stringify({ transition: { id: transition.id } }),
        });
      }

      const fieldsToUpdate: Record<string, unknown> = {};
      if (summary) fieldsToUpdate.summary = summary;
      if (priority) fieldsToUpdate.priority = { name: priority };
      if (labels) fieldsToUpdate.labels = labels;

      if (Object.keys(fieldsToUpdate).length > 0) {
        const { url: updateUrl, headers: updateHeaders } = buildJiraRequest(
          creds,
          `/issue/${ticketId}`
        );
        const updateResp = await fetch(updateUrl, {
          method: "PUT",
          headers: updateHeaders,
          body: JSON.stringify({ fields: fieldsToUpdate }),
        });

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
        url: browseUrl,
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
