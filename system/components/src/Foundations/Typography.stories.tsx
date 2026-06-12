import type { Meta, StoryObj } from "@storybook/react";
import { typographySizes, typographyWeights, type TypographySize, type TypographyWeight } from "@ds/tokens";
import { StoryFrame } from "../storybook";

const meta = {
  title: "Foundations/Typography",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Typography roles for AI-generated UI: Manrope is the default UI font, Hubot Sans is reserved for display moments, and mono is only for technical/code-like values."
      }
    }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Families: Story = {
  render: () => (
    <StoryFrame
      title="Typography"
      aiNote="Use Manrope for generated product UI. Use Hubot Sans only for brand/display moments. Use mono only for code-like identifiers."
    >
      <div style={{ display: "grid", gap: "1rem" }}>
        <Specimen
          label="Manrope / UI"
          family="var(--ds-typography-font-sans)"
          sample="Controls, tables, forms, badges, alerts, and generated product UI use Manrope."
        />
        <Specimen
          label="Hubot Sans / Display"
          family="var(--ds-typography-font-display)"
          sample="Showcase headings and display moments can use Hubot Sans."
        />
        <Specimen
          label="Mono / Technical"
          family="var(--ds-typography-font-mono)"
          sample="prompt-0427, INV-1042, sync_job.retry_count"
        />
        <Specimen
          label="Tabular numbers / Aligned UI"
          family="var(--ds-typography-font-sans)"
          sample="INV-1042  $240.00  2026-06-10  99.8%"
          numeric
        />
        <Specimen
          label="Slashed zero / Technical values"
          family="var(--ds-typography-font-mono)"
          sample="O0O-1042  sync_0O_retry"
          slashedZero
        />
      </div>
    </StoryFrame>
  )
};

export const SizeScale: Story = {
  render: () => (
    <StoryFrame
      title="Available font sizes"
      aiNote="Use named typography size tokens instead of raw rem values. Generated product UI should stay mostly on caption, label, body, bodyLarge, and compact headings."
    >
      <div style={{ display: "grid", gap: "1rem" }}>
        {typedEntries(typographySizes).map(([sizeName, size]) => (
          <SizeSpecimen key={sizeName} name={sizeName} size={size} />
        ))}
      </div>
    </StoryFrame>
  )
};

export const WeightLadder: Story = {
  render: () => (
    <StoryFrame
      title="Weight ladder"
      aiNote="Manrope owns the usable weight ladder. Prefer 400 for body, 600 to 800 for UI emphasis, and 800 for display headings."
    >
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {typedEntries(typographyWeights).map(([weightName, weight]) => (
          <div
            key={weightName}
            style={{
              alignItems: "baseline",
              display: "grid",
              fontFamily: "var(--ds-typography-font-sans)",
              fontVariantLigatures: "common-ligatures",
              fontWeight: weight,
              gap: "1rem",
              gridTemplateColumns: "4rem minmax(0, 1fr)"
            }}
          >
            <span style={{ color: "var(--ds-color-muted)", fontFamily: "var(--ds-typography-font-mono)", fontSize: "var(--ds-typography-size-label)" }}>
              {weight}
            </span>
            <span>AI-ready design systems need clear type roles.</span>
          </div>
        ))}
      </div>
    </StoryFrame>
  )
};

export const RenderingRules: Story = {
  render: () => (
    <StoryFrame
      title="Rendering rules"
      aiNote="Use high-level CSS properties for font features. Avoid raw font-feature-settings unless a specific feature is approved."
    >
      <ul style={{ lineHeight: 1.6, margin: 0, paddingLeft: "1.25rem" }}>
        <li>Global text uses normal kerning, no synthetic weight/style, and optimizeLegibility.</li>
        <li>Use tabular numbers when digits need to align in metrics, tables, totals, invoices, dashboard values, and dates.</li>
        <li>Use slashed zero when a technical value needs to distinguish 0 from O.</li>
        <li>Use common ligatures for large display headings.</li>
        <li>Do not enable letter spacing, discretionary ligatures, stylistic sets, tabular numbers, or slashed zero globally.</li>
      </ul>
    </StoryFrame>
  )
};

function typedEntries<T extends Record<string, string>>(value: T) {
  return Object.entries(value) as Array<[keyof T, T[keyof T]]>;
}

function Specimen({ label, family, sample, numeric = false, slashedZero = false }: { label: string; family: string; sample: string; numeric?: boolean; slashedZero?: boolean }) {
  return (
    <div style={{ border: "1px solid var(--ds-color-border)", borderRadius: "var(--ds-radius-md)", display: "grid", gap: "0.5rem", padding: "var(--ds-space-4)" }}>
      <span style={{ color: "var(--ds-color-muted)", fontSize: "var(--ds-typography-size-caption)", fontWeight: "var(--ds-typography-weight-extrabold)" }}>{label}</span>
      <p style={{ fontFamily: family, fontSize: "var(--ds-typography-size-heading-sm)", fontVariantNumeric: numeric ? "tabular-nums" : slashedZero ? "slashed-zero" : undefined, lineHeight: "var(--ds-typography-line-height-heading)", margin: 0 }}>{sample}</p>
    </div>
  );
}

function SizeSpecimen({ name, size }: { name: TypographySize; size: string }) {
  const isDisplay = name.startsWith("display");
  const isHeading = name.startsWith("heading");
  const family = isDisplay ? "var(--ds-typography-font-display)" : "var(--ds-typography-font-sans)";
  const weight: TypographyWeight = isDisplay || isHeading ? "extrabold" : name === "caption" || name === "label" ? "bold" : "regular";

  return (
    <div
      style={{
        borderBottom: "1px solid var(--ds-color-border)",
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "10rem minmax(0, 1fr)",
        paddingBottom: "1rem"
      }}
    >
      <div style={{ display: "grid", gap: "0.25rem" }}>
        <span style={{ color: "var(--ds-color-text)", fontSize: "var(--ds-typography-size-label)", fontWeight: "var(--ds-typography-weight-extrabold)" }}>{name}</span>
        <span style={{ color: "var(--ds-color-muted)", fontFamily: "var(--ds-typography-font-mono)", fontSize: "var(--ds-typography-size-caption)" }}>{size}</span>
      </div>
      <p
        style={{
          fontFamily: family,
          fontSize: `var(--ds-typography-size-${kebabCase(name)})`,
          fontWeight: `var(--ds-typography-weight-${weight})`,
          lineHeight: isDisplay ? "var(--ds-typography-line-height-tight)" : isHeading ? "var(--ds-typography-line-height-heading)" : "var(--ds-typography-line-height-body)",
          margin: 0
        }}
      >
        Clear type scales make generated interfaces easier to review.
      </p>
    </div>
  );
}

function kebabCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
