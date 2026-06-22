import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
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
import { unsupportedComponentNames } from "@ds/ai-contracts";
import tokens, { colorRoles } from "@ds/tokens";

const primitiveFamilies = Object.keys(tokens.color.primitive) as Array<keyof typeof tokens.color.primitive>;
type TokenEvidence = { label: string; token: string; value: string; usage: string };
type ComponentExampleSpan = "default" | "full";
type StatusTone = keyof typeof colorRoles.status;

export function ComponentsGallery() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <section className="components-page" aria-label="Design system components">
      <ColorPaletteOverview />

      <Card className="component-example component-example--full">
        <div className="component-example__header">
          <div>
            <h3>Component gaps</h3>
            <p>
              {formatComponentList(unsupportedComponentNames)} are not available yet.
              <br />
              Storybook remains the implementation reference for full component APIs and low-level wrappers.
            </p>
          </div>
        </div>
      </Card>

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
          name="Spinner"
          description="Progress indicator sizes for pending generation and asynchronous actions."
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
          name="Input"
          description="Labeled text entry with hint, error, and disabled states."
        >
          <div className="form-variant-stack">
            <Input label="Workspace name" placeholder="Acme workspace" hint="Visible labels are required." />
            <Input label="Contact email" placeholder="admin@example.com" error="Enter a valid email address." />
            <Input label="Locked field" value="Managed by policy" disabled readOnly />
          </div>
        </ComponentExample>

        <ComponentExample
          name="Select"
          description="Option picker with hint, error, and disabled states."
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
          name="Alert"
          description="System feedback across every approved tone."
        >
          <div className="screen-stack">
            <Alert tone="neutral" title="Ready">The workflow is available for review.</Alert>
            <Alert tone="success" title="Saved">The generated screen passed component review.</Alert>
            <Alert tone="warning" title="Review needed">A requested pattern is not available yet.</Alert>
            <Alert tone="danger" title="Failed">The screen includes a blocked component request.</Alert>
          </div>
        </ComponentExample>

        <ComponentExample
          name="Card"
          description="Surface container for metrics, summaries, and compact grouped content."
        >
          <div className="component-surface-demo">
            <span className="metric-label">Workspace health</span>
            <strong className="metric-value metric-value--small">Ready</strong>
            <p className="component-note">Cards use tokenized border, radius, spacing, and shadow.</p>
          </div>
        </ComponentExample>

        <ComponentExample
          name="Badge"
          description="Text status indicators across every approved tone."
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
          name="Tabs"
          description="Segmented navigation with keyboard-supported selected states."
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
          name="Table"
          description="Comparable row data with captioned and action-oriented cells."
          span="full"
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
          <p>Base surfaces, text, borders, and status colors used by the approved components.</p>
        </div>
      </div>

      <AppliedSemanticTokens />

      <div className="palette-families" aria-label="Primitive color families">
        {primitiveFamilies.map((family) => (
          <PrimitivePaletteFamily family={family} key={family} />
        ))}
      </div>
    </section>
  );
}

