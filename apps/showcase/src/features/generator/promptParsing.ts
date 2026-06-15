export function titleFromPrompt(prompt: string) {
  const requestedHeading = headingFromPrompt(prompt);

  if (requestedHeading) {
    return normalizeHeading(requestedHeading);
  }

  const withoutLeadVerb = prompt
    .replace(/^(generate|create|build|design|make)\s+(an?\s+)?/i, "")
    .replace(/\s+using\s+.*$/i, "")
    .replace(/\s+with\s+approved.*$/i, "")
    .trim();
  const words = withoutLeadVerb.split(/\s+/).slice(0, 5);
  const title = words.length ? words.join(" ") : "Product Workflow";
  return title
    .replace(/[^\w\s-]/g, "")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function headingFromPrompt(prompt: string) {
  const match = prompt.match(/heading(?:\s+at\s+the\s+top)?\s+(?:saying|called|titled|named)\s+["']([^"']+)["']/i);
  return match?.[1]?.trim();
}

export function normalizeHeading(value: string) {
  return value
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
