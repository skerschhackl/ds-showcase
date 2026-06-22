import { Wand2 } from "lucide-react";
import { Alert, Badge, Button, Card, Input, Select, Table, Textarea } from "@ds/components";
import type { GeneratedScreen, TableCell } from "../../liveComposer";
import type { GeneratedOutput } from "../../showcaseTypes";

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
  const actions = previewActionsForScreen(screen);

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

function previewActionsForScreen(screen: GeneratedScreen): string[] {
  const actions = [screen.primaryAction, screen.secondaryAction]
    .map((action) => action.replace(/\s+/g, " ").trim())
    .filter((action) => action && !isFallbackAction(action));

  return Array.from(new Set(actions));
}

function isFallbackAction(action: string): boolean {
  return /^(continue|review assumptions|use fallback)$/i.test(action);
}

function renderTableCell(cell: TableCell | unknown) {
  if (cell == null) {
    return "";
  }

  if (isActionsCell(cell)) {
    return (
      <span className="table-action-group">
        {cell.actions.map((actionCell, index) => (
          <span key={`${actionCell.action}-${index}`}>{renderTableCell(actionCell)}</span>
        ))}
      </span>
    );
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

function isActionsCell(cell: unknown): cell is { actions: Array<{ action: string; variant?: "primary" | "secondary" | "ghost" }> } {
  return isRecord(cell) && Array.isArray(cell.actions);
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
