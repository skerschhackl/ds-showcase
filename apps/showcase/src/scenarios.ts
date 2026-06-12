import type { AppView, HeroContent, Scenario } from "./showcaseTypes";

export const heroContent: Record<AppView, HeroContent> = {
  generator: {
    badge: "AI-enabled design system",
    title: "A design system both people and AI can build from.",
    body: "Generate product UI from governed prompts, render it with approved components, and review the result against design-system rules.",
    signalLabel: "Governed generation workflow",
    signal: [
      { label: "Prompt", detail: "Intent", active: true },
      { label: "Components", detail: "Primitives" },
      { label: "Tokens", detail: "Style rules" },
      { label: "Eval", detail: "Review" }
    ]
  },
  components: {
    badge: "Approved Component System",
    title: "Governed building blocks for generated screens.",
    body: "Explore the approved primitives, token evidence, states, and gaps that determine what the generator can safely compose.",
    signalLabel: "Component library workflow",
    signal: [
      { label: "Components", detail: "Inventory", active: true },
      { label: "Tokens", detail: "Evidence" },
      { label: "States", detail: "Variants" },
      { label: "Gaps", detail: "Requests" }
    ]
  }
};

export const scenarios: Scenario[] = [
  {
    id: "billing",
    label: "Billing",
    prompt: "Generate a billing settings page for a B2B workspace using approved components.",
    title: "Billing Settings",
    summary: "Plan controls, invoice history, and payment state for a finance admin.",
    compliance: [
      { label: "Components", status: "Pass", detail: "Button, Badge, Select, Alert, and Table are approved." },
      { label: "Tokens", status: "Pass", detail: "Spacing, borders, status color, and focus states use tokenized styles." },
      { label: "Content", status: "Watch", detail: "Invoice export labels should stay action-oriented." }
    ]
  },
  {
    id: "team",
    label: "Team",
    prompt: "Create a team management screen with roles, invites, and access review.",
    title: "Team Management",
    summary: "Role assignment and invitation review for a growing product team.",
    compliance: [
      { label: "Components", status: "Pass", detail: "Table and Badge encode role and status consistently." },
      { label: "Accessibility", status: "Pass", detail: "Form labels and tab state are exposed to assistive tech." },
      { label: "Layout", status: "Pass", detail: "Dense operational controls remain scannable." }
    ]
  },
  {
    id: "analytics",
    label: "Analytics",
    prompt: "Build an analytics dashboard for product adoption using system cards and tables.",
    title: "Adoption Analytics",
    summary: "Compact product metrics with a segment filter and review queue.",
    compliance: [
      { label: "Tokens", status: "Pass", detail: "Metric panels use shared surface, border, and spacing tokens." },
      { label: "Layout", status: "Pass", detail: "High-priority metrics precede diagnostic detail." },
      { label: "Drift", status: "Watch", detail: "Charts are represented as simple tokenized bars in v1." }
    ]
  },
  {
    id: "onboarding",
    label: "Onboarding",
    prompt: "Design an onboarding checklist that guides a new admin through workspace setup.",
    title: "Workspace Onboarding",
    summary: "A task-based flow for setup progress and next best action.",
    compliance: [
      { label: "Components", status: "Pass", detail: "Badges, Alerts, and Buttons support the checklist pattern." },
      { label: "Content", status: "Pass", detail: "Steps use clear verbs and visible ownership." },
      { label: "Accessibility", status: "Pass", detail: "Status is conveyed by text as well as color." }
    ]
  },
  {
    id: "empty",
    label: "Empty State",
    prompt: "Create an empty state for a reporting area with no saved reports yet.",
    title: "Reports",
    summary: "A focused empty state that offers a productive first action.",
    compliance: [
      { label: "Content", status: "Pass", detail: "The message explains the state and the primary action." },
      { label: "Components", status: "Pass", detail: "Approved Button and Card patterns are used." },
      { label: "Layout", status: "Pass", detail: "No decorative illustration is required for this operational state." }
    ]
  },
  {
    id: "recovery",
    label: "Recovery",
    prompt: "Generate an error recovery flow for a failed data sync.",
    title: "Data Sync Recovery",
    summary: "A status-first troubleshooting surface with retry and support paths.",
    compliance: [
      { label: "Accessibility", status: "Pass", detail: "The error alert uses an assertive role." },
      { label: "Content", status: "Pass", detail: "Recovery actions are specific and sequenced." },
      { label: "Tokens", status: "Pass", detail: "Danger and warning treatments use the shared palette." }
    ]
  }
];
