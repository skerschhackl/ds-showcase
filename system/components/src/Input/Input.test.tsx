import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Input } from "./Input";

describe("Input", () => {
  it("renders a visible label and hint", () => {
    const markup = renderToStaticMarkup(<Input id="billing-email" label="Billing email" hint="Used for invoices" />);

    expect(markup).toContain("Billing email");
    expect(markup).toContain("Used for invoices");
    expect(markup).toContain("<label");
    expect(markup).toContain("ds-input");
    expect(markup).toContain("aria-describedby=\"billing-email-hint\"");
    expect(markup).toContain("id=\"billing-email-hint\"");
  });

  it("connects errors to the input and marks it invalid", () => {
    const markup = renderToStaticMarkup(<Input id="billing-email" label="Billing email" error="Enter a valid email" />);

    expect(markup).toContain("aria-invalid=\"true\"");
    expect(markup).toContain("aria-describedby=\"billing-email-error\"");
    expect(markup).toContain("id=\"billing-email-error\"");
    expect(markup).toContain("Enter a valid email");
  });

  // @ts-expect-error visible labels are required by the component API.
  <Input />;
});
