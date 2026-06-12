import { describe, expect, it } from "vitest";
import {
  normalizeComponentNames,
  normalizeLivePayload,
  normalizeLiveScreen,
  normalizeUnsupportedComponents
} from "./liveComposer";

describe("live composer normalization", () => {
  it("accepts partial live payloads so they can be normalized before rendering", () => {
    const normalized = normalizeLivePayload({
        title: "Error Recovery Flow",
        summary: "Handle and recover from a failed data sync.",
        components: ["Card", "Table"],
        screen: {}
      },
      "Error Recovery Flow"
    );

    expect(normalized.diagnostics.length).toBeGreaterThan(0);
    expect(normalized.data.screen.metrics).toHaveLength(3);
  });

  it("fills missing screen arrays with safe defaults", () => {
    const screen = normalizeLiveScreen(
      {
        alert: { tone: "danger", title: "Data Sync Failed" },
        table: {}
      },
      "Error Recovery Flow"
    );

    expect(screen.alert).toEqual({
      tone: "danger",
      title: "Data Sync Failed",
      body: "The model returned a partial screen, so missing parts were filled with safe defaults."
    });
    expect(screen.metrics).toHaveLength(3);
    expect(screen.fields).toHaveLength(2);
    expect(screen.table.columns).toEqual(["Item", "Status", "Action"]);
    expect(screen.table.rows).toHaveLength(2);
  });

  it("infers live screen kind from title and prompt context", () => {
    const screen = normalizeLiveScreen(
      {
        alert: { tone: "success", title: "Billing ready" },
        table: {}
      },
      "my bills",
      "Generate a billing settings page with invoice history"
    );

    expect(screen.kind).toBe("billing");
  });

  it("normalizes strange row cells into renderable table cells", () => {
    const screen = normalizeLiveScreen(
      {
        table: {
          columns: ["Action", "Status", "Enabled"],
          rows: [
            [{ action: "Delete", variant: "danger" }, { text: "Blocked", tone: "loud" }, true],
            ["Retry", null, 2]
          ]
        }
      },
      "Recovery"
    );

    expect(screen.table.rows).toEqual([
      [{ action: "Delete", variant: "secondary" }, { text: "Blocked", tone: "neutral" }, true],
      ["Retry", "", 2]
    ]);
  });

  it("repairs button-shaped fields into screen actions instead of inputs", () => {
    const screen = normalizeLiveScreen(
      {
        fields: [
          { label: "Billing email", kind: "input", placeholder: "finance@example.com" },
          { label: "Download all entries", kind: "button" }
        ],
        table: {
          columns: ["Invoice", "Amount"],
          rows: [["INV-1", "$100.00"]]
        }
      },
      "my bills"
    );

    expect(screen.fields).toEqual([
      { label: "Billing email", kind: "input", placeholder: "finance@example.com" }
    ]);
    expect(screen.primaryAction).toBe("Download all entries");
  });

  it("keeps approved component names out of unsupported gaps", () => {
    expect(normalizeComponentNames(["tabs", "CARD", "Chart", "Button", "Textarea", "Button"])).toEqual(["Tabs", "Card", "Button", "Textarea"]);
    expect(normalizeUnsupportedComponents(["Tabs", "Chart", " chart ", "Modal", "Button", "Textarea"])).toEqual(["Chart", "Modal"]);
  });
});
