import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ComponentsGallery } from "./features/components-gallery/ComponentsGallery";

const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
const appStyles = readFileSync(new URL("./app.css", import.meta.url), "utf8");
const componentsGalleryStyles = readFileSync(new URL("./features/components-gallery/componentsGallery.css", import.meta.url), "utf8");
const generatorBehavior = readFileSync(new URL("./features/generator/README.md", import.meta.url), "utf8");
const componentsGalleryMarkup = renderToStaticMarkup(createElement(ComponentsGallery));

describe("showcase ambient AI control usage", () => {
  it("keeps the ambient treatment scoped to the prompt textarea", () => {
    expect(source).toContain('controlFrameClassName="ds-ai-control-frame"');
    expect(source).toContain('controlClassName="ds-ai-control"');
    expect(source).not.toContain("ds-ai-surface");
    expect(source).not.toContain('className="preview-panel ds-ai-control"');
    expect(source).not.toContain('className="hero__signal ds-ai-control"');
  });

  it("uses a stable generated screen panel heading", () => {
    expect(source).toContain("<h2>Generated Screen</h2>");
    expect(source).not.toContain("<h2>{generatedOutput.title}</h2>");
  });

  it("shows a compliance review skeleton while generation is pending", () => {
    expect(source).toContain("function ComplianceReviewSkeleton()");
    expect(source).toContain("isGenerating ? (");
    expect(source).toContain("<ComplianceReviewSkeleton />");
  });

  it("surfaces detected prompt intent in the generation evidence", () => {
    expect(source).toContain("Detected counts");
    expect(source).toContain("Detected actions");
    expect(source).toContain("promptCountSummary(generatedOutput.prompt)");
    expect(source).toContain("promptActionSummary(generatedOutput.prompt)");
  });

  it("documents tests versus evals for generator behavior", () => {
    expect(generatorBehavior).toContain("deterministic demo");
    expect(generatorBehavior).toContain("Keep broad generation quality checks in evals.");
    expect(generatorBehavior).toContain("Keep exact local generator behavior in unit tests.");
  });

  it("shows composer mode as a compact prompt-card pill instead of a status panel", () => {
    expect(source).toContain("configuredComposerMode");
    expect(source).toContain("lastComposerMode");
    expect(source).toContain('className="composer-mode-pill"');
    expect(source).toContain('tone="neutral"');
    expect(source).not.toContain('className="composer-mode-pill" tone="neutral" glass');
    expect(source).toContain("Configured mode");
    expect(source).toContain("Rendered by");
    expect(source).not.toContain('title="Generation status"');
  });

  it("presents prompt examples as starter chips instead of tab panels", () => {
    expect(source).toContain('className="prompt-examples"');
    expect(source).toContain('className="prompt-example-chips"');
    expect(source).toContain("Prompt starters");
    expect(source).not.toContain("aria-pressed={selectedId === scenario.id}");
    expect(source).not.toContain('idPrefix="prompt-examples"');
    expect(source).not.toContain('hint="Edit the current prompt, then generate again to update the screen."');
  });

  it("anchors the app nav as a full-width control below the compact hero", () => {
    expect(appStyles).toMatch(/\.hero\s*\{[\s\S]*min-height: 26vh/);
    expect(appStyles).toMatch(/\.showcase-tabs\s*\{[\s\S]*justify-self: stretch/);
    expect(appStyles).toMatch(/\.showcase-tabs\s*\{[\s\S]*width: 100%/);
    expect(appStyles).toMatch(/\.showcase-tabs \.ds-tabs__tab\s*\{[\s\S]*flex: 1 1 0/);
  });

  it("omits component governance metadata from gallery card headers", () => {
    expect(componentsGalleryStyles).not.toContain(".component-meta");
    expect(componentsGalleryMarkup).not.toContain("component-meta");
  });

  it("renders semantic token evidence with current color token names", () => {
    expect(componentsGalleryMarkup).toContain("aria-label=\"Applied semantic token groups\"");
    expect(componentsGalleryMarkup).toContain("Base");
    expect(componentsGalleryMarkup).toContain("Status");
    expect(componentsGalleryMarkup).toContain("--ds-color-text-primary");
    expect(componentsGalleryMarkup).toContain("--ds-color-border-default");
    expect(componentsGalleryMarkup).not.toContain("--ds-color-text-semantic");
    expect(componentsGalleryMarkup).not.toContain("--ds-color-border-semantic");
    expect(componentsGalleryStyles).toContain(".semantic-status-groups");
    expect(componentsGalleryStyles).toContain(".semantic-base-columns");
    expect(componentsGalleryStyles).toContain(".token-evidence__row");
  });

  it("uses a two-column component layout with explicit full-width exceptions", () => {
    expect(componentsGalleryStyles).toMatch(/\.component-grid\s*\{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
    expect(componentsGalleryStyles).toContain(".component-example--full");
    expect(componentsGalleryMarkup).toContain("component-example component-example--full");
  });

  it("orders component examples by related component families", () => {
    const exampleOrder = [...componentsGalleryMarkup.matchAll(/<h3>([^<]+)<\/h3>/g)]
      .map((match) => match[1])
      .filter((heading) => heading !== "Component gaps");

    expect(exampleOrder).toEqual([
      "Button",
      "Spinner",
      "Input",
      "Select",
      "Textarea",
      "Alert",
      "Card",
      "Badge",
      "Tabs",
      "Table"
    ]);
    expect(exampleOrder).not.toContain("Field");
  });

  it("places component gaps as a card before the component gallery", () => {
    expect(componentsGalleryMarkup.indexOf("Component gaps")).toBeLessThan(
      componentsGalleryMarkup.indexOf("id=\"approved-components\"")
    );
    expect(componentsGalleryMarkup).toContain("Storybook");
    expect(componentsGalleryMarkup).not.toContain("id=\"component-gaps\"");
  });
});
