import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "./Button";

describe("Button", () => {
  it("renders variant and size classes", () => {
    const markup = renderToStaticMarkup(<Button variant="secondary" size="sm">Save</Button>);

    expect(markup).toContain("ds-button--secondary");
    expect(markup).toContain("ds-button--sm");
    expect(markup).toContain("Save");
  });

  it("renders a spinner with action-specific loading text when loading", () => {
    const markup = renderToStaticMarkup(<Button loading loadingLabel="Generating UI">Generate</Button>);

    expect(markup).toContain("aria-busy=\"true\"");
    expect(markup).toContain("disabled=\"\"");
    expect(markup).toContain("aria-label=\"Generating UI\"");
    expect(markup).toContain("ds-spinner");
  });
});
