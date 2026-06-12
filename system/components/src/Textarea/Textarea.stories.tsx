import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";
import { StoryFieldGrid, StoryFrame } from "../storybook";

const longPrompt = "Build an analytics dashboard for product adoption using system cards and tables including delete functionality via action button in table.";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    label: "Prompt",
    hint: "Describe the product UI to generate.",
    error: "",
    placeholder: "Build a workflow screen...",
    disabled: false,
    rows: 5
  },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    rows: { control: { type: "number", min: 2, max: 12 } }
  },
  parameters: {
    docs: {
      description: {
        component: "Textareas require a visible label. Hints and errors are wired to aria-describedby."
      }
    }
  }
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Textarea {...args} />
};

export const States: Story = {
  render: () => (
    <StoryFrame title="Textarea states" aiNote="Use Textarea for long-form prompt or note entry. Placeholder text cannot replace the label.">
      <StoryFieldGrid>
        <Textarea label="Prompt" hint="Describe the generated UI." placeholder="Build a billing screen..." rows={5} />
        <Textarea label="Review note" error="Add a specific review note." placeholder="What should change?" rows={4} />
        <Textarea label="Locked prompt" value="Managed by a saved example." disabled readOnly rows={4} />
        <Textarea label="Long prompt" defaultValue={longPrompt} hint="Long text should wrap without overlapping controls." rows={6} />
      </StoryFieldGrid>
    </StoryFrame>
  )
};
