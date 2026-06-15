import { inferScreenKind, type GeneratedScreen, type TableCell } from "../../liveComposer";
import type { ComplianceItem, GeneratedOutput } from "../../showcaseTypes";
import { extractActionIntents } from "./actionIntents";
import { titleFromPrompt } from "./promptParsing";
import { buildPromptFidelityChecks } from "./promptFidelity";
import { getCountIntent, type CountIntentKey } from "./promptIntents";

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
    const planOptions = optionsForRequestedCount(
      prompt,
      ["plan"],
      ["Starter", "Growth", "Enterprise", "Scale", "Business", "Custom"]
    );
    const invoiceRows = rowsForRequestedCount(
      prompt,
      ["invoice", "row"],
      [
        ["INV-1042", "May 01", { text: "Paid", tone: "success" }, "$240.00"],
        ["INV-1038", "Apr 01", { text: "Paid", tone: "success" }, "$240.00"],
        ["INV-1031", "Mar 01", { text: "Archived", tone: "neutral" }, "$180.00"]
      ],
      (index) => [`INV-${1031 - index}`, "Feb 01", { text: "Paid", tone: "success" }, "$240.00"]
    );

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
        { label: "Plan", kind: "select", options: planOptions }
      ],
      table: {
        columns: ["Invoice", "Date", "Status", "Amount"],
        rows: invoiceRows
      },
      primaryAction: "Save billing",
      secondaryAction: actionIntents.pageAction ?? "Export invoices"
    };
  }

  if (kind === "team") {
    const rowAction = actionIntents.rowAction;
    const columns = rowAction ? ["Name", "Role", "Status", "Actions"] : ["Name", "Role", "Status"];
    const roleOptions = optionsForRequestedCount(
      prompt,
      ["role"],
      ["Viewer", "Member", "Admin", "Owner", "Billing admin", "Security admin"]
    );
    const rows = rowsForRequestedCount(
      prompt,
      ["member", "row"],
      [
        ["Ari Lee", "Admin", { text: "Active", tone: "success" }],
        ["Mina Patel", "Member", { text: "Invited", tone: "primary" }],
        ["Noah Kim", "Viewer", { text: "Review", tone: "warning" }]
      ],
      (index) => [`Team member ${index + 1}`, roleOptions[index % roleOptions.length], { text: "Active", tone: "success" }]
    );

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
        { label: "Default role", kind: "select", options: roleOptions }
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
    const metricCount = requestedCount(prompt, ["metric"], 3, 6);
    const segmentOptions = optionsForRequestedCount(
      prompt,
      ["segment"],
      ["All users", "New admins", "Enterprise", "Dormant teams", "Trials", "Expansion accounts"]
    );
    const rows = rowsForRequestedCount(
      prompt,
      ["segment", "row"],
      [
        ["New admins", { text: "High intent", tone: "success" }, "Show checklist"],
        ["Dormant teams", { text: "Usage down", tone: "warning" }, "Trigger recovery"],
        ["Enterprise", { text: "Expansion", tone: "primary" }, "Route to account team"]
      ],
      (index) => [segmentOptions[index % segmentOptions.length], { text: "Review", tone: "warning" }, "Prioritize follow-up"]
    );

    if (rowAction) {
      rows.forEach((row) => row.push({ action: rowAction, variant: "secondary" }));
    }

    return {
      kind,
      alert: { tone: "neutral", title: "Dashboard generated", body: "The prompt was converted into metric cards and a diagnostic table." },
      metrics: [
        { label: "Activation", value: "68%", progress: 68 },
        { label: "Weekly users", value: "12.8k", progress: 82 },
        { label: "Adoption", value: "41%", progress: 41 },
        { label: "Retention", value: "57%", progress: 57 },
        { label: "Expansion", value: "24%", progress: 24 },
        { label: "Risk", value: "12%", progress: 12 }
      ].slice(0, metricCount),
      fields: [
        { label: "Segment", kind: "select", options: segmentOptions },
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
    const ownerOptions = optionsForRequestedCount(
      prompt,
      ["owner"],
      ["Admin", "Ops lead", "Product lead", "Customer success", "Implementation lead", "Security lead"]
    );
    const taskRows = rowsForRequestedCount(
      prompt,
      ["task", "row"],
      [
        ["Connect data source", { text: "Done", tone: "success" }, "Admin"],
        ["Invite teammates", { text: "Next", tone: "primary" }, "Ops lead"],
        ["Publish dashboard", { text: "Queued", tone: "neutral" }, "Product lead"]
      ],
      (index) => [`Setup task ${index + 1}`, { text: "Queued", tone: "neutral" }, ownerOptions[index % ownerOptions.length]]
    );

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
        { label: "Setup owner", kind: "select", options: ownerOptions }
      ],
      table: {
        columns: ["Task", "Status", "Owner"],
        rows: taskRows
      },
      primaryAction: "Start next task",
      secondaryAction: "Skip for now"
    };
  }

  if (kind === "recovery") {
    const retryPolicyOptions = optionsForRequestedCount(
      prompt,
      ["retryPolicy"],
      ["Manual", "Automatic", "Escalate", "Backoff", "Notify owner", "Pause sync"]
    );
    const checkRows = rowsForRequestedCount(
      prompt,
      ["check", "row"],
      [
        ["Credentials", { text: "Valid", tone: "success" }, "No action needed"],
        ["Warehouse", { text: "Timeout", tone: "danger" }, "Retry connection"],
        ["Schema", { text: "Review", tone: "warning" }, "Compare changed tables"]
      ],
      (index) => [`Recovery check ${index + 1}`, { text: "Review", tone: "warning" }, "Confirm next step"]
    );

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
        { label: "Retry policy", kind: "select", options: retryPolicyOptions }
      ],
      table: {
        columns: ["Check", "Result", "Next step"],
        rows: checkRows
      },
      primaryAction: "Retry sync",
      secondaryAction: "Open run log"
    };
  }

  if (kind === "empty") {
    const itemRows = rowsForRequestedCount(
      prompt,
      ["item", "row"],
      [
        ["Create first item", { text: "Primary", tone: "primary" }, "Start the workflow"],
        ["Choose template", { text: "Optional", tone: "neutral" }, "Speed up setup"],
        ["Share with team", { text: "Later", tone: "neutral" }, "Collaborate when ready"]
      ],
      (index) => [`Empty state step ${index + 1}`, { text: "Optional", tone: "neutral" }, "Prepare the workspace"]
    );

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
        rows: itemRows
      },
      primaryAction: "Create first item",
      secondaryAction: "Browse templates"
    };
  }

  const workflowRows = rowsForRequestedCount(
    prompt,
    ["item", "row"],
    [
      [`${title} intake`, { text: "Draft", tone: "primary" }, "Validate details"],
      [`${title} review`, { text: "Review", tone: "warning" }, "Confirm ownership"],
      [`${title} handoff`, { text: "Ready", tone: "success" }, "Route to next step"]
    ],
    (index) => [`${title} item ${index + 1}`, { text: "Draft", tone: "primary" }, "Validate details"]
  );

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
      rows: workflowRows
    },
    primaryAction: "Continue",
    secondaryAction: "Review assumptions"
  };
}

function promptFingerprint(prompt: string) {
  const hash = Array.from(prompt).reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 9973, 17);
  return `prompt-${hash.toString().padStart(4, "0")}`;
}

function optionsForRequestedCount(prompt: string, keys: CountIntentKey[], options: string[]) {
  return options.slice(0, requestedCount(prompt, keys, 3, options.length));
}

function rowsForRequestedCount(
  prompt: string,
  keys: CountIntentKey[],
  baseRows: Array<Array<TableCell>>,
  buildRow: (index: number) => Array<TableCell>
) {
  const count = requestedCount(prompt, keys, baseRows.length, 8);
  const rows = baseRows.slice(0, count);

  while (rows.length < count) {
    rows.push(buildRow(rows.length));
  }

  return rows;
}

function requestedCount(prompt: string, keys: CountIntentKey[], fallback: number, max: number) {
  const requested = keys
    .map((key) => getCountIntent(prompt, key))
    .find((count): count is number => typeof count === "number");

  return Math.min(requested ?? fallback, max);
}
