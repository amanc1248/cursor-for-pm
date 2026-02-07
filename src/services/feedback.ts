import { z } from "zod";

// Mock data for demonstration purposes
// In a real app, this would call an AI service or text analysis API
const MOCK_THEMES = [
  { theme: "Dark Mode", count: 42, sentiment: "positive", trend: "up" },
  { theme: "Mobile App Performance", count: 28, sentiment: "negative", trend: "down" },
  { theme: "Jira Integration", count: 15, sentiment: "neutral", trend: "stable" },
  { theme: "Export to PDF", count: 12, sentiment: "neutral", trend: "up" },
  { theme: "Search Filters", count: 9, sentiment: "negative", trend: "stable" },
] as const;

export const analyzeFeedbackSchema = z.object({
  feedbackText: z.string().describe("The raw feedback text to analyze"),
});

export const analyzeFeedbackOutputSchema = z.object({
  summary: z.string(),
  themes: z.array(z.object({
    theme: z.string(),
    count: z.number(),
    sentiment: z.enum(["positive", "negative", "neutral"]),
    trend: z.enum(["up", "down", "stable"])
  }))
});

export async function analyzeFeedback({ feedbackText }: z.infer<typeof analyzeFeedbackSchema>) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simple keyword matching to simulate "analysis" for the demo
  // If the input text contains specific keywords, we boost those themes
  const themes = MOCK_THEMES.map(t => ({ ...t })); // Clone

  const lowerText = feedbackText.toLowerCase();

  if (lowerText.includes("slow") || lowerText.includes("lag")) {
    const mobile = themes.find(t => t.theme === "Mobile App Performance");
    if (mobile) {
      mobile.count += 5;
      // @ts-ignore
      mobile.trend = "down";
    }
  }

  if (lowerText.includes("dark")) {
    const dm = themes.find(t => t.theme === "Dark Mode");
    if (dm) {
      dm.count += 10;
      // @ts-ignore
      dm.trend = "up";
    }
  }

  return {
    summary: "Analyzed feedback indicates strong demand for Dark Mode and recurrent issues with Mobile Performance.",
    themes: themes
  };
}
