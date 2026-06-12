import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";
import { StoryFrame, StoryRow } from "../storybook";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "Ready",
    tone: "neutral"
  },
  argTypes: {
    tone: { control: "inline-radio", options: ["neutral", "primary", "success", "warning", "danger"] },
    children: { control: "text" }
  },
  parameters: {
    docs: {
      description: {
        component:
          "Badge text must communicate status without relying on color. Use neutral for non-evaluative metadata such as mode, category, or source labels."
      }
    }
  }
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Badge {...args} />
};

export const Tones: Story = {
  render: () => (
    <StoryFrame
      title="Badge tones"
      aiNote="Status text must be self-contained and contrast-safe for small text. Use neutral for non-evaluative metadata."
    >
      <StoryRow label="Tones">
        <Badge>Neutral</Badge>
        <Badge tone="primary">Invited</Badge>
        <Badge tone="success">Paid</Badge>
        <Badge tone="warning">Review</Badge>
        <Badge tone="danger">Failed</Badge>
      </StoryRow>
    </StoryFrame>
  )
};
