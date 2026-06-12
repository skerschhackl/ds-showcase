import { Wand2 } from "lucide-react";
import { Alert, Badge, Button, Card, Input, Select, Table, Textarea } from "@ds/components";
import {
  approvedComponentNames,
  inferScreenKind,
  normalizeComponentNames,
  normalizeLivePayload,
  normalizeLiveScreen,
  normalizeUnsupportedComponents,
  type GeneratedScreen,
  type TableCell
} from "./liveComposer";
import type { ComplianceItem, GeneratedOutput } from "./showcaseTypes";

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
    compliance: [...baseCompliance, ...promptFidelityChecks(cleanPrompt, screen)],
    approvedComponents,
    unsupportedComponents,
    fingerprint: promptFingerprint(cleanPrompt),
    screen
  };
}

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
      compliance: [...baseCompliance, ...promptFidelityChecks(prompt, screen)],
      approvedComponents: liveComponents,
      unsupportedComponents,
      fingerprint: promptFingerprint(prompt),
      screen
    };
  } catch {
    return undefined;
  }
}

export function GeneratedScreenSkeleton() {
  return (
    <div className="screen-stack" aria-live="polite" aria-busy="true">
      <div className="skeleton-alert">
        <span className="skeleton-line skeleton-line--title" />
        <span className="skeleton-line" />
      </div>

      <div className="generated-surface generated-surface--loading">
        <div className="generated-surface__header">
          <div>
            <span className="skeleton-line skeleton-line--eyebrow" />
            <span className="skeleton-line skeleton-line--heading" />
          </div>
          <span className="skeleton-pill" />
        </div>

        <div className="generated-grid">
          {[0, 1, 2].map((item) => (
            <Card key={item}>
              <span className="skeleton-line skeleton-line--label" />
              <span className="skeleton-line skeleton-line--metric" />
            </Card>
          ))}
        </div>

        <div className="form-grid">
          <span className="skeleton-field" />
          <span className="skeleton-field" />
        </div>

        <div className="skeleton-table">
          <span className="skeleton-line" />
          <span className="skeleton-line" />
          <span className="skeleton-line" />
        </div>
      </div>
    </div>
  );
}

