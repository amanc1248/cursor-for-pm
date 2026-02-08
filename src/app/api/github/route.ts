import { NextRequest, NextResponse } from "next/server";
import { getGitHubCredentials } from "@/lib/auth/tokens";

async function githubFetch(path: string, token: string) {
  const resp = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!resp.ok) return null;
  return resp.json();
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "can", "i", "we", "you", "they", "it",
    "this", "that", "what", "which", "who", "when", "where", "how",
    "want", "need", "add", "create", "make", "build", "feature", "and",
    "or", "but", "for", "with", "from", "to", "in", "on", "at", "of",
  ]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 5);
}

export async function POST(req: NextRequest) {
  const creds = await getGitHubCredentials();

  if (!creds.connected || !creds.accessToken) {
    return NextResponse.json({
      error: "GitHub is not connected. Please connect your GitHub account in Settings.",
    });
  }

  const body = await req.json();
  const { repo, featureDescription, searchTerms: inputTerms } = body;
  const token = creds.accessToken;
  const searchTerms = inputTerms ?? extractKeywords(featureDescription ?? "");

  const relatedFiles: { path: string; relevance: string; snippet?: string }[] = [];
  const dependencies = new Set<string>();
  const affectedData = new Set<string>();

  for (const term of searchTerms.slice(0, 3)) {
    const searchResult = await githubFetch(
      `/search/code?q=${encodeURIComponent(term)}+repo:${repo}&per_page=5`,
      token
    );

    if (searchResult?.items) {
      for (const item of searchResult.items) {
        if (relatedFiles.some((f) => f.path === item.path)) continue;

        const fileData = await githubFetch(
          `/repos/${repo}/contents/${item.path}`,
          token
        );

        let snippet = "";
        let fileContent = "";
        if (fileData?.content) {
          fileContent = Buffer.from(fileData.content, "base64").toString("utf-8");
          const lines = fileContent.split("\n");
          const matchLines = lines
            .map((line: string, idx: number) => ({ line, idx }))
            .filter(({ line }: { line: string }) =>
              line.toLowerCase().includes(term.toLowerCase())
            )
            .slice(0, 3);
          snippet = matchLines
            .map(({ line, idx }: { line: string; idx: number }) => `L${idx + 1}: ${line.trim()}`)
            .join("\n");
        }

        if (fileContent) {
          const importMatches = fileContent.match(/^import\s+.+from\s+['"](.+)['"]/gm);
          if (importMatches) {
            importMatches.forEach((m: string) => {
              const mod = m.match(/from\s+['"](.+)['"]/)?.[1];
              if (mod && !mod.startsWith(".")) dependencies.add(mod);
            });
          }

          const modelPatterns = [
            /interface\s+(\w+)/g,
            /type\s+(\w+)\s*=/g,
            /model\s+(\w+)/g,
            /schema\s*\.\s*(\w+)/gi,
            /table\s*\(\s*['"](\w+)['"]/g,
            /collection\s*\(\s*['"](\w+)['"]/g,
          ];
          for (const pattern of modelPatterns) {
            let match;
            while ((match = pattern.exec(fileContent)) !== null) {
              if (match[1].length > 2 && match[1].length < 50) {
                affectedData.add(match[1]);
              }
            }
          }
        }

        relatedFiles.push({
          path: item.path,
          relevance: `Matches "${term}"`,
          snippet: snippet || undefined,
        });
      }
    }
  }

  // Check package.json
  const packageJson = await githubFetch(
    `/repos/${repo}/contents/package.json`,
    token
  );
  if (packageJson?.content) {
    try {
      const pkg = JSON.parse(
        Buffer.from(packageJson.content, "base64").toString("utf-8")
      );
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const term of searchTerms) {
        for (const dep of Object.keys(allDeps)) {
          if (dep.toLowerCase().includes(term.toLowerCase())) {
            dependencies.add(`${dep}@${allDeps[dep]}`);
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return NextResponse.json({
    repo,
    featureDescription,
    relatedFiles: relatedFiles.slice(0, 10),
    dependencies: Array.from(dependencies).slice(0, 15),
    affectedData: Array.from(affectedData).slice(0, 15),
    suggestedApproach:
      relatedFiles.length > 0
        ? `Found ${relatedFiles.length} related files. Key areas: ${relatedFiles
            .slice(0, 3)
            .map((f) => f.path)
            .join(", ")}.`
        : "No directly related code found. This may be a new feature requiring new files.",
  });
}
