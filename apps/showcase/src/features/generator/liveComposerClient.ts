import {
  approvedComponentNames,
  normalizeComponentNames,
  normalizeLivePayload,
  normalizeLiveScreen,
  normalizeUnsupportedComponents
} from "../../liveComposer";
import type { ComplianceItem, GeneratedOutput } from "../../showcaseTypes";
import { headingFromPrompt, normalizeHeading, titleFromPrompt } from "./promptParsing";
import { buildPromptFidelityChecks } from "./promptFidelity";

export async function composeWithLiveApi(prompt: string): Promise<GeneratedOutput | undefined> {
  const endpoint = import.meta.env.VITE_AI_COMPOSER_URL as string | undefined;

  if (!endpoint) {
    return undefined;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        allowedComponents: approvedComponentNames
      })
    });

    if (!response.ok) {
      return undefined;
    }

    const payload = await response.json();
    const promptTitle = titleFromPrompt(prompt);
    const normalized = normalizeLivePayload(payload, promptTitle);
    const livePayload = normalized.data;
    const explicitHeading = headingFromPrompt(prompt);
    const outputTitle = explicitHeading ? normalizeHeading(explicitHeading) : livePayload.title;

    const liveComponents = normalizeComponentNames(livePayload.components);
    const unsupportedComponents = normalizeUnsupportedComponents(livePayload.unsupported ?? []);
    const hasGaps = unsupportedComponents.length > 0;
    const repairedResponse = normalized.diagnostics.length > 0;
    const screen = normalizeLiveScreen(livePayload.screen, outputTitle, `${prompt} ${livePayload.title}`);
    const baseCompliance: ComplianceItem[] = [
      {
        label: "Components",
        status: hasGaps ? "Fail" : "Pass",
        detail: hasGaps
          ? `${unsupportedComponents.join(", ")} ${unsupportedComponents.length === 1 ? "is" : "are"} not approved components.`
          : `Live composer used approved components: ${liveComponents.join(", ")}.`
      },
      { label: "Tokens", status: "Pass", detail: "The response is rendered through design system primitives and tokenized CSS." },
      {
        label: "Specificity",
        status: repairedResponse ? "Watch" : "Pass",
        detail: repairedResponse
          ? `The live response was repaired before rendering: ${normalized.diagnostics.map((issue) => issue.path || "root").join(", ")}.`
          : "The screen was composed from the current prompt by the configured live composer."
      }
    ];

    return {
      label: hasGaps ? "Needs System Review" : "Live Screen",
      title: outputTitle,
      summary: repairedResponse
        ? `${livePayload.summary} Some model fields were repaired before rendering.`
        : livePayload.summary,
      prompt,
      compliance: [...baseCompliance, ...buildPromptFidelityChecks(prompt, screen)],
      approvedComponents: liveComponents,
      unsupportedComponents,
      fingerprint: promptFingerprint(prompt),
      screen
    };
  } catch {
    return undefined;
  }
}

function promptFingerprint(prompt: string) {
  const hash = Array.from(prompt).reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 9973, 17);
  return `prompt-${hash.toString().padStart(4, "0")}`;
}
