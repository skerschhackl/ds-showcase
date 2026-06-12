import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Field } from "./Field";

describe("Field", () => {
  it("renders a visible label and connects hint and error text", () => {
    const markup = renderToStaticMarkup(
      <Field id="workspace" label="Workspace" hint="Use the company name" error="Workspace is required">
        {(controlProps) => <input {...controlProps} />}
      </Field>
    );

    expect(markup).toContain("<label");
    expect(markup).toContain("Workspace");
    expect(markup).toContain("id=\"workspace\"");
    expect(markup).toContain("aria-describedby=\"workspace-hint workspace-error\"");
    expect(markup).toContain("aria-invalid=\"true\"");
    expect(markup).toContain("id=\"workspace-hint\"");
    expect(markup).toContain("id=\"workspace-error\"");
  });
});
