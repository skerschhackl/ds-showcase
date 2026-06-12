import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Select } from "./Select";

describe("Select", () => {
  it("renders options and label", () => {
    const markup = renderToStaticMarkup(
      <Select id="role" label="Role" options={[{ label: "Admin", value: "admin" }]} hint="Choose one role" />
    );

    expect(markup).toContain("Role");
    expect(markup).toContain("Admin");
    expect(markup).toContain("<label");
    expect(markup).toContain("ds-select");
    expect(markup).toContain("aria-describedby=\"role-hint\"");
    expect(markup).toContain("id=\"role-hint\"");
  });

  it("connects errors to the select and marks it invalid", () => {
    const markup = renderToStaticMarkup(
      <Select
        id="role"
        label="Role"
        options={[{ label: "Admin", value: "admin" }]}
        error="Choose a role"
      />
    );

    expect(markup).toContain("aria-invalid=\"true\"");
    expect(markup).toContain("aria-describedby=\"role-error\"");
    expect(markup).toContain("id=\"role-error\"");
  });

  // @ts-expect-error visible labels are required by the component API.
  <Select options={[{ label: "Admin", value: "admin" }]} />;
});
