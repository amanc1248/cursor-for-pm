/**
 * @file tambo.ts
 * @description Central configuration for Tambo components, tools, and context helpers.
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import { ThemeCard, themeCardSchema } from "@/components/pm/theme-card";
import { FeatureCard, featureCardSchema } from "@/components/pm/feature-card";
import { FeatureDetail, featureDetailSchema } from "@/components/pm/feature-detail";
import { PriorityBoard, priorityBoardSchema } from "@/components/pm/priority-board";
import { PRDDocument, prdDocumentSchema } from "@/components/pm/prd-document";
import {
  JiraTicketPreview,
  jiraTicketPreviewSchema,
} from "@/components/pm/jira-ticket-preview";
import {
  SlackMessagePreview,
  slackMessagePreviewSchema,
} from "@/components/pm/slack-message-preview";
import {
  TaskBreakdown,
  taskBreakdownSchema,
} from "@/components/pm/task-breakdown";
import {
  CompetitorMatrix,
  competitorMatrixSchema,
} from "@/components/pm/competitor-matrix";
import {
  StatusReport,
  statusReportSchema,
} from "@/components/pm/status-report";
import {
  RoadmapTimeline,
  roadmapTimelineSchema,
} from "@/components/pm/roadmap-timeline";
import {
  MetricsDashboard,
  metricsDashboardSchema,
} from "@/components/pm/metrics-dashboard";
import {
  MeetingNotes,
  meetingNotesSchema,
} from "@/components/pm/meeting-notes";
import {
  analyzeFeedback,
  analyzeFeedbackSchema,
  analyzeFeedbackOutputSchema,
} from "@/services/feedback";
import {
  createJiraTicket,
  createJiraTicketSchema,
  createJiraTicketOutputSchema,
  searchJiraTickets,
  searchJiraTicketsSchema,
  searchJiraTicketsOutputSchema,
  assignJiraTicket,
  assignJiraTicketSchema,
  assignJiraTicketOutputSchema,
  updateJiraTicket,
  updateJiraTicketSchema,
  updateJiraTicketOutputSchema,
  checkDeveloperAvailability,
  checkDeveloperAvailabilitySchema,
  checkDeveloperAvailabilityOutputSchema,
} from "@/services/jira";
import {
  JiraTicketList,
  jiraTicketListSchema,
} from "@/components/pm/jira-ticket-list";
import {
  postToSlack,
  postToSlackSchema,
  postToSlackOutputSchema,
} from "@/services/slack";
import {
  createCalendarEvent,
  createCalendarEventSchema,
  createCalendarEventOutputSchema,
  listCalendarEvents,
  listCalendarEventsSchema,
  listCalendarEventsOutputSchema,
  checkAvailability,
  checkAvailabilitySchema,
  checkAvailabilityOutputSchema,
} from "@/services/calendar";
import {
  CalendarEventPreview,
  calendarEventPreviewSchema,
} from "@/components/pm/calendar-event-preview";
import {
  CalendarEventList,
  calendarEventListSchema,
} from "@/components/pm/calendar-event-list";
import {
  DeveloperAvailability,
  developerAvailabilitySchema,
} from "@/components/pm/developer-availability";
import { uploadedFeedbackHelper } from "@/lib/feedback-store";
import { pmPersonaHelper } from "@/lib/pm-context";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";

/**
 * Context helpers — functions that run automatically before each message
 * to provide the AI with relevant app state.
 */
export const contextHelpers = {
  uploadedFeedback: uploadedFeedbackHelper,
  pmPersona: pmPersonaHelper,
};

/**
 * Tools the AI can invoke to fetch data or perform actions.
 */
