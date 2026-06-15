import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
  Spinner,
  Table,
  Tabs,
  TabPanel,
  Textarea,
  getDefaultTabId,
  getDefaultTabPanelId
} from "@ds/components";
import tokens from "@ds/tokens";
import type { GovernanceMeta, SemanticColor } from "../../showcaseTypes";

const primitiveFamilies = Object.keys(tokens.color.primitive) as Array<keyof typeof tokens.color.primitive>;
const statusSwatches: SemanticColor[] = [
  { label: "Success", token: "--ds-color-status-success-bg", value: tokens.color.status.success.bg },
  { label: "Warning", token: "--ds-color-status-warning-bg", value: tokens.color.status.warning.bg },
  { label: "Danger", token: "--ds-color-status-danger-bg", value: tokens.color.status.danger.bg },
  { label: "Info", token: "--ds-color-status-info-bg", value: tokens.color.status.info.bg }
];
const neutralSwatches: SemanticColor[] = [
  { label: "Canvas", token: "--ds-color-bg-canvas", value: tokens.color.bg.canvas },
  { label: "Surface", token: "--ds-color-bg-surface", value: tokens.color.bg.surface },
  { label: "Raised", token: "--ds-color-bg-surface-raised", value: tokens.color.bg.surfaceRaised },
  { label: "Primary text", token: "--ds-color-text-semantic-primary", value: tokens.color.textSemantic.primary },
  { label: "Secondary text", token: "--ds-color-text-semantic-secondary", value: tokens.color.textSemantic.secondary },
  { label: "Default border", token: "--ds-color-border-semantic-default", value: tokens.color.borderSemantic.default }
];
const actionSwatches: SemanticColor[] = [
  { label: "Primary", token: "--ds-color-action-primary-bg", value: tokens.color.action.primary.bg },
  { label: "Secondary", token: "--ds-color-action-secondary-bg", value: tokens.color.action.secondary.bg },
  { label: "Creative", token: "--ds-color-accent-semantic-creative-bg", value: tokens.color.accentSemantic.creative.bg },
  { label: "Warm", token: "--ds-color-accent-semantic-warm-bg", value: tokens.color.accentSemantic.warm.bg }
];

