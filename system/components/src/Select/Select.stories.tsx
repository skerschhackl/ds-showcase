import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";
import { StoryFieldGrid, StoryFrame } from "../storybook";

const roleOptions = [
  { label: "Viewer", value: "viewer" },
  { label: "Member", value: "member" },
  { label: "Admin", value: "admin" }
];

const meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  args: {
    label: "Role",
    hint: "Controls default workspace access.",
    error: "",
    disabled: false,
    defaultValue: "member",
    options: roleOptions
  },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" }
  },
  parameters: {
    docs: {
      description: {
        component: "Selects require a visible label and should be used for small finite option sets."
      }
    }
  }
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Select {...args} />
};

export const States: Story = {
  render: () => (
    <StoryFrame title="Select states" aiNote="Placeholder or first-option text cannot replace the label. Use error for specific validation feedback.">
      <StoryFieldGrid>
        <Select label="Role" hint="Controls default workspace access." defaultValue="member" options={roleOptions} />
        <Select
          label="Priority"
          error="Choose a priority before publishing."
          defaultValue=""
          options={[
            { label: "Select priority", value: "" },
            { label: "Low", value: "low" },
            { label: "High", value: "high" }
          ]}
        />
        <Select label="Plan" defaultValue="enterprise" disabled options={[{ label: "Enterprise", value: "enterprise" }]} />
      </StoryFieldGrid>
    </StoryFrame>
  )
};
