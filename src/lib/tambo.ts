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

export const contextHelpers = {
  uploadedFeedback: uploadedFeedbackHelper,
  pmPersona: pmPersonaHelper,
};

export const tools: TamboTool[] = [
  {
    name: "analyzeFeedback",
    description: "Analyze customer feedback to extract themes and sentiment.",
    tool: analyzeFeedback,
    inputSchema: analyzeFeedbackSchema,
    outputSchema: analyzeFeedbackOutputSchema,
  },
  {
    name: "createJiraTicket",
    description: "Create a Jira ticket. Use when user asks to file an issue or create a ticket.",
    tool: createJiraTicket,
    inputSchema: createJiraTicketSchema,
    outputSchema: createJiraTicketOutputSchema,
  },
  {
    name: "postToSlack",
    description: "Post a message to a Slack channel.",
    tool: postToSlack,
    inputSchema: postToSlackSchema,
    outputSchema: postToSlackOutputSchema,
  },
  {
    name: "searchJiraTickets",
    description: "Search Jira tickets by status, type, or assignee.",
    tool: searchJiraTickets,
    inputSchema: searchJiraTicketsSchema,
    outputSchema: searchJiraTicketsOutputSchema,
  },
  {
    name: "assignJiraTicket",
    description: "Assign a Jira ticket to a team member.",
    tool: assignJiraTicket,
    inputSchema: assignJiraTicketSchema,
    outputSchema: assignJiraTicketOutputSchema,
  },
  {
    name: "updateJiraTicket",
    description: "Update a Jira ticket's status, priority, summary, or labels.",
    tool: updateJiraTicket,
    inputSchema: updateJiraTicketSchema,
    outputSchema: updateJiraTicketOutputSchema,
  },
  {
    name: "checkDeveloperAvailability",
    description: "Check if a developer is available by looking at their Jira tickets. Use when user asks if someone is free or available.",
    tool: checkDeveloperAvailability,
    inputSchema: checkDeveloperAvailabilitySchema,
    outputSchema: checkDeveloperAvailabilityOutputSchema,
  },
  {
    name: "createCalendarEvent",
    description: "Create a Google Calendar event with title, time, and attendees.",
    tool: createCalendarEvent,
    inputSchema: createCalendarEventSchema,
    outputSchema: createCalendarEventOutputSchema,
  },
  {
    name: "listCalendarEvents",
    description: "List upcoming calendar events for the next N days.",
    tool: listCalendarEvents,
    inputSchema: listCalendarEventsSchema,
    outputSchema: listCalendarEventsOutputSchema,
  },
  {
    name: "checkAvailability",
    description: "Check calendar availability for a time range.",
    tool: checkAvailability,
    inputSchema: checkAvailabilitySchema,
    outputSchema: checkAvailabilityOutputSchema,
  },
];

export const components: TamboComponent[] = [
  {
    name: "Graph",
    description: "Render bar, line, or pie charts with Recharts.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description: "Clickable option cards for multi-select.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  {
    name: "ThemeCard",
    description: "Customer feedback theme with mentions, sentiment, and trend.",
    component: ThemeCard,
    propsSchema: themeCardSchema,
  },
  {
    name: "FeatureCard",
    description: "Prioritized feature with score, impact, effort, and status.",
    component: FeatureCard,
    propsSchema: featureCardSchema,
  },
  {
    name: "FeatureDetail",
    description: "Tabbed feature breakdown: Overview, Evidence, Specification.",
    component: FeatureDetail,
    propsSchema: featureDetailSchema,
  },
  {
    name: "PriorityBoard",
    description: "Ranked board of features with priority stats. Use for 'what should we build?'.",
    component: PriorityBoard,
    propsSchema: priorityBoardSchema,
  },
  {
    name: "PRDDocument",
    description: "Full PRD with goals, user stories, specs, timeline, and export.",
    component: PRDDocument,
    propsSchema: prdDocumentSchema,
  },
  {
    name: "JiraTicketPreview",
    description: "Show a Jira ticket after creation or update.",
    component: JiraTicketPreview,
    propsSchema: jiraTicketPreviewSchema,
  },
  {
    name: "JiraTicketList",
    description: "List of Jira tickets with status, priority, and assignee.",
    component: JiraTicketList,
    propsSchema: jiraTicketListSchema,
  },
  {
    name: "SlackMessagePreview",
    description: "Preview of a posted Slack message with delivery status.",
    component: SlackMessagePreview,
    propsSchema: slackMessagePreviewSchema,
  },
  {
    name: "TaskBreakdown",
    description: "Sprint task list with story points, type, status, and assignee.",
    component: TaskBreakdown,
    propsSchema: taskBreakdownSchema,
  },
  {
    name: "CompetitorMatrix",
    description: "Competitive analysis matrix comparing features across products.",
    component: CompetitorMatrix,
    propsSchema: competitorMatrixSchema,
  },
  {
    name: "StatusReport",
    description: "Project status report with health, risks, metrics, and next steps.",
    component: StatusReport,
    propsSchema: statusReportSchema,
  },
  {
    name: "RoadmapTimeline",
    description: "Vertical timeline with phases, milestones, and date ranges.",
    component: RoadmapTimeline,
    propsSchema: roadmapTimelineSchema,
  },
  {
    name: "MetricsDashboard",
    description: "KPI cards with trends, targets, and progress bars.",
    component: MetricsDashboard,
    propsSchema: metricsDashboardSchema,
  },
  {
    name: "MeetingNotes",
    description: "Meeting summary with attendees, decisions, and action items.",
    component: MeetingNotes,
    propsSchema: meetingNotesSchema,
  },
  {
    name: "CalendarEventPreview",
    description: "Show a calendar event after creation.",
    component: CalendarEventPreview,
    propsSchema: calendarEventPreviewSchema,
  },
  {
    name: "CalendarEventList",
    description: "Upcoming calendar events grouped by day.",
    component: CalendarEventList,
    propsSchema: calendarEventListSchema,
  },
  {
    name: "DeveloperAvailability",
    description: "Developer availability and ticket workload. Use after checkDeveloperAvailability.",
    component: DeveloperAvailability,
    propsSchema: developerAvailabilitySchema,
  },
];
