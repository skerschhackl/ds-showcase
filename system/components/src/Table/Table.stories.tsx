import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "./Table";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { StoryFrame } from "../storybook";

const sampleRows = [
  ["Invite teammates", <Badge tone="primary">Next</Badge>, <Button size="sm" variant="secondary">Start invite</Button>],
  ["Review access", <Badge tone="warning">Review</Badge>, <Button size="sm" variant="secondary">Open review</Button>],
  ["Delete stale report", <Badge tone="danger">Blocked</Badge>, <Button size="sm" variant="secondary">Delete report</Button>]
];

const meta = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
  args: {
    caption: "Workflow queue",
    columns: ["Item", "Status", "Action"],
    rows: sampleRows
  },
  argTypes: {
    caption: { control: "text" },
    ariaLabel: { control: "text" }
  },
  parameters: {
    docs: {
      description: {
        component: "Tables need clear headers and captions or accessible labels when context is not obvious."
      }
    }
  }
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Table {...args} />
};

export const States: Story = {
  render: () => (
    <StoryFrame title="Table states" aiNote="Status cells need text, and row action buttons need explicit labels.">
      <Table caption="Workflow queue" columns={["Item", "Status", "Action"]} rows={sampleRows} />
      <Table
        ariaLabel="Compact status table"
        columns={["Check", "Result"]}
        rows={[
          ["Required labels", <Badge tone="success">Pass</Badge>],
          ["Unsupported dialog", <Badge tone="warning">Flagged</Badge>]
        ]}
      />
    </StoryFrame>
  )
};