function PrimitivePaletteFamily({ family }: { family: keyof typeof tokens.color.primitive }) {
  const colorSteps = Object.entries(tokens.color.primitive[family]);

  return (
    <div className="palette-family">
      <div className="palette-family__label">
        <strong>{titleCase(family)}</strong>
        <span>Primitive</span>
      </div>
      <div
        className="palette-ramp"
        style={{ gridTemplateColumns: `repeat(${colorSteps.length}, minmax(0, 1fr))` }}
        aria-label={`${family} primitive color scale`}
      >
        {colorSteps.map(([step, value]) => (
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
  );
}

function AppliedSemanticTokens() {
  return (
    <div className="semantic-token-grid" aria-label="Applied semantic token groups">
      <section className="semantic-token-card semantic-token-card--base">
        <div>
          <h4>Base</h4>
          <p>Base colors used together for page canvas, surfaces, copy, borders, and focus.</p>
        </div>
        <div className="semantic-base-columns">
          <TokenEvidenceList
            items={[
              { label: "Canvas", token: "--ds-color-bg-canvas", value: colorRoles.bg.canvas, usage: "Page background" },
              { label: "Surface", token: "--ds-color-bg-surface", value: colorRoles.bg.surface, usage: "Cards and controls" },
              { label: "Raised", token: "--ds-color-bg-surface-raised", value: colorRoles.bg.surfaceRaised, usage: "Elevated surfaces" }
            ]}
          />
          <TokenEvidenceList
            items={[
              { label: "Primary text", token: "--ds-color-text-primary", value: colorRoles.text.primary, usage: "Main copy" },
              { label: "Secondary text", token: "--ds-color-text-secondary", value: colorRoles.text.secondary, usage: "Supporting copy" },
              { label: "Border", token: "--ds-color-border-default", value: colorRoles.border.default, usage: "Control edges" },
              { label: "Focus border", token: "--ds-color-border-focus", value: colorRoles.border.focus, usage: "Focus states" }
            ]}
          />
        </div>
      </section>

      <section className="semantic-token-card semantic-token-card--status">
        <div>
          <h4>Status</h4>
          <p>State colors work as bundles: surface, soft fill, text, border, and icon.</p>
        </div>
        <div className="semantic-status-groups">
          {(["success", "danger", "warning", "info"] as const).map((tone) => (
            <StatusTokenSet tone={tone} key={tone} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatusTokenSet({ tone }: { tone: StatusTone }) {
  const status = colorRoles.status[tone];

  return (
    <section className="semantic-status-group" aria-label={`${titleCase(tone)} status tokens`}>
      <div
        className="semantic-status-sample"
        style={{ backgroundColor: status.bg, borderColor: status.border, color: status.text }}
      >
        <span className="semantic-status-sample__icon" style={{ backgroundColor: status.icon }} />
        <strong>{titleCase(tone)}</strong>
        <span style={{ backgroundColor: status.soft }}>Soft fill</span>
      </div>
      <TokenEvidenceList
        compact
        items={[
          { label: "Surface", token: `--ds-color-status-${tone}-bg`, value: status.bg, usage: "Alert surface" },
          { label: "Soft", token: `--ds-color-status-${tone}-soft`, value: status.soft, usage: "Badge fill" },
          { label: "Text", token: `--ds-color-status-${tone}-text`, value: status.text, usage: "State copy" },
          { label: "Border", token: `--ds-color-status-${tone}-border`, value: status.border, usage: "Alert edge" },
          { label: "Icon", token: `--ds-color-status-${tone}-icon`, value: status.icon, usage: "State icon" }
        ]}
      />
    </section>
  );
}

function TokenEvidenceList({
  items,
  title,
  compact = false
}: {
  items: TokenEvidence[];
  title?: string;
  compact?: boolean;
}) {
  return (
    <div className={`token-evidence${compact ? " token-evidence--compact" : ""}`}>
      {title ? <h5>{title}</h5> : null}
      <div className="token-evidence__rows">
        {items.map((item) => (
          <div className="token-evidence__row" key={item.token}>
            <span className="token-evidence__swatch" style={{ backgroundColor: item.value }} />
            <strong>{item.label}</strong>
            <code>{item.token}</code>
            <span>{item.usage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComponentExample({
  name,
  description,
  children,
  span = "default"
}: {
  name: string;
  description: string;
  children: React.ReactNode;
  span?: ComponentExampleSpan;
}) {
  return (
    <Card className={`component-example${span === "full" ? " component-example--full" : ""}`}>
      <div className="component-example__header">
        <div>
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
      </div>
      <div className="component-example__demo">{children}</div>
    </Card>
  );
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatComponentList(components: readonly string[]) {
  return components
    .map((component, index) => index === 0 ? component : component.toLowerCase())
    .join(", ");
}
