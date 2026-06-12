import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";
import { StoryFieldGrid, StoryFrame } from "../storybook";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    label: "Workspace name",
    hint: "Visible labels are required.",
    error: "",
    placeholder: "Acme workspace",
    disabled: false
  },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" }
  },
  parameters: {
    docs: {
      description: {
        component: "Inputs require a visible label. Hints and errors are wired to aria-describedby."
      }
    }
  }
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Input {...args} />
};

export const States: Story = {
  render: () => (
    <StoryFrame title="Input states" aiNote="Placeholder text cannot replace the label or carry required instructions.">
      <StoryFieldGrid>
        <Input label="Workspace name" hint="Visible labels are required." placeholder="Acme workspace" />
        <Input label="Billing email" error="Enter a valid email address." placeholder="finance@example.com" />
        <Input label="Locked field" value="Managed by policy" disabled readOnly />
        <Input label="Very long field label for generated settings screens" hint="Long labels should wrap without layout overlap." />
      </StoryFieldGrid>
    </StoryFrame>
  )
};
