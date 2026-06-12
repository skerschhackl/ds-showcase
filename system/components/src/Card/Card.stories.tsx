import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { Badge } from "../Badge";
import { StoryFrame, StoryGrid } from "../storybook";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  args: {
    children: "Card content"
  },
  argTypes: {
    children: { control: "text" }
  },
  parameters: {
    docs: {
      description: {
        component: "Cards group related content on a tokenized surface."
      }
    }
  }
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Card {...args} />
};

export const States: Story = {
  render: () => (
    <StoryFrame title="Card states" aiNote="Use cards for grouped summaries, metrics, and compact content, not for page sections.">
      <StoryGrid>
        <Card>
          <Badge tone="success">Ready</Badge>
          <h3>Workspace health</h3>
          <p style={{ marginBottom: 0 }}>Card content uses shared surface, border, radius, spacing, and shadow tokens.</p>
        </Card>
        <Card>
          <h3>Long text pressure</h3>
          <p style={{ marginBottom: 0 }}>Generated content with longer copy should wrap inside the card without changing neighboring controls.</p>
        </Card>
      </StoryGrid>
    </StoryFrame>
  )
};
