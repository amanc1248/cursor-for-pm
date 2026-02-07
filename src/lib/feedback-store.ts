/**
 * Simple module-level store for persisting uploaded feedback text across messages.
 * Used by the Tambo context helper so the AI always has access to the user's feedback.
 */

let storedFeedback: string | null = null;

export function setFeedback(text: string) {
  storedFeedback = text;
}

export function getFeedback(): string | null {
  return storedFeedback;
}

export function clearFeedback() {
  storedFeedback = null;
}

/**
 * Context helper function for TamboProvider.
 * Returns the stored feedback text if available, null otherwise.
 * Returning null means Tambo skips this context for the message.
 */
export const uploadedFeedbackHelper = () => {
  const feedback = getFeedback();
  if (!feedback) return null;
  return {
    feedbackText: feedback,
    charCount: feedback.length,
    lineCount: feedback.split("\n").length,
  };
};
