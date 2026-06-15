import type { GeneratedScreen } from "../../liveComposer";
import type { ComplianceItem } from "../../showcaseTypes";
import { extractActionIntents } from "./actionIntents";
import { extractCountIntents, type CountIntent, type CountIntentKey } from "./promptIntents";

export function buildPromptFidelityChecks(prompt: string, screen: GeneratedScreen): ComplianceItem[] {
  const requestedAction = extractActionIntents(prompt).rowAction;
  const checks: ComplianceItem[] = [];

  if (requestedAction && !tableHasActionCell(screen)) {
    checks.push({
      label: "Prompt fidelity",
      status: "Watch",
      detail: `The prompt asked for a table/member action (${requestedAction}), but the generated table did not include action cells. The action may need to be configured as a supported row action or intentionally excluded by generation rules.`
    });
  }

  return [...checks, ...buildCountFidelityChecks(prompt, screen)];
}

function tableHasActionCell(screen: GeneratedScreen): boolean {
  const rows = Array.isArray(screen.table?.rows) ? screen.table.rows : [];

  return rows.some((row) => row.some((cell) => typeof cell === "object" && cell !== null && "action" in cell));
}

function buildCountFidelityChecks(prompt: string, screen: GeneratedScreen): ComplianceItem[] {
  return extractCountIntents(prompt)
    .flatMap((intent) => {
      const renderedCount = renderedCountForIntent(screen, intent);

      if (renderedCount === undefined || renderedCount >= intent.count) {
        return [];
      }

      return [{
        label: "Prompt fidelity",
        status: "Watch",
        detail: `The prompt asked for ${intent.count} ${intent.label}, but the generated screen rendered ${renderedCount}.`
      }];
    });
}

function renderedCountForIntent(screen: GeneratedScreen, intent: CountIntent): number | undefined {
  const selectLabel = selectLabelForCountIntent(intent.key);

  if (selectLabel) {
    return selectOptionCount(screen, selectLabel);
  }

  if (intent.key === "field") {
    return Array.isArray(screen.fields) ? screen.fields.length : undefined;
  }

  if (intent.key === "metric") {
    return Array.isArray(screen.metrics) ? screen.metrics.length : undefined;
  }

  return Array.isArray(screen.table?.rows) ? screen.table.rows.length : undefined;
}

function selectLabelForCountIntent(key: CountIntentKey) {
  const labels: Partial<Record<CountIntentKey, string>> = {
    owner: "owner",
    plan: "plan",
    retryPolicy: "retry policy",
    role: "role",
    segment: "segment",
    status: "status"
  };

  return labels[key];
}

function selectOptionCount(screen: GeneratedScreen, labelMatch: string): number | undefined {
  const field = screen.fields.find((item) =>
    item.kind === "select" && item.label.toLowerCase().includes(labelMatch)
  );

  return field?.options?.length;
}
