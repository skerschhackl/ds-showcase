import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDefaultTabId, getDefaultTabPanelId, getTabSelectionForKey, TabPanel, Tabs } from "./Tabs";

describe("Tabs", () => {
  const tabs = [
    { id: "billing", label: "Billing" },
    { id: "team", label: "Team" },
    { id: "analytics", label: "Analytics" }
  ];

  it("renders an accessible tablist and marks the active tab", () => {
    const markup = renderToStaticMarkup(
      <Tabs
        ariaLabel="Generator examples"
        active="team"
        idPrefix="settings"
        onChange={() => undefined}
        tabs={tabs}
      />
    );

    expect(markup).toContain("role=\"tablist\"");
    expect(markup).toContain("aria-label=\"Generator examples\"");
    expect(markup).toContain("aria-selected=\"true\"");
    expect(markup).toContain("aria-controls=");
    expect(markup).toContain("id=");
    expect(markup).toContain("tabindex=\"0\"");
    expect(markup).toContain("tabindex=\"-1\"");
    expect(markup).toContain("Team");
    expect(markup).toContain("id=\"settings-team-tab\"");
    expect(markup).toContain("aria-controls=\"settings-team-panel\"");
  });

  it("allows explicit tab and panel id relationships", () => {
    const markup = renderToStaticMarkup(
      <Tabs
        ariaLabel="Generator examples"
        active="team"
        onChange={() => undefined}
        getTabId={(id) => `${id}-tab`}
        getPanelId={(id) => `${id}-panel`}
        tabs={tabs}
      />
    );

    expect(markup).toContain("id=\"team-tab\"");
    expect(markup).toContain("aria-controls=\"team-panel\"");
  });

  it("renders a tab panel linked to its tab", () => {
    const markup = renderToStaticMarkup(
      <TabPanel
        id={getDefaultTabPanelId("settings", "team")}
        active
        labelledBy={getDefaultTabId("settings", "team")}
      >
        Team settings
      </TabPanel>
    );

    expect(markup).toContain("role=\"tabpanel\"");
    expect(markup).toContain("id=\"settings-team-panel\"");
    expect(markup).toContain("aria-labelledby=\"settings-team-tab\"");
    expect(markup).not.toContain("hidden=");
  });

  it("renders tab buttons that can be selected", () => {
    const markup = renderToStaticMarkup(
      <Tabs
        ariaLabel="Generator examples"
        active="billing"
        onChange={() => undefined}
        tabs={tabs}
      />
    );

    expect(markup).toContain("<button");
    expect(markup).toContain("type=\"button\"");
    expect(markup).toContain("Billing");
    expect(markup).toContain("Team");
  });

  it("moves to the next and previous tabs with arrow keys", () => {
    expect(getTabSelectionForKey(tabs, "team", "ArrowRight")).toBe("analytics");
    expect(getTabSelectionForKey(tabs, "team", "ArrowDown")).toBe("analytics");
    expect(getTabSelectionForKey(tabs, "team", "ArrowLeft")).toBe("billing");
    expect(getTabSelectionForKey(tabs, "team", "ArrowUp")).toBe("billing");
  });

  it("wraps keyboard navigation and supports Home and End", () => {
    expect(getTabSelectionForKey(tabs, "billing", "ArrowLeft")).toBe("analytics");
    expect(getTabSelectionForKey(tabs, "analytics", "ArrowRight")).toBe("billing");
    expect(getTabSelectionForKey(tabs, "team", "End")).toBe("analytics");
    expect(getTabSelectionForKey(tabs, "team", "Home")).toBe("billing");
    expect(getTabSelectionForKey(tabs, "team", "Escape")).toBeUndefined();
  });
});
