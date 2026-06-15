import type { GeneratedScreen } from "../../liveComposer";
import type { ComplianceItem } from "../../showcaseTypes";
import { extractActionIntents } from "./actionIntents";

export function buildPromptFidelityChecks(prompt: string, screen: GeneratedScreen): ComplianceItem[] {
  const requestedAction = extractActionIntents(prompt).rowAction;

  if (!requestedAction || tableHasActionCell(screen)) {
    return [];
  }

  return [
    {
      label: "Prompt fidelity",
      status: "Watch",
      detail: `The prompt asked for a table/member action (${requestedAction}), but the generated table did not include action cells. The action may need to be configured as a supported row action or intentionally excluded by generation rules.`
    }
  ];
}

function tableHasActionCell(screen: GeneratedScreen): boolean {
  const rows = Array.isArray(screen.table?.rows) ? screen.table.rows : [];

  return rows.some((row) => row.some((cell) => typeof cell === "object" && cell !== null && "action" in cell));
}
