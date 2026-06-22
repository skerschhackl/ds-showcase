import { clampAllowedComponents, normalizeUnsupportedComponents } from "./approved-components.js";
import { parseLiveComposerResponse, type LiveComposerResponseBody, type LiveComposerScreen, type TableCellValue } from "./live-composer-response.js";

export type NormalizationDiagnostic = { path: string; message: string };

export function normalizeLiveComposerResponse(
  payload: unknown,
  fallbackTitle = "Generated screen"
): { data: LiveComposerResponseBody; diagnostics: NormalizationDiagnostic[] } {
  const parsed = parseLiveComposerResponse(payload);

  if (parsed.success) {
    return {
      data: {
        ...parsed.data,
        components: clampAllowedComponents(parsed.data.components),
        unsupported: normalizeUnsupportedComponents(parsed.data.unsupported, parsed.data.components),
        screen: normalizeLiveComposerScreen(parsed.data.screen, parsed.data.title)
      },
      diagnostics: []
    };
  }

  const source = isRecord(payload) ? payload : {};
  const title = typeof source.title === "string" && source.title.trim() ? source.title : fallbackTitle;

  return {
    data: {
      title,
      summary: typeof source.summary === "string" && source.summary.trim()
        ? source.summary
        : "The model returned a partial screen, so missing parts were filled with safe defaults.",
      components: clampAllowedComponents(Array.isArray(source.components) ? source.components : undefined),
      unsupported: normalizeUnsupportedComponents(source.unsupported, source.components),
      screen: normalizeLiveComposerScreen(source.screen, title)
    },
    diagnostics: parsed.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message
    }))
  };
}

export function normalizeLiveComposerScreen(screen: unknown, title = "Generated screen"): LiveComposerScreen {
  const source = isRecord(screen) ? screen : {};
  const alert = isRecord(source.alert) ? source.alert : {};
  const table = isRecord(source.table) ? source.table : {};
  const actionFromFields = findFieldAction(source.fields);
  const primaryAction = normalizeActionLabel(source.primaryAction) ?? actionFromFields ?? "Continue";

  return {
    alert: {
      tone: normalizeAlertTone(alert.tone),
      title: typeof alert.title === "string" ? alert.title : "Generated screen",
      body: typeof alert.body === "string" ? alert.body : "The model returned a partial screen, so missing parts were filled with safe defaults."
    },
    metrics: normalizeMetrics(source.metrics),
    fields: normalizeFields(source.fields, title),
    table: {
      columns: normalizeStringArray(table.columns, ["Item", "Status", "Action"]),
      rows: normalizeRows(table.rows, title)
    },
    primaryAction,
    secondaryAction: normalizeActionLabel(source.secondaryAction) ?? (actionFromFields === primaryAction ? "Review assumptions" : actionFromFields) ?? "Review assumptions"
  };
}

function normalizeMetrics(metrics: unknown): LiveComposerScreen["metrics"] {
  if (!Array.isArray(metrics) || metrics.length === 0) {
    return [
      { label: "Generated", value: "Ready" },
      { label: "Review", value: "Needed" },
      { label: "Source", value: "Live" }
    ];
  }

  return metrics.slice(0, 4).map((metric, index) => {
    const source = isRecord(metric) ? metric : {};
    const progress = typeof source.progress === "number" ? clamp(source.progress, 0, 100) : undefined;

    return {
      label: typeof source.label === "string" ? source.label : `Metric ${index + 1}`,
      value: typeof source.value === "string" || typeof source.value === "number" ? String(source.value) : "Generated",
      ...(progress === undefined ? {} : { progress })
    };
  });
}

function normalizeFields(fields: unknown, title: string): LiveComposerScreen["fields"] {
  if (!Array.isArray(fields) || fields.length === 0) {
    return [
      { label: `${title} name`, kind: "input", placeholder: "Enter a value" },
      { label: "Status", kind: "select", options: ["Draft", "Ready", "Review"] }
    ];
  }

  return fields.filter((field) => !isActionField(field)).slice(0, 4).map((field, index) => {
    const source = isRecord(field) ? field : {};
    const kind = normalizeFieldKind(source.kind);

    return {
      label: typeof source.label === "string" ? source.label : `Field ${index + 1}`,
      kind,
      ...(typeof source.placeholder === "string" ? { placeholder: source.placeholder } : {}),
      ...(Array.isArray(source.options) ? { options: source.options.map(String) } : {}),
      ...(typeof source.rows === "number" ? { rows: clamp(Math.round(source.rows), 2, 12) } : {})
    };
  });
}

