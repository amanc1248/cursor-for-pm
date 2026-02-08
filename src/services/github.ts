import { z } from "zod";

// ─── Schemas ────────────────────────────────────────────

export const analyzeCodeDependenciesSchema = z.object({
  featureDescription: z.string(),
  repo: z.string(),
  searchTerms: z.array(z.string()).optional(),
});

export const analyzeCodeDependenciesOutputSchema = z.object({
  repo: z.string(),
  featureDescription: z.string(),
  relatedFiles: z.array(
    z.object({
      path: z.string(),
      relevance: z.string(),
      snippet: z.string().optional(),
    })
  ),
  dependencies: z.array(z.string()),
  affectedData: z.array(z.string()),
  suggestedApproach: z.string(),
  error: z.string().optional(),
});

// ─── Tool Implementation ────────────────────────────────

export async function analyzeCodeDependencies(
  input: z.infer<typeof analyzeCodeDependenciesSchema>
) {
  const response = await fetch("/api/github", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (data.error) {
    return {
      repo: input.repo,
      featureDescription: input.featureDescription,
      relatedFiles: [],
      dependencies: [],
      affectedData: [],
      suggestedApproach: "",
      error: data.error,
    };
  }

  return data;
}