export function ComponentsGallery() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <section className="components-page" aria-label="Design system components">
      <ColorPaletteOverview />

      <div className="component-grid" id="approved-components">
        <ComponentExample
          name="Button"
          description="Action variants, sizes, loading, and disabled states for generated workflows."
        >
          <VariantGroup label="Variants">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </VariantGroup>
          <VariantGroup label="Sizes">
            <Button size="sm">Small</Button>
            <Button>Medium</Button>
          </VariantGroup>
          <VariantGroup label="States">
            <Button loading loadingLabel="Saving">Saving</Button>
            <Button disabled>Disabled</Button>
          </VariantGroup>
        </ComponentExample>

        <ComponentExample
          name="Card"
          description="Surface container for metrics, summaries, and compact grouped content."
          meta={[{ label: "Generator", value: "Layouts" }]}
        >
          <div className="component-surface-demo">
            <span className="metric-label">Workspace health</span>
            <strong className="metric-value metric-value--small">Ready</strong>
            <p className="component-note">Cards use tokenized border, radius, spacing, and shadow.</p>
          </div>
        </ComponentExample>

        <ComponentExample
          name="Input"
          description="Labeled text entry with hint, error, and disabled states."
          meta={[{ label: "A11y", value: "Labels", tone: "success" }]}
        >
          <div className="form-variant-stack">
            <Input label="Workspace name" placeholder="Acme workspace" hint="Visible labels are required." />
            <Input label="Contact email" placeholder="admin@example.com" error="Enter a valid email address." />
            <Input label="Locked field" value="Managed by policy" disabled readOnly />
          </div>
        </ComponentExample>

        <ComponentExample
          name="Field"
          description="Public label, hint, error, and ARIA wrapper for custom form controls."
          meta={[{ label: "A11y", value: "Wrapper", tone: "success" }]}
        >
          <div className="form-variant-stack">
            <Field id="custom-slug" label="Custom slug" hint="Use lowercase letters and dashes.">
              {(controlProps) => <input className="ds-input" placeholder="acme-workspace" {...controlProps} />}
            </Field>
            <Field id="custom-token" label="Custom token" error="Token is required.">
              {(controlProps) => <input className="ds-input" placeholder="tok_..." {...controlProps} />}
            </Field>
          </div>
        </ComponentExample>

        <ComponentExample
          name="Select"
          description="Option picker with hint, error, and disabled states."
          meta={[{ label: "A11y", value: "Labels", tone: "success" }]}
        >
          <div className="form-variant-stack">
            <Select
              label="Role"
              defaultValue="member"
              hint="Controls default workspace access."
              options={[
                { label: "Viewer", value: "viewer" },
                { label: "Member", value: "member" },
                { label: "Admin", value: "admin" }
              ]}
            />
            <Select
              label="Priority"
              defaultValue=""
              error="Choose a priority before publishing."
              options={[
                { label: "Select priority", value: "" },
                { label: "Low", value: "low" },
                { label: "High", value: "high" }
              ]}
            />
            <Select
              label="Plan"
              defaultValue="enterprise"
              disabled
              options={[
                { label: "Enterprise", value: "enterprise" },
                { label: "Growth", value: "growth" }
              ]}
            />
          </div>
        </ComponentExample>

        <ComponentExample
          name="Textarea"
          description="Labeled multi-line text entry for prompts, notes, descriptions, and feedback."
          meta={[{ label: "A11y", value: "Labels", tone: "success" }]}
        >
          <div className="form-variant-stack">
            <Textarea
              label="Prompt"
              hint="Describe the product UI to generate."
              placeholder="Build a workflow screen..."
              rows={5}
            />
            <Textarea
              label="Review feedback"
              error="Add a specific review note."
              placeholder="What should change?"
              rows={4}
            />
          </div>
        </ComponentExample>

        <ComponentExample
          name="Badge"
          description="Text status indicators across every approved tone."
          meta={[{ label: "Purpose", value: "Status" }]}
        >
          <div className="badge-row">
            <Badge>Neutral</Badge>
            <Badge tone="primary">Primary</Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="warning">Warning</Badge>
            <Badge tone="danger">Danger</Badge>
          </div>
        </ComponentExample>

        <ComponentExample
          name="Spinner"
          description="Progress indicator sizes for pending generation and asynchronous actions."
          meta={[{ label: "State", value: "Async" }]}
        >
          <VariantGroup label="Sizes">
            <span className="spinner-sample"><Spinner label="Small loading indicator" size="sm" /> Small</span>
            <span className="spinner-sample"><Spinner label="Medium loading indicator" /> Medium</span>
          </VariantGroup>
          <VariantGroup label="Button loading">
            <Button loading loadingLabel="Generating UI">Generate UI</Button>
          </VariantGroup>
        </ComponentExample>

        <ComponentExample
          name="Tabs"
          description="Segmented navigation with keyboard-supported selected states."
          meta={[{ label: "A11y", value: "Panels", tone: "success" }]}
        >
          <Tabs
            ariaLabel="Component example tabs"
            active={activeTab}
            idPrefix="component-example"
            onChange={setActiveTab}
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "activity", label: "Activity" },
              { id: "settings", label: "Settings" }
            ]}
          />
          {[
            ["overview", "Overview content uses the active tab panel relationship."],
            ["activity", "Activity content demonstrates keyboard-reachable panels."],
            ["settings", "Settings content keeps tab and panel ids aligned."]
          ].map(([id, content]) => (
            <TabPanel
              key={id}
              id={getDefaultTabPanelId("component-example", id)}
              active={activeTab === id}
              labelledBy={getDefaultTabId("component-example", id)}
            >
              <p className="component-note">{content}</p>
            </TabPanel>
          ))}
        </ComponentExample>

        <ComponentExample
          name="Alert"
          description="System feedback across every approved tone."
          meta={[{ label: "A11y", value: "Roles", tone: "success" }]}
        >
          <div className="screen-stack">
            <Alert tone="neutral" title="Ready">The workflow is available for review.</Alert>
            <Alert tone="success" title="Saved">The generated screen passed component review.</Alert>
            <Alert tone="warning" title="Review needed">A requested pattern is not available yet.</Alert>
            <Alert tone="danger" title="Failed">The screen includes a blocked component request.</Alert>
          </div>
        </ComponentExample>

        <ComponentExample
          name="Table"
          description="Comparable row data with captioned and action-oriented cells."
          meta={[{ label: "A11y", value: "Caption", tone: "success" }]}
        >
          <div className="table-variant-stack">
            <Table
              caption="Workflow queue"
              columns={["Item", "Status", "Action"]}
              rows={[
                ["Invite teammates", <Badge tone="primary">Next</Badge>, "Start"],
                ["Review access", <Badge tone="warning">Review</Badge>, "Open"],
                ["Publish dashboard", <Badge tone="success">Ready</Badge>, "Publish"]
              ]}
            />
            <Table
              ariaLabel="Compact status table"
              columns={["Check", "Result"]}
              rows={[
                ["Components", <Badge tone="success">Pass</Badge>],
                ["Unsupported patterns", <Badge tone="danger">Blocked</Badge>]
              ]}
            />
          </div>
        </ComponentExample>
      </div>

      <div id="component-gaps">
        <Alert tone="neutral" title="Not available yet">
          Modal, toast, chart, drawer, date picker, file upload, tooltip, and sidebar are currently flagged as
          component gaps.
        </Alert>
      </div>
    </section>
  );
}

function VariantGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="variant-group">
      <span>{label}</span>
      <div className="variant-row">{children}</div>
    </div>
  );
}

function ColorPaletteOverview() {
  return (
    <section className="palette-overview" id="component-tokens" aria-labelledby="palette-title">
      <div className="palette-overview__header">
        <div>
          <h3 id="palette-title">Color tokens</h3>
          <p>Teal leads action, purple carries creative moments, coral adds warmth, and status colors stay functional.</p>
        </div>
        <Badge tone="primary">Web palette</Badge>
      </div>

      <div className="semantic-palette-grid">
        <SemanticSwatchGroup title="Neutral semantics" swatches={neutralSwatches} />
        <SemanticSwatchGroup title="Actions and accents" swatches={actionSwatches} />
        <SemanticSwatchGroup title="Status" swatches={statusSwatches} />
      </div>

      <div className="palette-families" aria-label="Primitive color families">
        {primitiveFamilies.map((family) => (
          <div className="palette-family" key={family}>
            <div className="palette-family__label">
              <strong>{titleCase(family)}</strong>
              <span>Primitive</span>
            </div>
            <div className="palette-ramp" aria-label={`${family} primitive color scale`}>
              {Object.entries(tokens.color.primitive[family]).map(([step, value]) => (
                <span
                  className="palette-ramp__swatch"
                  key={step}
                  style={{ backgroundColor: value }}
                  title={`--ds-color-primitive-${family}-${step}: ${value}`}
                >
                  <span>{step}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SemanticSwatchGroup({ title, swatches }: { title: string; swatches: SemanticColor[] }) {
  return (
    <div className="semantic-swatch-group">
      <h4>{title}</h4>
      <div className="semantic-swatch-list">
        {swatches.map((swatch) => (
          <div className="semantic-swatch" key={swatch.token}>
            <span className="semantic-swatch__chip" style={{ backgroundColor: swatch.value }} />
            <div>
              <strong>{swatch.label}</strong>
              <span>{swatch.token}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComponentExample({
  name,
  description,
  meta,
  children
}: {
  name: string;
  description: string;
  meta?: GovernanceMeta[];
  children: React.ReactNode;
}) {
  const governanceMeta = meta ?? [{ label: "Status", value: "Approved", tone: "success" }];

  return (
    <Card className="component-example">
      <div className="component-example__header">
        <div>
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
        <dl className="component-meta" aria-label={`${name} governance`}>
          {governanceMeta.map((item) => (
            <div key={`${item.label}-${item.value}`}>
              <dt>{item.label}</dt>
              <dd>
                <Badge tone={item.tone ?? "primary"}>{item.value}</Badge>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="component-example__demo">{children}</div>
    </Card>
  );
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
