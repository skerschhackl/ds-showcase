import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../Card";
import { StoryFrame } from "../storybook";
import { getDefaultTabId, getDefaultTabPanelId, TabPanel, Tabs, type TabsProps } from "./Tabs";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "settings", label: "Settings" }
];
type TabsStoryArgs = Omit<TabsProps, "onChange">;

const meta = {
  title: "Components/Tabs",
  tags: ["autodocs"],
  args: {
    ariaLabel: "Catalog tabs",
    idPrefix: "catalog-tabs",
    active: "overview",
    tabs
  },
  argTypes: {
    ariaLabel: { control: "text" },
    idPrefix: { control: "text" },
    active: { control: "inline-radio", options: tabs.map((tab) => tab.id) }
  },
  parameters: {
    docs: {
      description: {
        component: "Tabs control sibling tab panels with id, aria-controls, and aria-labelledby relationships."
      }
    }
  }
} satisfies Meta<TabsStoryArgs>;

export default meta;
type Story = StoryObj<TabsStoryArgs>;

export const Playground: Story = {
  args: {
    ariaLabel: "Catalog tabs",
    idPrefix: "catalog-tabs",
    active: "overview",
    tabs
  },
  render: (args) => {
    const {
      ariaLabel = "Catalog tabs",
      active: initialActive = "overview",
      tabs: storyTabs = tabs,
      idPrefix,
      ...storyArgs
    } = args;
    const [active, setActive] = useState(initialActive);
    const prefix = idPrefix ?? "catalog-tabs";

    return (
      <StoryFrame title="Tabs playground" aiNote="Use arrow keys, Home, and End to change the selected tab.">
        <Tabs {...storyArgs} ariaLabel={ariaLabel} idPrefix={prefix} active={active} onChange={setActive} tabs={storyTabs} />
        {storyTabs.map((tab) => (
          <TabPanel
            key={tab.id}
            id={getDefaultTabPanelId(prefix, tab.id)}
            active={active === tab.id}
            labelledBy={getDefaultTabId(prefix, tab.id)}
          >
            <Card>
              <strong>{tab.label}</strong>
              <p style={{ marginBottom: 0 }}>This panel is linked to its tab.</p>
            </Card>
          </TabPanel>
        ))}
      </StoryFrame>
    );
  }
};
