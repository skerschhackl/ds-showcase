import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  LiveComposerResponseJsonSchema,
  detectUnsupportedComponentRequests,
  normalizeLiveComposerResponse,
  parseGenerateRequest,
  parseLiveComposerResponse,
  unsupportedComponentNames
} from "./index.js";

const currentFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(currentFile), "..", "..", "..");

describe("shared AI contracts", () => {
  it("trims prompt input and clamps allowed components to the approved set", () => {
    const parsed = parseGenerateRequest({
      prompt: "  Build a dashboard  ",
      allowedComponents: ["Card", "Chart", "Table", "Modal"]
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw parsed.error;
    }
    expect(parsed.data).toEqual({
      prompt: "Build a dashboard",
      allowedComponents: ["Card", "Table"]
    });
  });

  it("defaults allowed components when the request omits them", () => {
    const parsed = parseGenerateRequest({ prompt: "Build a settings screen" });

    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw parsed.error;
    }
    expect(parsed.data.allowedComponents).toEqual(["Alert", "Badge", "Button", "Card", "Input", "Select", "Table", "Tabs", "Textarea"]);
  });

  it("exposes the unsupported component gap contract", () => {
    expect(unsupportedComponentNames).toContain("Modal");
    expect(unsupportedComponentNames).toContain("Chart");
    expect(detectUnsupportedComponentRequests("Create a dashboard with charts and invite modal.")).toEqual([
      "Chart",
      "Modal"
    ]);
    expect(detectUnsupportedComponentRequests("Compare payment modalities and chartreuse states.")).toEqual([]);
  });

  it("validates complete model responses", () => {
    const parsed = parseLiveComposerResponse({
      title: "Recovery Flow",
      summary: "Handle a failed sync.",
      components: ["Alert", "Card", "Table", "Button"],
      unsupported: [],
      screen: {
        alert: { tone: "danger", title: "Sync failed", body: "Review the failure and retry." },
        metrics: [{ label: "Attempts", value: "3" }],
        fields: [{ label: "Owner", kind: "input" }],
        table: {
          columns: ["Check", "Status"],
          rows: [["Credentials", { text: "Valid", tone: "success" }]]
        },
        primaryAction: "Retry sync",
        secondaryAction: "View logs"
      }
    });

    expect(parsed.success).toBe(true);
  });

  it("normalizes unsupported component gaps even when the model response is schema-valid", () => {
    const normalized = normalizeLiveComposerResponse({
      title: "Recovery Flow",
      summary: "Handle a failed sync.",
      components: ["Alert", "Card", "Button"],
      unsupported: ["Modal", "Button", "Modal"],
      screen: {
        alert: { tone: "danger", title: "Sync failed", body: "Review the failure and retry." },
        metrics: [{ label: "Attempts", value: "3" }],
        fields: [{ label: "Owner", kind: "input" }],
        table: {
          columns: ["Check", "Status"],
          rows: [["Credentials", { text: "Valid", tone: "success" }]]
        },
        primaryAction: "Retry sync",
        secondaryAction: "View logs"
      }
    });

    expect(normalized.diagnostics).toEqual([]);
    expect(normalized.data.components).toEqual(["Alert", "Card", "Button"]);
    expect(normalized.data.unsupported).toEqual(["Modal"]);
  });

  it("validates and normalizes textarea fields", () => {
    const normalized = normalizeLiveComposerResponse({
      title: "Review Notes",
      summary: "Capture long-form review feedback.",
      components: ["Card", "Input", "Textarea", "Button"],
      unsupported: [],
      screen: {
        alert: { tone: "neutral", title: "Feedback requested", body: "Add the review notes before publishing." },
        metrics: [{ label: "Review state", value: "Draft" }],
        fields: [
          { label: "Reviewer", kind: "input", placeholder: "Name" },
          { label: "Review notes", kind: "textarea", placeholder: "Describe what changed", rows: 20 }
        ],
        table: {
          columns: ["Item", "Status"],
          rows: [["Copy", { text: "Review", tone: "warning" }]]
        },
        primaryAction: "Save review",
        secondaryAction: "Cancel"
      }
    });

    expect(normalized.data.components).toContain("Textarea");
    expect(normalized.data.screen.fields[1]).toEqual({
      label: "Review notes",
      kind: "textarea",
      placeholder: "Describe what changed",
      rows: 12
    });
  });

  it("normalizes partial model responses with diagnostics", () => {
    const normalized = normalizeLiveComposerResponse(
      {
        title: "Recovery Flow",
        summary: "Handle a failed sync.",
        components: ["Alert", "Tabs", "Chart"],
        screen: {
          alert: { tone: "danger", title: "Sync failed" },
          table: {}
        }
      },
      "Recovery Flow"
    );

    expect(normalized.diagnostics.length).toBeGreaterThan(0);
    expect(normalized.data.components).toEqual(["Alert", "Tabs"]);
    expect(normalized.data.unsupported).toEqual(["Chart"]);
    expect(normalized.data.screen.table.columns).toEqual(["Item", "Status", "Action"]);
    expect(normalized.data.screen.table.rows).toHaveLength(2);
  });

  it("normalizes ten team member rows with button-like table actions", () => {
    const rows = Array.from({ length: 10 }, (_, index) => [
      `Member ${index + 1}`,
      { text: index % 2 === 0 ? "Developer" : "Designer", tone: "primary" },
      { text: "Active", tone: "success" },
      { kind: "button", label: "Download all entries" }
    ]);

    const normalized = normalizeLiveComposerResponse({
      title: "Dev Team Management",
      summary: "Manage dev team roles, invites, and access review.",
      components: ["Badge", "Button", "Card", "Input", "Select", "Table"],
      unsupported: [],
      screen: {
        alert: { tone: "neutral", title: "Team ready", body: "Review access by role." },
        metrics: [{ label: "Total members", value: "10" }],
        fields: [{ label: "Role", kind: "select", options: ["Developer", "Designer"] }],
        table: {
          columns: ["Name", "Role", "Status", "Actions"],
          rows
        },
        primaryAction: "Download all entries",
        secondaryAction: "Sort by role"
      }
    });

    expect(normalized.data.screen.table.rows).toHaveLength(10);
    expect(normalized.data.screen.table.rows[0][3]).toEqual({
      action: "Download all entries",
      variant: "secondary"
    });
  });

  it("normalizes multiple action objects inside one table cell into an explicit actions cell", () => {
    const normalized = normalizeLiveComposerResponse({
      title: "Team Roles",
      summary: "Manage role actions.",
      components: ["Badge", "Button", "Card", "Input", "Select", "Table"],
      unsupported: [],
      screen: {
        alert: { tone: "neutral", title: "Roles ready", body: "Review role access." },
        metrics: [{ label: "Roles", value: "2" }],
        fields: [{ label: "Role", kind: "select", options: ["Admin", "Member"] }],
        table: {
          columns: ["Email", "Role", "Status", "Actions"],
          rows: [[
            "user1@example.com",
            "Admin",
            "Active",
            [{ action: "Edit", variant: "secondary" }, { action: "Remove", variant: "ghost" }]
          ]]
        },
        primaryAction: "Export all roles",
        secondaryAction: "Export entire table"
      }
    });

    expect(normalized.data.screen.table.rows[0][3]).toEqual({
      actions: [
        { action: "Edit", variant: "secondary" },
        { action: "Remove", variant: "ghost" }
      ]
    });
  });

  it("normalizes invalid non-action table cell arrays into readable text", () => {
    const normalized = normalizeLiveComposerResponse({
      title: "Team Roles",
      summary: "Manage role status notes.",
      components: ["Badge", "Card", "Table"],
      unsupported: [],
      screen: {
        alert: { tone: "neutral", title: "Roles ready", body: "Review role status." },
        metrics: [{ label: "Roles", value: "2" }],
        fields: [],
        table: {
          columns: ["Email", "Notes", "Mixed actions"],
          rows: [[
            "user1@example.com",
            [{ text: "Ready", tone: "success" }, "needs review"],
            [{ action: "Edit", variant: "secondary" }, "unexpected note"]
          ]]
        },
        primaryAction: "Export all roles",
        secondaryAction: "Export entire table"
      }
    });

    expect(normalized.data.screen.table.rows[0][1]).toBe("Ready, needs review");
    expect(normalized.data.screen.table.rows[0][2]).toBe("Edit, unexpected note");
  });

  it("keeps the checked-in provider JSON Schema generated from Zod", async () => {
    const schemaPath = path.join(repoRoot, "ai", "live-composer.schema.json");
    const checkedInSchema = JSON.parse(await readFile(schemaPath, "utf8"));

    expect(checkedInSchema).toEqual(LiveComposerResponseJsonSchema);
  });
});
