import { z } from "zod";

export const approvedComponentNames = ["Alert", "Badge", "Button", "Card", "Input", "Select", "Table", "Tabs", "Textarea"] as const;
export type ApprovedComponentName = (typeof approvedComponentNames)[number];

export const unsupportedComponentNames = [
  "Accordion",
  "Calendar",
  "Chart",
  "Date picker",
  "Drawer",
  "Dropdown menu",
  "File upload",
  "Kanban",
  "Modal",
  "Sidebar",
  "Stepper",
  "Toast",
  "Tooltip",
  "Wizard"
] as const;
export type UnsupportedComponentName = (typeof unsupportedComponentNames)[number];

export const ApprovedComponent = z.enum(approvedComponentNames);

const unsupportedComponentMatchPatterns = unsupportedComponentNames.map((component) =>
  new RegExp(`(^|\\W)${escapeRegExp(component).replace(/\s+/g, "\\s+")}(s)?(?=\\W|$)`, "i")
);

export function clampAllowedComponents(components: unknown): ApprovedComponentName[] {
  if (!Array.isArray(components)) {
    return [...approvedComponentNames];
  }

  const allowed = new Set<string>(approvedComponentNames);
  const selected = components.filter((component): component is ApprovedComponentName => typeof component === "string" && allowed.has(component));
  return Array.from(new Set(selected));
}

export function normalizeUnsupportedComponents(...componentLists: unknown[]): string[] {
  const approved = new Set<string>(approvedComponentNames.map((component) => component.toLowerCase()));
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const componentList of componentLists) {
    if (!Array.isArray(componentList)) {
      continue;
    }

    for (const component of componentList) {
      const value = String(component).trim();
      const key = value.toLowerCase();

      if (!value || approved.has(key) || seen.has(key)) {
        continue;
      }

      seen.add(key);
      normalized.push(value);
    }
  }

  return normalized;
}

export function detectUnsupportedComponentRequests(prompt: string): UnsupportedComponentName[] {
  return unsupportedComponentNames.filter((component, index) =>
    unsupportedComponentMatchPatterns[index].test(prompt)
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
