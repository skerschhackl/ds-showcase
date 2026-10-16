import { useState } from "react";
import { Wand2 } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Select,
  TabPanel,
  Table,
  Tabs,
  Textarea,
  getDefaultTabId,
  getDefaultTabPanelId
} from "@ds/components";
import type { PageAction, PageField, PageSection } from "@ds/ai-contracts";
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
  const sections = Array.isArray(output.page?.sections) ? output.page.sections : [];
  const promptFidelityWarnings = output.compliance.filter((item) => item.label === "Prompt fidelity" && item.status !== "Pass");

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

      {sections.length ? (
        <GeneratedPage sections={sections} />
      ) : (
        <LegacyGeneratedSurface output={output} />
      )}
    </div>
  );
}

function GeneratedPage({ sections }: { sections: PageSection[] }) {
  return (
    <div className="generated-page" aria-label="Generated page composition">
      {sections.map((section, index) => (
        <GeneratedPageSection key={`${section.type}-${index}`} section={section} index={index} />
      ))}
    </div>
  );
}

function GeneratedPageSection({ section, index }: { section: PageSection; index: number }) {
  if (section.type === "hero") {
    return (
      <section className="page-section page-section--hero">
        {section.eyebrow ? <span className="metric-label">{section.eyebrow}</span> : null}
        <h3>{section.title}</h3>
        <p>{section.body}</p>
        <PageActions actions={section.actions} />
      </section>
    );
  }

  if (section.type === "pageHeader") {
    return (
      <section className="page-section page-section--header">
        <div>
          {section.eyebrow ? <span className="metric-label">{section.eyebrow}</span> : null}
          <h3>{section.title}</h3>
          {section.body ? <p>{section.body}</p> : null}
        </div>
        <PageActions actions={section.actions} />
      </section>
    );
  }

  if (section.type === "form") {
    return (
      <section className="page-section">
        <SectionHeading title={section.title} body={section.body} />
        <div className="form-grid">
          {section.fields.map((field) => <GeneratedField key={field.label} field={field} />)}
        </div>
        <PageActions actions={section.actions} />
      </section>
    );
  }

  if (section.type === "cardGrid") {
    return (
      <section className="page-section">
        <SectionHeading title={section.title} body={section.body} />
        <div className="page-card-grid">
          {section.cards.map((card) => (
            <Card key={card.title} className="page-card">
              {card.badge ? <Badge tone={card.badge.tone}>{card.badge.text}</Badge> : null}
              <h4>{card.title}</h4>
              <p>{card.body}</p>
              {card.action ? <Button variant={card.action.variant} type="button">{card.action.label}</Button> : null}
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "stats") {
    return (
      <section className="page-section">
        {section.title ? <SectionHeading title={section.title} /> : null}
        <div className="generated-grid">
          {section.metrics.map((metric) => (
            <Card key={metric.label}>
              <span className="metric-label">{metric.label}</span>
              <strong className="metric-value metric-value--small">{metric.value}</strong>
              {typeof metric.progress === "number" ? (
                <span className="metric-bar"><span style={{ width: `${metric.progress}%` }} /></span>
              ) : null}
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "table") {
    return (
      <section className="page-section">
        <SectionHeading title={section.title} body={section.body} />
        <Table
          columns={section.columns}
          rows={section.rows.map((row) => row.map((cell) => renderTableCell(cell)))}
        />
      </section>
    );
  }

  if (section.type === "alert") {
    return (
      <section className="page-section page-section--flush">
        <Alert tone={section.tone} title={section.title}>{section.body}</Alert>
      </section>
    );
  }

  if (section.type === "cta") {
    return (
      <section className="page-section page-section--cta">
        <h3>{section.title}</h3>
        <p>{section.body}</p>
        <PageActions actions={section.actions} />
      </section>
    );
  }

  if (section.type === "tabs") {
    return <GeneratedTabsSection section={section} index={index} />;
  }

  return (
    <section className="page-section">
      <Alert tone="warning" title="Unknown section type">
        This section could not be rendered safely.
      </Alert>
    </section>
  );
}

function GeneratedTabsSection({ section, index }: { section: Extract<PageSection, { type: "tabs" }>; index: number }) {
  const idPrefix = `generated-tabs-${index}`;
  const [active, setActive] = useState(section.tabs[0].id);

  return (
    <section className="page-section">
      {section.title ? <SectionHeading title={section.title} /> : null}
      <Tabs
        active={active}
        ariaLabel={section.title ?? "Generated tabs"}
        idPrefix={idPrefix}
        onChange={setActive}
        tabs={section.tabs.map((tab) => ({ id: tab.id, label: tab.label }))}
      />
      {section.tabs.map((tab) => (
        <TabPanel
          key={tab.id}
          id={getDefaultTabPanelId(idPrefix, tab.id)}
          active={tab.id === active}
          labelledBy={getDefaultTabId(idPrefix, tab.id)}
        >
          <div className="page-tab-panel">
            <h4>{tab.title}</h4>
            <p>{tab.body}</p>
          </div>
        </TabPanel>
      ))}
    </section>
  );
}

function LegacyGeneratedSurface({ output }: { output: GeneratedOutput }) {
  const { screen } = output;
  const metrics = Array.isArray(screen.metrics) ? screen.metrics : [];
  const fields = Array.isArray(screen.fields) ? screen.fields : [];
  const tableColumns = Array.isArray(screen.table?.columns) ? screen.table.columns : ["Item", "Status", "Action"];
  const tableRows = Array.isArray(screen.table?.rows) ? screen.table.rows : [];
  const actions = previewActionsForScreen(screen);

  return (
    <>
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
    </>
  );
}

function SectionHeading({ title, body }: { title?: string; body?: string }) {
  if (!title && !body) {
    return null;
  }

  return (
    <div className="section-heading">
      {title ? <h3>{title}</h3> : null}
      {body ? <p>{body}</p> : null}
    </div>
  );
}

function GeneratedField({ field }: { field: PageField }) {
  if (field.kind === "textarea") {
    return <Textarea label={field.label} placeholder={field.placeholder} rows={field.rows ?? 4} />;
  }

  if (field.kind === "select") {
    return (
      <Select
        label={field.label}
        defaultValue={field.options?.[0]?.toLowerCase().replace(/\s+/g, "-") ?? "option"}
        options={(field.options ?? ["Option"]).map((option) => ({
          label: option,
          value: option.toLowerCase().replace(/\s+/g, "-")
        }))}
      />
    );
  }

  return <Input label={field.label} placeholder={field.placeholder} />;
}

function PageActions({ actions }: { actions: PageAction[] }) {
  if (!actions.length) {
    return null;
  }

  return (
    <div className="button-row page-actions">
      {actions.map((action, index) => (
        <Button key={action.label} variant={action.variant} type="button">
          {index === 0 && action.variant === "primary" ? <Wand2 size={16} aria-hidden="true" /> : null}
          {action.label}
        </Button>
      ))}
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
