import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";
import { StoryFrame } from "../storybook";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    tone: "neutral",
    title: "Ready",
    children: "The workflow is available for review.",
    headingLevel: 2
  },
  argTypes: {
    tone: { control: "inline-radio", options: ["neutral", "success", "warning", "danger"] },
    title: { control: "text" },
    children: { control: "text" },
    headingLevel: { control: "inline-radio", options: [2, 3, 4, 5, 6] }
  },
  parameters: {
    docs: {
      description: {
        component: "Alerts provide system feedback with heading structure and ARIA relationships."
      }
    }
  }
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Alert {...args} />
};

export const Tones: Story = {
  render: () => (
    <StoryFrame title="Alert tones" aiNote="Keep alert bodies actionable and choose headingLevel to fit the page outline.">
      <div style={{ display: "grid", gap: "1rem" }}>
        <Alert tone="neutral" title="Ready">The workflow is available for review.</Alert>
        <Alert tone="success" title="Saved">The generated screen passed component review.</Alert>
        <Alert tone="warning" title="Review needed">A requested pattern is not available yet.</Alert>
        <Alert tone="danger" title="Sync failed">Retry the connection or open the run log.</Alert>
      </div>
    </StoryFrame>
  )
};
