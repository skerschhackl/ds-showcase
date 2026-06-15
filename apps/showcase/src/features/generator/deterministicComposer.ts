import { inferScreenKind, type GeneratedScreen, type TableCell } from "../../liveComposer";
import type { ComplianceItem, GeneratedOutput } from "../../showcaseTypes";
import { extractActionIntents } from "./actionIntents";
import { titleFromPrompt } from "./promptParsing";
import { buildPromptFidelityChecks } from "./promptFidelity";

export function buildCustomOutput(prompt: string): GeneratedOutput {
  const cleanPrompt = prompt.trim() || "Create a product workflow screen";
  const title = titleFromPrompt(cleanPrompt);
  const unsupportedComponents = findUnsupportedComponents(cleanPrompt);
  const approvedComponents = selectApprovedComponents(cleanPrompt);
  const hasGaps = unsupportedComponents.length > 0;
  const screen = buildGeneratedScreen(cleanPrompt, title, unsupportedComponents);
  const baseCompliance: ComplianceItem[] = [
    {
      label: "Components",
      status: hasGaps ? "Fail" : "Pass",
      detail: hasGaps
        ? `${unsupportedComponents.join(", ")} ${unsupportedComponents.length === 1 ? "is" : "are"} not approved components.`
        : `Generated with approved components: ${approvedComponents.join(", ")}.`
    },
    { label: "Tokens", status: "Pass", detail: "Layout, borders, focus, and status treatments come from shared component styles." },
    {
      label: "Specificity",
      status: "Watch",
      detail: "This deterministic generator converts prompt intent into a governed component plan, not a live model response."
    }
  ];

  return {
    label: hasGaps ? "Needs System Review" : "Custom Screen",
    title,
    summary: hasGaps
      ? "The prompt requests patterns that are not in the approved component set yet."
      : "A prompt-specific composition generated from approved design system primitives.",
    prompt: cleanPrompt,
    compliance: [...baseCompliance, ...buildPromptFidelityChecks(cleanPrompt, screen)],
    approvedComponents,
    unsupportedComponents,
    fingerprint: promptFingerprint(cleanPrompt),
    screen
  };
}

function findUnsupportedComponents(prompt: string) {
  const unsupportedPatterns = [
    "accordion",
    "calendar",
    "chart",
    "date picker",
    "drawer",
    "dropdown menu",
    "file upload",
    "kanban",
    "modal",
    "sidebar",
    "stepper",
    "toast",
    "tooltip",
    "wizard"
  ];
  const normalized = prompt.toLowerCase();
  return unsupportedPatterns.filter((pattern) => normalized.includes(pattern));
}

function selectApprovedComponents(prompt: string) {
  const normalized = prompt.toLowerCase();
  const components = new Set(["Card", "Alert", "Button"]);

  if (/(form|field|input|email|name|search|create|edit|settings)/.test(normalized)) {
    components.add("Input");
  }

  if (/(textarea|long-form|long form|notes?|comments?|description|describe|prompt|feedback|message)/.test(normalized)) {
    components.add("Textarea");
  }

  if (/(role|status|state|filter|category|plan|type|priority)/.test(normalized)) {
    components.add("Select");
    components.add("Badge");
  }

  if (/(list|table|queue|review|history|management|members|rows|records)/.test(normalized)) {
    components.add("Table");
    components.add("Badge");
  }

  if (/(tab|tabs|section)/.test(normalized)) {
    components.add("Tabs");
  }

  return Array.from(components);
}