export const tools: TamboTool[] = [
  {
    name: "analyzeFeedback",
    description:
      "Analyzes raw customer feedback text to extract key themes, sentiment, and trends. Returns a summary and a list of themes. Use this when the user uploads or pastes customer feedback and wants to understand patterns.",
    tool: analyzeFeedback,
    inputSchema: analyzeFeedbackSchema,
    outputSchema: analyzeFeedbackOutputSchema,
  },
  {
    name: "createJiraTicket",
    description:
      "Creates a Jira ticket for a product feature. Pre-fills title, description, type, priority, and labels. Use this when a user asks to create a Jira ticket, file an issue, or track a feature in their project management tool.",
    tool: createJiraTicket,
    inputSchema: createJiraTicketSchema,
    outputSchema: createJiraTicketOutputSchema,
  },
  {
    name: "postToSlack",
    description:
      "Posts a formatted message to a Slack channel to share feature decisions, updates, or analysis results with the team. Use this when a user asks to share something to Slack, notify the team, or post an update.",
    tool: postToSlack,
    inputSchema: postToSlackSchema,
    outputSchema: postToSlackOutputSchema,
  },
  {
    name: "searchJiraTickets",
    description:
      "Searches Jira tickets with optional filters for status, type, and assignee. Use this when the user asks to see tickets, check what's in progress, view the backlog, list open tasks, or check ticket status.",
    tool: searchJiraTickets,
    inputSchema: searchJiraTicketsSchema,
    outputSchema: searchJiraTicketsOutputSchema,
  },
  {
    name: "assignJiraTicket",
    description:
      "Assigns a Jira ticket to a team member by their email address. Use this when the user asks to assign a ticket, delegate a task, or set an owner for an issue.",
    tool: assignJiraTicket,
    inputSchema: assignJiraTicketSchema,
    outputSchema: assignJiraTicketOutputSchema,
  },
  {
    name: "updateJiraTicket",
    description:
      "Updates a Jira ticket's fields — change status (To Do, In Progress, In Review, Done), priority, summary, or labels. Use this when the user asks to update a ticket, move a ticket to in progress, change priority, or modify a Jira issue.",
    tool: updateJiraTicket,
    inputSchema: updateJiraTicketSchema,
    outputSchema: updateJiraTicketOutputSchema,
  },
  {
    name: "checkDeveloperAvailability",
    description:
      "Checks if a developer/team member is available for new tasks by looking at their current Jira assignments. Shows in-progress, to-do, and in-review tickets. Use this when a user asks if someone is free, available, has bandwidth, or can take on a new task.",
    tool: checkDeveloperAvailability,
    inputSchema: checkDeveloperAvailabilitySchema,
    outputSchema: checkDeveloperAvailabilityOutputSchema,
  },
  {
    name: "createCalendarEvent",
    description:
      "Creates a Google Calendar event with title, time, attendees, and location. Use this when the user asks to schedule a meeting, book a review, set up a sprint planning session, or create any calendar event.",
    tool: createCalendarEvent,
    inputSchema: createCalendarEventSchema,
    outputSchema: createCalendarEventOutputSchema,
  },
  {
    name: "listCalendarEvents",
    description:
      "Lists upcoming Google Calendar events for the next N days. Use this when the user asks to see their schedule, check upcoming meetings, view the calendar, or asks 'what's on my calendar?'.",
    tool: listCalendarEvents,
    inputSchema: listCalendarEventsSchema,
    outputSchema: listCalendarEventsOutputSchema,
  },
  {
    name: "checkAvailability",
    description:
      "Checks calendar availability for a given time range and returns busy slots. Use this when the user asks to find a free time, check availability, or wants to know when they're available for a meeting.",
    tool: checkAvailability,
    inputSchema: checkAvailabilitySchema,
    outputSchema: checkAvailabilityOutputSchema,
  },
];

