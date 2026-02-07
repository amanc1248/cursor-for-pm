/**
 * Client-side file parsing for PDF, CSV, and text files.
 */

const IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const TEXT_TYPES = [
  "text/plain",
  "text/csv",
  "text/markdown",
  "text/html",
  "application/json",
];

export type FileType = "image" | "pdf" | "text" | "unsupported";

export function classifyFile(file: File): FileType {
  if (IMAGE_TYPES.includes(file.type)) return "image";
  if (file.type === "application/pdf" || file.name.endsWith(".pdf"))
    return "pdf";
  if (
    TEXT_TYPES.includes(file.type) ||
    file.name.endsWith(".txt") ||
    file.name.endsWith(".csv") ||
    file.name.endsWith(".md") ||
    file.name.endsWith(".json")
  )
    return "text";
  return "unsupported";
}

export interface ParsedFile {
  name: string;
  type: FileType;
  content: string;
  pageCount?: number;
}

/**
 * Read a text/CSV/markdown/JSON file as a string.
 */
function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
}

/**
 * Parse a PDF file and extract all text content.
 * Uses pdfjs-dist with the bundled worker.
 */
async function readPdfFile(file: File): Promise<{ text: string; pageCount: number }> {
  const pdfjs = await import("pdfjs-dist");

  // Use the worker copied to /public for reliable loading in Next.js
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }

  return {
    text: pages.join("\n\n--- Page Break ---\n\n"),
    pageCount: pdf.numPages,
  };
}

/**
 * Parse any supported file and return its text content.
 * Images are not parsed here — they go through Tambo's native image system.
 */
export async function parseFile(file: File): Promise<ParsedFile> {
  const type = classifyFile(file);

  if (type === "text") {
    const content = await readTextFile(file);
    return { name: file.name, type, content };
  }

  if (type === "pdf") {
    const { text, pageCount } = await readPdfFile(file);
    return { name: file.name, type, content: text, pageCount };
  }

  return {
    name: file.name,
    type: "unsupported",
    content: "",
  };
}

/**
 * Get a human-readable description of accepted file types.
 */
export const ACCEPTED_FILE_TYPES =
  ".pdf,.txt,.csv,.md,.json,.png,.jpg,.jpeg,.gif,.webp,.svg";

export const ACCEPTED_MIME_TYPES = [
  ...IMAGE_TYPES,
  "application/pdf",
  ...TEXT_TYPES,
].join(",");