function buildGeneratedScreen(prompt: string, title: string, unsupportedComponents: string[]): GeneratedScreen {
  const kind = inferScreenKind(prompt);
  const hasGaps = unsupportedComponents.length > 0;
  const gapCopy = unsupportedComponents.join(", ");
  const actionIntents = extractActionIntents(prompt);

  if (hasGaps) {
    return {
      kind,
      alert: {
        tone: "warning",
        title: "Component gap found",
        body: `${gapCopy} ${unsupportedComponents.length === 1 ? "is" : "are"} not in the design system. The screen below uses approved fallbacks.`
      },
      metrics: [
        { label: "Approved fallback", value: "Active" },
        { label: "Missing patterns", value: String(unsupportedComponents.length) },
        { label: "Review state", value: "Blocked" }
      ],
      fields: [
        { label: `${title} request owner`, kind: "input", placeholder: "Assign an owner" },
        { label: "Fallback pattern", kind: "select", options: ["Card + Table", "Alert + Actions", "Form + Status"] }
      ],
      table: {
        columns: ["Requested pattern", "Status", "Fallback"],
        rows: unsupportedComponents.map((component) => [
          component,
          { text: "Not available", tone: "danger" },
          "Use approved components until governed"
        ])
      },
      primaryAction: "Request component",
      secondaryAction: "Use fallback"
    };
  }

  if (kind === "billing") {
    return {
      kind,
      alert: { tone: "success", title: "Billing workspace ready", body: "Plan, payment, and invoice controls were generated from the prompt." },
      metrics: [
        { label: "Current plan", value: "Growth" },
        { label: "Monthly spend", value: "$240" },
        { label: "Open invoices", value: "0" }
      ],
      fields: [
        { label: "Billing email", kind: "input", placeholder: "finance@example.com" },
        { label: "Plan", kind: "select", options: ["Starter", "Growth", "Enterprise"] }
      ],
      table: {
        columns: ["Invoice", "Date", "Status", "Amount"],
        rows: [
          ["INV-1042", "May 01", { text: "Paid", tone: "success" }, "$240.00"],
          ["INV-1038", "Apr 01", { text: "Paid", tone: "success" }, "$240.00"],
          ["INV-1031", "Mar 01", { text: "Archived", tone: "neutral" }, "$180.00"]
        ]
      },
      primaryAction: "Save billing",
      secondaryAction: actionIntents.pageAction ?? "Export invoices"
    };
  }

  if (kind === "team") {
    const rowAction = actionIntents.rowAction;
    const columns = rowAction ? ["Name", "Role", "Status", "Actions"] : ["Name", "Role", "Status"];
    const rows: Array<Array<TableCell>> = [
      ["Ari Lee", "Admin", { text: "Active", tone: "success" }],
      ["Mina Patel", "Member", { text: "Invited", tone: "primary" }],
      ["Noah Kim", "Viewer", { text: "Review", tone: "warning" }]
    ];

    if (rowAction) {
      rows.forEach((row) => row.push({ action: rowAction, variant: "secondary" }));
    }

    return {
      kind,
      alert: { tone: "neutral", title: "Access review generated", body: "Invite controls and member status were generated from the prompt." },
      metrics: [
        { label: "Members", value: "12" },
        { label: "Pending invites", value: "3" },
        { label: "Access reviews", value: "2" }
      ],
      fields: [
        { label: "Invite by email", kind: "input", placeholder: "name@example.com" },
        { label: "Default role", kind: "select", options: ["Viewer", "Member", "Admin"] }
      ],
      table: {
        columns,
        rows
      },
      primaryAction: "Send invite",
      secondaryAction: actionIntents.pageAction ?? "Review access"
    };
  }

  if (kind === "analytics") {
    const rowAction = actionIntents.rowAction;
    const columns = rowAction ? ["Segment", "Signal", "Action", "Actions"] : ["Segment", "Signal", "Action"];
    const rows: Array<Array<TableCell>> = [
      ["New admins", { text: "High intent", tone: "success" }, "Show checklist"],
      ["Dormant teams", { text: "Usage down", tone: "warning" }, "Trigger recovery"],
      ["Enterprise", { text: "Expansion", tone: "primary" }, "Route to account team"]
    ];

    if (rowAction) {
      rows.forEach((row) => row.push({ action: rowAction, variant: "secondary" }));
    }

    return {
      kind,
      alert: { tone: "neutral", title: "Dashboard generated", body: "The prompt was converted into metric cards and a diagnostic table." },
      metrics: [
        { label: "Activation", value: "68%", progress: 68 },
        { label: "Weekly users", value: "12.8k", progress: 82 },
        { label: "Adoption", value: "41%", progress: 41 }
      ],
      fields: [
        { label: "Segment", kind: "select", options: ["All users", "New admins", "Enterprise"] },
        { label: "Time range", kind: "select", options: ["7 days", "30 days", "90 days"] }
      ],
      table: {
        columns,
        rows
      },
      primaryAction: "Refresh dashboard",
      secondaryAction: actionIntents.pageAction ?? "Save report"
    };
  }

  if (kind === "onboarding") {
    return {
      kind,
      alert: { tone: "neutral", title: "Checklist generated", body: "The prompt was converted into setup tasks and next actions." },
      metrics: [
        { label: "Complete", value: "2/5" },
        { label: "Next task", value: "Invite" },
        { label: "Risk", value: "Low" }
      ],
      fields: [
        { label: "Workspace name", kind: "input", placeholder: "Acme workspace" },
        { label: "Setup owner", kind: "select", options: ["Admin", "Ops lead", "Product lead"] }
      ],
      table: {
        columns: ["Task", "Status", "Owner"],
        rows: [
          ["Connect data source", { text: "Done", tone: "success" }, "Admin"],
          ["Invite teammates", { text: "Next", tone: "primary" }, "Ops lead"],
          ["Publish dashboard", { text: "Queued", tone: "neutral" }, "Product lead"]
        ]
      },
      primaryAction: "Start next task",
      secondaryAction: "Skip for now"
    };
  }

  if (kind === "recovery") {
    return {
      kind,
      alert: { tone: "danger", title: "Recovery flow generated", body: "The prompt was converted into a status-first troubleshooting flow." },
      metrics: [
        { label: "Attempts", value: "3" },
        { label: "Last sync", value: "08:14" },
        { label: "State", value: "Failed" }
      ],
      fields: [
        { label: "Incident owner", kind: "input", placeholder: "ops@example.com" },
        { label: "Retry policy", kind: "select", options: ["Manual", "Automatic", "Escalate"] }
      ],
      table: {
        columns: ["Check", "Result", "Next step"],
        rows: [
          ["Credentials", { text: "Valid", tone: "success" }, "No action needed"],
          ["Warehouse", { text: "Timeout", tone: "danger" }, "Retry connection"],
          ["Schema", { text: "Review", tone: "warning" }, "Compare changed tables"]
        ]
      },
      primaryAction: "Retry sync",
      secondaryAction: "Open run log"
    };
  }

  if (kind === "empty") {
    return {
      kind,
      alert: { tone: "neutral", title: "Empty state generated", body: "The prompt was converted into a first-action workflow." },
      metrics: [
        { label: "Saved items", value: "0" },
        { label: "Suggested action", value: "Create" },
        { label: "State", value: "Empty" }
      ],
      fields: [
        { label: "First item name", kind: "input", placeholder: "Q2 report" },
        { label: "Template", kind: "select", options: ["Blank", "Executive summary", "Team report"] }
      ],
      table: {
        columns: ["Step", "Status", "Purpose"],
        rows: [
          ["Create first item", { text: "Primary", tone: "primary" }, "Start the workflow"],
          ["Choose template", { text: "Optional", tone: "neutral" }, "Speed up setup"],
          ["Share with team", { text: "Later", tone: "neutral" }, "Collaborate when ready"]
        ]
      },
      primaryAction: "Create first item",
      secondaryAction: "Browse templates"
    };
  }

  return {
    kind,
    alert: { tone: "neutral", title: "Workflow generated", body: "The prompt was converted into a structured workflow using approved components." },
    metrics: [
      { label: "Items", value: "3" },
      { label: "Status", value: "Draft" },
      { label: "Owner", value: "Team" }
    ],
    fields: [
      { label: `${title} name`, kind: "input", placeholder: "Enter a name" },
      { label: "Priority", kind: "select", options: ["Low", "Medium", "High"] }
    ],
    table: {
      columns: ["Item", "Status", "Next step"],
      rows: [
        [`${title} intake`, { text: "Draft", tone: "primary" }, "Validate details"],
        [`${title} review`, { text: "Review", tone: "warning" }, "Confirm ownership"],
        [`${title} handoff`, { text: "Ready", tone: "success" }, "Route to next step"]
      ]
    },
    primaryAction: "Continue",
    secondaryAction: "Review assumptions"
  };
}

function promptFingerprint(prompt: string) {
  const hash = Array.from(prompt).reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 9973, 17);
  return `prompt-${hash.toString().padStart(4, "0")}`;
}
