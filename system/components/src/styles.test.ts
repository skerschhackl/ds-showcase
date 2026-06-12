import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import tokens from "@ds/tokens";

const styleFiles = [
  "./styles.css",
  "./utilities/ai-control.css",
  "./utilities/typography.css",
  "./Alert/Alert.css",
  "./Badge/Badge.css",
  "./Button/Button.css",
  "./Card/Card.css",
  "./Field/Field.css",
  "./Input/Input.css",
  "./Select/Select.css",
  "./Spinner/Spinner.css",
  "./Table/Table.css",
  "./Tabs/Tabs.css",
  "./Textarea/Textarea.css"
];

const styles = styleFiles.map((file) => readFileSync(new URL(file, import.meta.url), "utf8")).join("\n");
const inputStyles = readFileSync(new URL("./Input/Input.css", import.meta.url), "utf8");
const selectStyles = readFileSync(new URL("./Select/Select.css", import.meta.url), "utf8");
const textareaStyles = readFileSync(new URL("./Textarea/Textarea.css", import.meta.url), "utf8");

describe("component styles", () => {
  it("honors reduced motion preferences", () => {
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain("animation: none");
    expect(styles).toContain("transition: none");
    expect(styles).toContain("transform: none");
  });

  it("uses contrast-safe text tokens for small success and warning badges", () => {
    expect(styles).toContain("color: var(--ds-color-success-text)");
    expect(styles).toContain("color: var(--ds-color-warning-text)");
    expect(styles).toContain("color: var(--ds-color-danger-text)");
    expect(contrast(tokens.color.successText, tokens.color.successSoft)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(tokens.color.warningText, tokens.color.warningSoft)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(tokens.color.dangerText, tokens.color.dangerSoft)).toBeGreaterThanOrEqual(4.5);
  });

  it("defines the sanctioned AI ambient control treatment", () => {
    expect(styles).toContain(".ds-ai-control-frame");
    expect(styles).toContain(".ds-ai-control");
    expect(styles).toContain("var(--ds-gradient-ai-border)");
    expect(styles).toContain("var(--ds-shadow-ai-glow)");
    expect(styles).toContain("var(--ds-motion-ai-ambient-duration)");
    expect(styles).toContain("ds-ai-border-color-cycle");
    expect(styles).toContain("filter: hue-rotate(1turn)");
  });

  it("uses tabular numbers only for numeric component contexts", () => {
    expect(styles).toContain(".ds-numeric");
    expect(styles).toContain("font-variant-numeric: tabular-nums");
    expect(styles).toMatch(/\.ds-table\s*\{[\s\S]*font-variant-numeric: tabular-nums/);
  });

  it("supports slashed zero for technical numeric contexts", () => {
    expect(styles).toContain(".ds-slashed-zero");
    expect(styles).toContain("font-variant-numeric: slashed-zero");
    expect(styles).toMatch(/\.ds-technical-number\s*\{[\s\S]*font-variant-numeric: tabular-nums slashed-zero/);
  });

  it("keeps fields top-aligned when parent grids stretch items", () => {
    expect(styles).toMatch(/\.ds-field\s*\{[\s\S]*align-content: start/);
  });

  it("lets layouts control form field width", () => {
    expect(inputStyles).not.toContain("width: 100%");
    expect(selectStyles).not.toContain("width: 100%");
    expect(textareaStyles).not.toContain("width: 100%");
  });
});

function contrast(foreground: string, background: string) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex: string) {
  const [red, green, blue] = hex
    .replace("#", "")
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
