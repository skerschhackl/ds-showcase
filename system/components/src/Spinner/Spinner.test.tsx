import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders an accessible status indicator", () => {
    const markup = renderToStaticMarkup(<Spinner label="Generating" size="sm" />);

    expect(markup).toContain("role=\"status\"");
    expect(markup).toContain("aria-label=\"Generating\"");
    expect(markup).toContain("aria-hidden=\"true\"");
    expect(markup).toContain("ds-spinner--sm");
  });
});
