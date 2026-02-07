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
  analyzeFeedback,
  analyzeFeedbackSchema,
  analyzeFeedbackOutputSchema,
} from "@/services/feedback";
import {
  createJiraTicket,
  createJiraTicketSchema,
  createJiraTicketOutputSchema,
} from "@/services/jira";
import {
  postToSlack,
  postToSlackSchema,
  postToSlackOutputSchema,
} from "@/services/slack";
import { uploadedFeedbackHelper } from "@/lib/feedback-store";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";

/**
 * Context helpers — functions that run automatically before each message
 * to provide the AI with relevant app state.
 */
export const contextHelpers = {
  uploadedFeedback: uploadedFeedbackHelper,
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
      "Displays a Jira ticket that was just created, showing the ticket ID, title, description, type, priority, status, labels, and a link to open in Jira. Use this after a Jira ticket has been created to show the result to the user.",
    component: JiraTicketPreview,
    propsSchema: jiraTicketPreviewSchema,
  },
  {
    name: "SlackMessagePreview",
    description:
      "Displays a preview of a Slack message that was posted, showing the channel, bot avatar, formatted message, and delivery status. Use this after posting a message to Slack to confirm it was sent.",
    component: SlackMessagePreview,
    propsSchema: slackMessagePreviewSchema,
  },
];
