import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Card } from "./Card";

describe("Card", () => {
  it("renders card content with the base class", () => {
    const markup = renderToStaticMarkup(<Card className="custom">Metric</Card>);

    expect(markup).toContain("ds-card");
    expect(markup).toContain("custom");
    expect(markup).toContain("Metric");
  });
});
