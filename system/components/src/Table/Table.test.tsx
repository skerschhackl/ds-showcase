import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Table } from "./Table";

describe("Table", () => {
  it("renders headers and rows", () => {
    const markup = renderToStaticMarkup(
      <Table columns={["Name", "Status"]} rows={[["Ari", "Active"]]} />
    );

    expect(markup).toContain("<th scope=\"col\">Name</th>");
    expect(markup).toContain("<td>Ari</td>");
    expect(markup).toContain("ds-table");
  });

  it("renders a caption or aria-label for table context", () => {
    const captionMarkup = renderToStaticMarkup(
      <Table caption="Invoice history" columns={["Invoice"]} rows={[["INV-1"]]} />
    );
    const labelMarkup = renderToStaticMarkup(
      <Table ariaLabel="Invoice history" columns={["Invoice"]} rows={[["INV-1"]]} />
    );

    expect(captionMarkup).toContain("<caption>Invoice history</caption>");
    expect(labelMarkup).toContain("aria-label=\"Invoice history\"");
  });
});