/**
 * Components the AI can dynamically render in response to user messages.
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  {
    name: "ThemeCard",
    description:
      "Displays a customer feedback theme with the number of mentions, overall sentiment (positive/negative/neutral), and trend direction (up/down/stable). Use this to show patterns and themes discovered from analyzing customer feedback, support tickets, or user interviews.",
    component: ThemeCard,
    propsSchema: themeCardSchema,
  },
  {
    name: "FeatureCard",
    description:
      "Displays a prioritized product feature with priority score (1-100), status (recommended/quick-win/consider), business impact (High/Medium/Low), development effort (High/Medium/Low), and customer mention count. Use this to show feature recommendations, roadmap priorities, or backlog items ranked by value and feasibility.",
    component: FeatureCard,
    propsSchema: featureCardSchema,
  },
  {
    name: "FeatureDetail",
    description:
      "Displays a comprehensive feature analysis with a tabbed interface: Overview (metrics, user stories, acceptance criteria), Evidence (customer quotes and supporting data), and Specification (technical considerations, dependencies, timeline). Use this when a user asks to drill into a feature, see feature details, wants a comprehensive feature breakdown, or clicks on a feature card.",
    component: FeatureDetail,
    propsSchema: featureDetailSchema,
  },
  {
    name: "PriorityBoard",
    description:
      "Displays a ranked board of prioritized features with summary statistics (total count, average priority, quick wins). Use this when a user asks 'what should we build?', wants to see all features ranked, needs a priority overview, or asks for feature recommendations.",
    component: PriorityBoard,
    propsSchema: priorityBoardSchema,
  },
  {
    name: "PRDDocument",
    description:
      "Generates a professional Product Requirements Document with sections for overview, goals, user stories, acceptance criteria, technical specification, timeline, risks, and success metrics. Includes a download button to export as Markdown. Use this when a user asks to generate a PRD, export requirements, or create a spec document for a feature.",
    component: PRDDocument,
    propsSchema: prdDocumentSchema,
  },
  {
    name: "JiraTicketPreview",
    description:
      "Displays a Jira ticket that was just created or updated, showing the ticket ID, title, description, type, priority, status, labels, and a link to open in Jira. Use this after a Jira ticket has been created, assigned, or updated to show the result to the user.",
    component: JiraTicketPreview,
    propsSchema: jiraTicketPreviewSchema,
  },
  {
    name: "JiraTicketList",
    description:
      "Displays a list of Jira tickets with their status, priority, type, and assignee. Each ticket links to Jira. Use this after searching for tickets to show the results, e.g. when the user asks 'show me in-progress tickets' or 'what's in the backlog'.",
    component: JiraTicketList,
    propsSchema: jiraTicketListSchema,
  },
  {
    name: "SlackMessagePreview",
    description:
      "Displays a preview of a Slack message that was posted, showing the channel, bot avatar, formatted message, and delivery status. Use this after posting a message to Slack to confirm it was sent.",
    component: SlackMessagePreview,
    propsSchema: slackMessagePreviewSchema,
  },
  {
    name: "TaskBreakdown",
    description:
      "Displays a sprint plan or feature breakdown as a list of dev tasks with story points, type (frontend/backend/design/qa), status, and assignee. Shows total points and progress. Use this when a user asks to plan a sprint, break down a feature into tasks, estimate story points, or create a task list for development.",
    component: TaskBreakdown,
    propsSchema: taskBreakdownSchema,
  },
  {
    name: "CompetitorMatrix",
    description:
      "Displays a competitive analysis matrix comparing features across multiple competitors with full/partial/none/unknown support indicators and key insights. Use this when a user asks to compare products, do competitive analysis, benchmark features, or evaluate alternatives.",
    component: CompetitorMatrix,
    propsSchema: competitorMatrixSchema,
  },
  {
    name: "StatusReport",
    description:
      "Displays a stakeholder status report with overall status (on-track/at-risk/off-track), highlights, risks, next steps, and key metrics with trends. Use this when a user asks for a status update, exec summary, weekly report, or project health check.",
    component: StatusReport,
    propsSchema: statusReportSchema,
  },
  {
    name: "RoadmapTimeline",
    description:
      "Displays a product roadmap as a vertical timeline with phases, date ranges, status indicators, and milestone items. Use this when a user asks to plan a roadmap, lay out quarterly milestones, visualize project phases, or create a release plan.",
    component: RoadmapTimeline,
    propsSchema: roadmapTimelineSchema,
  },
  {
    name: "MetricsDashboard",
    description:
      "Displays a grid of KPI metric cards with big numbers, trend arrows, percentage changes, and target progress bars. Use this when a user asks about KPIs, success metrics, tracking numbers, performance dashboards, or wants to define measurable goals.",
    component: MetricsDashboard,
    propsSchema: metricsDashboardSchema,
  },
  {
    name: "MeetingNotes",
    description:
      "Displays structured meeting notes with attendees, summary, decisions, and action items with owners and due dates. Use this when a user asks to summarize a meeting, capture action items, document decisions, or write meeting minutes.",
    component: MeetingNotes,
    propsSchema: meetingNotesSchema,
  },
  {
    name: "CalendarEventPreview",
    description:
      "Displays a Google Calendar event that was just created, showing the title, date/time, duration, attendees, location, and a link to open in Google Calendar. Use this after creating a calendar event to confirm it to the user.",
    component: CalendarEventPreview,
    propsSchema: calendarEventPreviewSchema,
  },
  {
    name: "CalendarEventList",
    description:
      "Displays a list of upcoming Google Calendar events grouped by day, showing time, duration, title, location, and attendee count. Use this when showing the user their schedule or upcoming meetings.",
    component: CalendarEventList,
    propsSchema: calendarEventListSchema,
  },
];