export function CustomGeneratedScreen({ output }: { output: GeneratedOutput }) {
  const approvedComponents = output.approvedComponents ?? ["Card", "Alert", "Button"];
  const unsupportedComponents = output.unsupportedComponents ?? [];
  const hasGaps = unsupportedComponents.length > 0;
  const { screen } = output;
  const metrics = Array.isArray(screen.metrics) ? screen.metrics : [];
  const fields = Array.isArray(screen.fields) ? screen.fields : [];
  const tableColumns = Array.isArray(screen.table?.columns) ? screen.table.columns : ["Item", "Status", "Action"];
  const tableRows = Array.isArray(screen.table?.rows) ? screen.table.rows : [];
  const promptFidelityWarnings = output.compliance.filter((item) => item.label === "Prompt fidelity" && item.status !== "Pass");
  const actions = previewActionsForScreen(screen, promptFidelityWarnings.length > 0);

  return (
    <div className="screen-stack">
      <div className="generation-detail">
        <div>
          <span className="metric-label">Prompt trace</span>
          <p>{output.prompt}</p>
        </div>
        <div>
          <span className="metric-label">{hasGaps ? "Unavailable request" : "Generated with approved components"}</span>
          <div className="badge-row">
            {(hasGaps ? unsupportedComponents : approvedComponents).map((component) => (
              <Badge key={component} tone={hasGaps ? "danger" : "success"}>{component}</Badge>
            ))}
          </div>
        </div>
      </div>

      {promptFidelityWarnings.map((warning) => (
        <Alert key={warning.detail} tone="warning" title="Prompt request not rendered">
          {warning.detail}
        </Alert>
      ))}

      <div className="generated-surface">
        <div className="generated-surface__header generated-surface__header--plain">
          <div>
            <h3>{output.title}</h3>
          </div>
        </div>

        <Alert tone={screen.alert.tone} title={screen.alert.title}>{screen.alert.body}</Alert>

        <div className="generated-grid">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <span className="metric-label">{metric.label}</span>
              <strong className="metric-value metric-value--small">{metric.value}</strong>
              {typeof metric.progress === "number" ? (
                <span className="metric-bar"><span style={{ width: `${metric.progress}%` }} /></span>
              ) : null}
            </Card>
          ))}
        </div>

        <div className="form-grid">
          {fields.map((field) =>
            field.kind === "textarea" ? (
              <Textarea
                key={field.label}
                label={field.label}
                placeholder={field.placeholder}
                rows={field.rows ?? 4}
              />
            ) : field.kind === "select" ? (
              <Select
                key={field.label}
                label={field.label}
                defaultValue={field.options?.[0]?.toLowerCase().replace(/\s+/g, "-") ?? "option"}
                options={(field.options ?? ["Option"]).map((option) => ({
                  label: option,
                  value: option.toLowerCase().replace(/\s+/g, "-")
                }))}
              />
            ) : (
              <Input key={field.label} label={field.label} placeholder={field.placeholder} />
            )
          )}
        </div>

        <Table
          columns={tableColumns}
          rows={tableRows.map((row) =>
            row.map((cell) =>
              renderTableCell(cell)
            )
          )}
        />
      </div>

      {actions.length ? (
        <div className="button-row">
          {actions.map((action, index) => (
            <Button key={action} variant={index === 0 ? "primary" : "secondary"} type="button">
              {index === 0 ? <Wand2 size={16} aria-hidden="true" /> : null}
              {action}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
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
  const tableAction = rowActionFromPrompt(prompt);

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
    const requestedAction = screenActionFromPrompt(prompt);

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
      secondaryAction: requestedAction ?? "Export invoices"
    };
  }

  if (kind === "team") {
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
        columns: ["Name", "Role", "Status"],
        rows: [
          ["Ari Lee", "Admin", { text: "Active", tone: "success" }],
          ["Mina Patel", "Member", { text: "Invited", tone: "primary" }],
          ["Noah Kim", "Viewer", { text: "Review", tone: "warning" }]
        ]
      },
      primaryAction: "Send invite",
      secondaryAction: "Review access"
    };
  }

  if (kind === "analytics") {
    const columns = tableAction ? ["Segment", "Signal", "Action", "Actions"] : ["Segment", "Signal", "Action"];
    const rows: Array<Array<TableCell>> = [
      ["New admins", { text: "High intent", tone: "success" }, "Show checklist"],
      ["Dormant teams", { text: "Usage down", tone: "warning" }, "Trigger recovery"],
      ["Enterprise", { text: "Expansion", tone: "primary" }, "Route to account team"]
    ];

    if (tableAction) {
      rows.forEach((row) => row.push({ action: tableAction, variant: "secondary" }));
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
      secondaryAction: "Save report"
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

function rowActionFromPrompt(prompt: string) {
  const normalized = prompt.toLowerCase();

  if (/download/.test(normalized)) {
    return "Download";
  }
  if (/(delete|remove)/.test(normalized)) {
    return "Delete";
  }
  if (/archive/.test(normalized)) {
    return "Archive";
  }
  if (/approve/.test(normalized)) {
    return "Approve";
  }
  if (/export/.test(normalized)) {
    return "Export";
  }

  return undefined;
}

function screenActionFromPrompt(prompt: string) {
  const normalized = prompt.toLowerCase();

  if (/download\s+all\s+entries/.test(normalized)) {
    return "Download all entries";
  }
  if (/download/.test(normalized)) {
    return "Download";
  }
  if (/export\s+all\s+entries/.test(normalized)) {
    return "Export all entries";
  }

  return undefined;
}

function promptFidelityChecks(prompt: string, screen: GeneratedScreen): ComplianceItem[] {
  const requestedAction = requestedRowActionFromPrompt(prompt);

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

function requestedRowActionFromPrompt(prompt: string): string | undefined {
  const normalized = prompt.toLowerCase();
  const mentionsRowContext = /\b(each|per|row|rows|member|members|individual|individually)\b/.test(normalized);
  const mentionsButton = /\b(button|action|command|control)\b/.test(normalized);

  if (!mentionsRowContext || !mentionsButton) {
    return undefined;
  }

  return screenActionFromPrompt(prompt) ?? rowActionFromPrompt(prompt);
}

function tableHasActionCell(screen: GeneratedScreen): boolean {
  const rows = Array.isArray(screen.table?.rows) ? screen.table.rows : [];

  return rows.some((row) => row.some((cell) => typeof cell === "object" && cell !== null && Boolean(actionLabelFromTableCell(cell))));
}

function previewActionsForScreen(screen: GeneratedScreen, hasUnrenderedTableAction: boolean): string[] {
  if (hasUnrenderedTableAction) {
    return [];
  }

  const actions = [screen.primaryAction, screen.secondaryAction]
    .map((action) => action.replace(/\s+/g, " ").trim())
    .filter((action) => action && !isFallbackAction(action));

  return Array.from(new Set(actions));
}

function isFallbackAction(action: string): boolean {
  return /^(continue|review assumptions|use fallback)$/i.test(action);
}

function promptFingerprint(prompt: string) {
  const hash = Array.from(prompt).reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 9973, 17);
  return `prompt-${hash.toString().padStart(4, "0")}`;
}

function titleFromPrompt(prompt: string) {
  const requestedHeading = headingFromPrompt(prompt);

  if (requestedHeading) {
    return normalizeHeading(requestedHeading);
  }

  const withoutLeadVerb = prompt
    .replace(/^(generate|create|build|design|make)\s+(an?\s+)?/i, "")
    .replace(/\s+using\s+.*$/i, "")
    .replace(/\s+with\s+approved.*$/i, "")
    .trim();
  const words = withoutLeadVerb.split(/\s+/).slice(0, 5);
  const title = words.length ? words.join(" ") : "Product Workflow";
  return title
    .replace(/[^\w\s-]/g, "")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function headingFromPrompt(prompt: string) {
  const match = prompt.match(/heading(?:\s+at\s+the\s+top)?\s+(?:saying|called|titled|named)\s+["']([^"']+)["']/i);
  return match?.[1]?.trim();
}

function titleCase(value: string) {
  return value
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeHeading(value: string) {
  return value
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function renderTableCell(cell: TableCell | unknown) {
  if (cell == null) {
    return "";
  }

  if (typeof cell !== "object") {
    return String(cell);
  }

  const action = actionLabelFromTableCell(cell);

  if (action) {
    return (
      <Button size="sm" variant={buttonVariantFromTableCell(cell)}>
        {action}
      </Button>
    );
  }

  const badgeText = badgeTextFromTableCell(cell);

  if (badgeText) {
    return <Badge tone={badgeToneFromTableCell(cell)}>{badgeText}</Badge>;
  }

  return JSON.stringify(cell);
}

function badgeTextFromTableCell(cell: object): string | undefined {
  if (!isRecord(cell)) {
    return undefined;
  }

  if (typeof cell.text === "string" || typeof cell.text === "number" || typeof cell.text === "boolean") {
    return String(cell.text);
  }

  return undefined;
}

function badgeToneFromTableCell(cell: object): "neutral" | "primary" | "success" | "warning" | "danger" {
  if (!isRecord(cell)) {
    return "neutral";
  }

  return cell.tone === "primary" || cell.tone === "success" || cell.tone === "warning" || cell.tone === "danger"
    ? cell.tone
    : "neutral";
}

function actionLabelFromTableCell(cell: object): string | undefined {
  if (!isRecord(cell)) {
    return undefined;
  }

  const directAction = normalizeActionLabel(cell.action);

  if (directAction) {
    return directAction;
  }

  if (isRecord(cell.action)) {
    const nestedAction = normalizeActionLabel(cell.action.label) ?? normalizeActionLabel(cell.action.text);

    if (nestedAction) {
      return nestedAction;
    }
  }

  const kind = typeof cell.kind === "string" ? cell.kind.toLowerCase() : "";
  const type = typeof cell.type === "string" ? cell.type.toLowerCase() : "";
  const label = normalizeActionLabel(cell.label) ?? normalizeActionLabel(cell.button);

  if ((kind === "button" || kind === "action" || type === "button" || type === "action") && label) {
    return label;
  }

  return undefined;
}

function buttonVariantFromTableCell(cell: object): "primary" | "secondary" | "ghost" {
  if (!isRecord(cell)) {
    return "secondary";
  }

  return cell.variant === "primary" || cell.variant === "ghost" ? cell.variant : "secondary";
}

function normalizeActionLabel(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const label = value.replace(/\s+/g, " ").trim();
  return label || undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
