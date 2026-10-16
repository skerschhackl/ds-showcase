import {
  approvedComponentNames,
  normalizeComponentNames,
  normalizeUnsupportedComponents
} from "../../liveComposer";
import type { GeneratedScreen, ScreenKind } from "../../liveComposer";
import { parsePageComposerResponse, type PageComposerResponseBody, type PageSection } from "@ds/ai-contracts";
import type { ComplianceItem, GeneratedOutput } from "../../showcaseTypes";
import { headingFromPrompt, normalizeHeading } from "./promptParsing";
import { buildPromptFidelityChecks } from "./promptFidelity";

export type LiveComposerResult =
  | { output: GeneratedOutput; error?: undefined; diagnostics?: undefined; rawOutput?: undefined }
  | { output?: undefined; error: string; diagnostics?: string[]; rawOutput?: unknown };

export async function composeWithLiveApi(prompt: string): Promise<LiveComposerResult> {
  const endpoint = import.meta.env.VITE_AI_COMPOSER_URL as string | undefined;

  if (!endpoint) {
    return { error: "Live composer URL is not configured." };
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
      const errorPayload = await response.json().catch(() => undefined);
      const detail = errorPayload && typeof errorPayload === "object" && "error" in errorPayload
        ? String(errorPayload.error)
        : `Request failed with HTTP ${response.status}.`;

      return {
        error: detail,
        diagnostics: diagnosticsFromErrorPayload(errorPayload),
        rawOutput: rawOutputFromErrorPayload(errorPayload)
      };
    }

    const payload = await response.json();
    const parsed = parsePageComposerResponse(payload);

    if (!parsed.success) {
      return {
        error: "Live composer returned invalid v2 output.",
        diagnostics: parsed.error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`),
        rawOutput: payload
      };
    }

    const livePayload = parsed.data;
    const explicitHeading = headingFromPrompt(prompt);
    const outputTitle = explicitHeading ? normalizeHeading(explicitHeading) : livePayload.title;

    const liveComponents = normalizeComponentNames(livePayload.components);
    const unsupportedComponents = normalizeUnsupportedComponents(livePayload.unsupported ?? []);
    const hasGaps = unsupportedComponents.length > 0;
    const screen = screenFromPage(livePayload, outputTitle, prompt);
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
        status: "Pass",
        detail: "The page was composed from the current prompt by the configured v2 live composer."
      }
    ];

    return {
      output: {
        label: hasGaps ? "Needs System Review" : "Live Screen",
        title: outputTitle,
        summary: livePayload.summary,
        prompt,
        compliance: [...baseCompliance, ...buildPromptFidelityChecks(prompt, screen)],
        approvedComponents: liveComponents,
        unsupportedComponents,
        fingerprint: promptFingerprint(prompt),
        page: livePayload.page,
        screen
      }
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Live composer request failed."
    };
  }
}

function diagnosticsFromErrorPayload(payload: unknown): string[] | undefined {
  if (!isRecord(payload) || !Array.isArray(payload.diagnostics)) {
    return undefined;
  }

  const diagnostics = payload.diagnostics
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (!isRecord(item)) {
        return undefined;
      }

      const path = typeof item.path === "string"
        ? item.path
        : Array.isArray(item.path)
          ? item.path.join(".")
          : "";
      const message = typeof item.message === "string" ? item.message : undefined;

      if (!message) {
        return undefined;
      }

      return path ? `${path}: ${message}` : message;
    })
    .filter((item): item is string => Boolean(item));

  return diagnostics.length ? diagnostics : undefined;
}

function rawOutputFromErrorPayload(payload: unknown): unknown {
  return isRecord(payload) && "output" in payload ? payload.output : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function promptFingerprint(prompt: string) {
  const hash = Array.from(prompt).reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 9973, 17);
  return `prompt-${hash.toString().padStart(4, "0")}`;
}

function screenFromPage(payload: PageComposerResponseBody, title: string, prompt: string): GeneratedScreen {
  const sections = payload.page.sections;
  const alertSection = sections.find((section): section is Extract<PageSection, { type: "alert" }> => section.type === "alert");
  const statsSection = sections.find((section): section is Extract<PageSection, { type: "stats" }> => section.type === "stats");
  const formSections = sections.filter((section): section is Extract<PageSection, { type: "form" }> => section.type === "form");
  const tableSection = sections.find((section): section is Extract<PageSection, { type: "table" }> => section.type === "table");
  const actions = sections.flatMap(sectionActions);

  return {
    kind: screenKindFromPrompt(prompt),
    alert: alertSection
      ? { tone: alertSection.tone, title: alertSection.title, body: alertSection.body }
      : { tone: "neutral", title, body: payload.summary },
    metrics: statsSection?.metrics ?? [],
    fields: formSections.flatMap((section) => section.fields),
    table: tableSection
      ? { columns: tableSection.columns, rows: tableSection.rows }
      : { columns: [], rows: [] },
    primaryAction: actions[0] ?? "Continue",
    secondaryAction: actions[1] ?? "Review page"
  };
}

function sectionActions(section: PageSection): string[] {
  if ("actions" in section && Array.isArray(section.actions)) {
    return section.actions.map((action) => action.label);
  }

  if (section.type === "cardGrid") {
    return section.cards.flatMap((card) => card.action ? [card.action.label] : []);
  }

  return [];
}

function screenKindFromPrompt(prompt: string): ScreenKind {
  const normalized = prompt.toLowerCase();

  if (/(billing|invoice|payment|subscription|plan)/.test(normalized)) {
    return "billing";
  }
  if (/(team|member|role|invite|access|permission)/.test(normalized)) {
    return "team";
  }
  if (/(metric|analytics|dashboard|report|adoption)/.test(normalized)) {
    return "analytics";
  }
  if (/(error|failed|recovery|sync|retry|timeout)/.test(normalized)) {
    return "recovery";
  }
  if (/(onboarding|checklist|setup|task)/.test(normalized)) {
    return "onboarding";
  }
  if (/(empty|no saved|blank|nothing yet)/.test(normalized)) {
    return "empty";
  }

  return "workflow";
}
