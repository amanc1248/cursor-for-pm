/**
 * Store for product documentation that gets injected into every AI message.
 * Persisted in localStorage so it survives page refreshes.
 */

const STORAGE_KEY = "pm-assistant-product-doc";

let cached: string | null = null;

export function getProductDoc(): string | null {
  if (cached !== null) return cached || null;
  if (typeof window === "undefined") return null;
  try {
    cached = localStorage.getItem(STORAGE_KEY) ?? "";
    return cached || null;
  } catch {
    return null;
  }
}

export function setProductDoc(text: string) {
  cached = text;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, text);
  } catch {
    // storage full — ignore
  }
}

export function clearProductDoc() {
  cached = "";
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Context helper for TamboProvider.
 * Injects the product documentation so the AI has full product context.
 */
export const productDocHelper = () => {
  const doc = getProductDoc();
  if (!doc) return null;
  return {
    instruction: "The user has provided their product documentation below. Use it as context when answering questions, suggesting features, writing PRDs, analyzing dependencies, and prioritizing work. Reference specific details from this documentation when relevant.",
    productDocumentation: doc,
  };
};
