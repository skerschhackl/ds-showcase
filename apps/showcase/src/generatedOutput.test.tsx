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

  it("renders row and page actions independently for team management prompts", () => {
    const output = buildCustomOutput(
      "Create a team management screen with roles, invites, and access review and a download button per member, also include a button that exports all data shown"
    );

    expect(output.screen.kind).toBe("team");
    expect(output.screen.table.columns).toContain("Actions");
    expect(output.screen.table.rows.every((row) =>
      row.some((cell) => typeof cell === "object" && cell !== null && "action" in cell && cell.action === "Download")
    )).toBe(true);
    expect(output.screen.secondaryAction).toBe("Export all data shown");
    expect(output.compliance.some((item) => item.label === "Prompt fidelity")).toBe(false);
  });

  it("honors explicit role counts in team management prompts", () => {
    const output = buildCustomOutput(
      "Create a team management screen with 4 roles, invites, and access review and export functionality"
    );
    const defaultRoleField = output.screen.fields.find((field) => field.label === "Default role");

    expect(output.screen.kind).toBe("team");
    expect(defaultRoleField?.kind).toBe("select");
    expect(defaultRoleField?.options).toEqual(["Viewer", "Member", "Admin", "Owner"]);
    expect(output.screen.secondaryAction).toBe("Export");
  });

  it("honors explicit option and row counts across screen templates", () => {
    const billing = buildCustomOutput("Create a billing page with 4 plans and 5 invoices");
    const analytics = buildCustomOutput("Build an analytics dashboard with 5 segments and 4 metrics");
    const onboarding = buildCustomOutput("Create an onboarding checklist with six tasks");
    const recovery = buildCustomOutput("Generate a recovery screen with 4 checks and 4 retry policies");

    expect(billing.screen.fields.find((field) => field.label === "Plan")?.options).toHaveLength(4);
    expect(billing.screen.table.rows).toHaveLength(5);
    expect(analytics.screen.fields.find((field) => field.label === "Segment")?.options).toHaveLength(5);
    expect(analytics.screen.metrics).toHaveLength(4);
    expect(onboarding.screen.table.rows).toHaveLength(6);
    expect(recovery.screen.fields.find((field) => field.label === "Retry policy")?.options).toHaveLength(4);
    expect(recovery.screen.table.rows).toHaveLength(4);
  });

  it("flags requested counts that are not rendered", () => {
    const output = buildCustomOutput(
      "Create a team management screen with 5 fields, roles, invites, and access review"
    );

    expect(output.compliance).toContainEqual({
      label: "Prompt fidelity",
      status: "Watch",
      detail: "The prompt asked for 5 fields, but the generated screen rendered 2."
    });
  });

  it("flags table action requests that were not rendered in table cells", () => {
    const output = buildCustomOutput(
      "Create an onboarding checklist with setup tasks and an approve button per row."
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
