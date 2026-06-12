import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildCustomOutput } from "./generatedOutput";

const source = readFileSync(new URL("./generatedOutput.tsx", import.meta.url), "utf8");

describe("deterministic generated output", () => {
  it("honors explicit heading and download button requests", () => {
    const output = buildCustomOutput(
      "Generate a billing settings page for a B2B workspace using approved components. It should have a heading at the top saying 'my bills' and featuring a button to download all entries"
    );

    expect(output.title).toBe("my bills");
    expect(output.screen.secondaryAction).toBe("Download all entries");
    expect(output.approvedComponents).toContain("Button");
    expect(output.compliance.some((item) => item.label === "Prompt fidelity")).toBe(false);
  });

  it("treats all-entry download requests as page actions instead of missing row actions", () => {
    const output = buildCustomOutput(
      "Show invoices in a table and include a button to download all entries."
    );

    expect(output.screen.secondaryAction).toBe("Download all entries");
    expect(output.compliance.some((item) => item.label === "Prompt fidelity")).toBe(false);
  });

  it("flags table action requests that were not rendered in table cells", () => {
    const output = buildCustomOutput(
      "Create a team management screen with roles for a dev team, invites, and access review featuring a button to download all entries for a team member, a sort functionality per role. it should show 10 members in the table"
    );

    expect(output.compliance).toContainEqual({
      label: "Prompt fidelity",
      status: "Watch",
      detail: expect.stringContaining("generated table did not include action cells")
    });
  });

  it("does not render a fake action result simulator", () => {
    expect(source).not.toContain("Action result");
    expect(source).not.toContain("actionMessage");
  });

  it("does not render the generated surface ready pill", () => {
    expect(source).not.toContain('{hasGaps ? "Blocked" : "Ready"}');
  });
});
