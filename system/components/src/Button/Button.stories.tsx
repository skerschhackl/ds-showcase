import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { StoryFrame, StoryRow } from "../storybook";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Generate UI",
    variant: "primary",
    size: "md",
    loading: false,
    loadingLabel: "Generating UI",
    disabled: false
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    loading: { control: "boolean" },
    loadingLabel: { control: "text" },
    disabled: { control: "boolean" },
    children: { control: "text" }
  },
  parameters: {
    docs: {
      description: {
        component: "Use explicit action labels. Loading buttons need action-specific loading labels."
      }
    }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Button {...args} />
};

export const States: Story = {
  render: () => (
    <StoryFrame title="Button states" aiNote="Use one primary action per local group. Destructive actions must name the object.">
      <StoryRow label="Variants">
        <Button>Save changes</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="ghost">View details</Button>
      </StoryRow>
      <StoryRow label="Sizes">
        <Button size="sm">Small</Button>
        <Button>Medium</Button>
      </StoryRow>
      <StoryRow label="States">
        <Button loading loadingLabel="Saving changes">Saving</Button>
        <Button disabled>Disabled</Button>
        <Button>Very long action label that wraps cleanly</Button>
      </StoryRow>
    </StoryFrame>
  )
};
