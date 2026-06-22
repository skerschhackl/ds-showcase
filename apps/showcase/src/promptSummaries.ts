import { extractActionIntents } from "./features/generator/actionIntents";
import { extractCountIntents } from "./features/generator/promptIntents";

export function promptCountSummary(prompt: string) {
  const counts = extractCountIntents(prompt);

  return counts.length
    ? counts.map((intent) => `${intent.label}=${intent.count}`).join(", ")
    : "None";
}

export function promptActionSummary(prompt: string) {
  const actions = extractActionIntents(prompt);
  const actionLabels = [
    actions.pageAction ? `page=${actions.pageAction}` : "",
    actions.rowAction ? `row=${actions.rowAction}` : ""
  ].filter(Boolean);

  return actionLabels.length ? actionLabels.join(", ") : "None";
}
