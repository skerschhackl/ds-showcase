import {
  approvedComponentNames as schemaApprovedComponentNames,
  normalizeLiveComposerResponse,
  normalizeLiveComposerScreen,
  parseLiveComposerResponse,
  type LiveComposerResponseBody,
  type LiveComposerScreen,
  type TableCellValue
} from "@ds/ai-contracts";

export type KnownScreenKind = "billing" | "team" | "analytics" | "onboarding" | "empty" | "recovery";
export type ScreenKind = KnownScreenKind | "workflow";
export type TableCell = TableCellValue;
export type GeneratedScreen = LiveComposerScreen & { kind: ScreenKind };
export type LiveComposerPayload = LiveComposerResponseBody & {
  diagnostics?: Array<{ path: string; message: string }>;
};

export const approvedComponentNames = [...schemaApprovedComponentNames];

export function inferScreenKind(value: string): ScreenKind {
  const normalized = value.toLowerCase();

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

export function normalizeLiveScreen(screen: unknown, title: string, kindContext = title): GeneratedScreen {
  return {
    kind: inferScreenKind(`${title} ${kindContext}`),
    ...normalizeLiveComposerScreen(screen, title)
  };
}

export function normalizeLivePayload(payload: unknown, fallbackTitle?: string) {
  return normalizeLiveComposerResponse(payload, fallbackTitle);
}

export function normalizeComponentNames(components: string[]): string[] {
  const allowedLookup = new Map(approvedComponentNames.map((component) => [component.toLowerCase(), component]));
  const normalized = components
    .flatMap((component) => {
      const approvedComponent = allowedLookup.get(component.toLowerCase());
      return approvedComponent ? [approvedComponent] : [];
    });

  return Array.from(new Set(normalized));
}

export function normalizeUnsupportedComponents(components: string[]) {
  const approvedLookup = new Set(approvedComponentNames.map((component) => component.toLowerCase()));
  const seen = new Set<string>();
  const normalized = components
    .map((component) => component.trim())
    .filter((component) => {
      const key = component.toLowerCase();
      const keep = component && !approvedLookup.has(key) && !seen.has(key);
      seen.add(key);
      return keep;
    });

  return normalized;
}

export function isLiveComposerPayload(payload: unknown): payload is LiveComposerPayload {
  return parseLiveComposerResponse(payload).success;
}
