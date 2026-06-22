import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App, ComplianceReviewSkeleton } from "./App";
import { ComponentsGallery } from "./features/components-gallery/ComponentsGallery";
import { promptActionSummary, promptCountSummary } from "./promptSummaries";

const appMarkup = renderToStaticMarkup(createElement(App));
const componentsGalleryMarkup = renderToStaticMarkup(createElement(ComponentsGallery));

describe("showcase ambient AI control usage", () => {
  it("keeps the ambient treatment scoped to the prompt textarea", () => {
    expect(appMarkup).toContain("ds-ai-control-frame");
    expect(appMarkup).toContain("ds-ai-control");
    expect(appMarkup).not.toContain("preview-panel ds-ai-control");
    expect(appMarkup).not.toContain("hero__signal ds-ai-control");
  });

  it("uses a stable generated screen panel heading", () => {
    expect(appMarkup).toContain("<h2>Generated Screen</h2>");
    expect(appMarkup).not.toContain("<h2>Billing workspace</h2>");
  });

  it("shows a compliance review skeleton while generation is pending", () => {
    const markup = renderToStaticMarkup(createElement(ComplianceReviewSkeleton));

    expect(markup).toContain("aria-live=\"polite\"");
    expect(markup).toContain("aria-busy=\"true\"");
    expect(markup.match(/class=\"skeleton-table\"/g)).toHaveLength(2);
  });

  it("surfaces detected prompt intent in the generation evidence", () => {
    expect(appMarkup).toContain("<td>Detected counts</td>");
    expect(appMarkup).toContain("<td>Detected actions</td>");
    expect(promptCountSummary("Create a billing page with 4 plans and 5 invoices")).toContain("plans=4");
    expect(promptActionSummary("Create a table with a download button per row")).toContain("row=Download");
  });

  it("shows composer mode as a compact prompt-card pill instead of a status panel", () => {
    expect(appMarkup).toContain("composer-mode-pill");
    expect(appMarkup).toContain("<td>Configured mode</td>");
    expect(appMarkup).toContain("<td>Rendered by</td>");
    expect(appMarkup).not.toContain("Generation status");
  });

  it("presents prompt examples as starter chips instead of tab panels", () => {
    expect(appMarkup).toContain("prompt-examples");
    expect(appMarkup).toContain("prompt-example-chips");
    expect(appMarkup).toContain("Prompt starters");
    expect(appMarkup).not.toContain("aria-pressed");
  });

  it("omits component governance metadata from gallery card headers", () => {
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
  });

  it("uses a two-column component layout with explicit full-width exceptions", () => {
    expect(componentsGalleryMarkup).toContain("component-grid");
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
