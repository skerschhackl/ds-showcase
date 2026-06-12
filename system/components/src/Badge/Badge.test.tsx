import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders tone class and text", () => {
    const markup = renderToStaticMarkup(<Badge tone="success">Paid</Badge>);

    expect(markup).toContain("ds-badge--success");
    expect(markup).toContain("Paid");
  });
});