function normalizeFieldKind(value: unknown): "input" | "select" | "textarea" {
  return value === "select" || value === "textarea" ? value : "input";
}

function findFieldAction(fields: unknown): string | undefined {
  if (!Array.isArray(fields)) {
    return undefined;
  }

  for (const field of fields) {
    if (!isActionField(field)) {
      continue;
    }

    const source = isRecord(field) ? field : {};
    const label = normalizeActionLabel(source.action) ?? normalizeActionLabel(source.label);

    if (label) {
      return label;
    }
  }

  return undefined;
}

function isActionField(field: unknown): boolean {
  if (!isRecord(field)) {
    return false;
  }

  const kind = typeof field.kind === "string" ? field.kind.toLowerCase() : "";
  const label = typeof field.label === "string" ? field.label : "";

  return kind === "button" || kind === "action" || kind === "submit" || isActionLabel(label);
}

function normalizeActionLabel(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const label = value.replace(/\s+/g, " ").trim();
  return label || undefined;
}

function isActionLabel(value: string): boolean {
  return /\b(download|export|delete|remove|approve|archive|retry|save|submit|continue)\b/i.test(value);
}

function normalizeRows(rows: unknown, title: string): TableCellValue[][] {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [
      [`${title} intake`, { text: "Draft", tone: "primary" }, "Validate details"],
      [`${title} review`, { text: "Review", tone: "warning" }, "Confirm ownership"]
    ];
  }

  return rows.slice(0, 10).map((row) => {
    if (!Array.isArray(row)) {
      return [String(row), { text: "Review", tone: "warning" }, "Normalize row"];
    }

    return row.map(normalizeTableCell);
  });
}

function normalizeTableCell(cell: unknown): TableCellValue {
  if (cell == null || typeof cell === "string" || typeof cell === "number" || typeof cell === "boolean") {
    return cell == null ? "" : cell;
  }

  if (Array.isArray(cell)) {
    const actions = normalizeActionCellArray(cell);

    return actions
      ? { actions }
      : cell.map((item) => tableCellToPlainText(normalizeTableCell(item))).filter(Boolean).join(", ");
  }

  if (!isRecord(cell)) {
    return String(cell);
  }

  if (Array.isArray(cell.actions)) {
    const actions = normalizeActionCellArray(cell.actions);

    if (actions) {
      return { actions };
    }
  }

  const action = actionLabelFromCell(cell);

  if (action) {
    return {
      action,
      variant: normalizeButtonVariant(cell.variant)
    };
  }

  if (typeof cell.text === "string") {
    return {
      text: cell.text,
      tone: normalizeBadgeTone(cell.tone)
    };
  }

  return JSON.stringify(cell);
}

function normalizeActionCellArray(
  cell: unknown[]
): Array<{ action: string; variant: "primary" | "secondary" | "ghost" }> | undefined {
  if (cell.length === 0) {
    return undefined;
  }

  const actions = cell.map((item) => {
    if (!isRecord(item)) {
      return undefined;
    }

    const action = actionLabelFromCell(item);
    return action ? { action, variant: normalizeButtonVariant(item.variant) } : undefined;
  });

  return actions.every((action): action is { action: string; variant: "primary" | "secondary" | "ghost" } => Boolean(action))
    ? actions
    : undefined;
}

function tableCellToPlainText(cell: TableCellValue): string {
  if (typeof cell === "string" || typeof cell === "number" || typeof cell === "boolean") {
    return String(cell);
  }

  if ("text" in cell) {
    if (typeof cell.text === "string") {
      return cell.text;
    }
  }

  if ("action" in cell) {
    if (typeof cell.action === "string") {
      return cell.action;
    }
  }

  if ("actions" in cell) {
    if (Array.isArray(cell.actions)) {
      return cell.actions
        .map((action) => isRecord(action) && typeof action.action === "string" ? action.action : "")
        .filter(Boolean)
        .join(", ");
    }
  }

  return "";
}

function actionLabelFromCell(cell: Record<string, unknown>): string | undefined {
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

function normalizeStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback;
  }

  return value.map(String);
}

function normalizeAlertTone(value: unknown): "neutral" | "success" | "warning" | "danger" {
  return value === "success" || value === "warning" || value === "danger" ? value : "neutral";
}

function normalizeBadgeTone(value: unknown): "neutral" | "primary" | "success" | "warning" | "danger" {
  return value === "primary" || value === "success" || value === "warning" || value === "danger" ? value : "neutral";
}

function normalizeButtonVariant(value: unknown): "primary" | "secondary" | "ghost" {
  return value === "primary" || value === "ghost" ? value : "secondary";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
