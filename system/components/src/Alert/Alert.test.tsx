import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("uses alert role for danger tone", () => {
    const markup = renderToStaticMarkup(<Alert tone="danger" title="Failed">Retry sync</Alert>);

    expect(markup).toContain("role=\"alert\"");
    expect(markup).toContain("aria-labelledby=");
    expect(markup).toContain("aria-describedby=");
    expect(markup).toContain("<h2");
    expect(markup).toContain("Failed");
    expect(markup).toContain("Retry sync");
  });

  it("uses status role for non-danger feedback", () => {
    const markup = renderToStaticMarkup(<Alert tone="success" title="Saved">Changes are ready.</Alert>);

    expect(markup).toContain("role=\"status\"");
    expect(markup).toContain("Saved");
  });

  it("allows heading level to match the surrounding page hierarchy", () => {
    const markup = renderToStaticMarkup(<Alert headingLevel={3} title="Review needed">Check details.</Alert>);

    expect(markup).toContain("<h3");
  });
});
