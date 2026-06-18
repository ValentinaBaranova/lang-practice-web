/**
 * Truncates a string to a maximum length, normalizing whitespace and adding an ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (!text) return "";
  
  // Normalize whitespace (including newlines) to a single space
  const normalized = text.replace(/\s+/g, ' ').trim();
  
  if (normalized.length <= maxLength) {
    return normalized;
  }
  
  return normalized.substring(0, maxLength).trim() + "...";
}
