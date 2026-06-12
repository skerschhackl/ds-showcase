import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import { Field } from "./Field";
import { StoryFrame, StoryGrid } from "../storybook";

type FieldStoryArgs = Omit<ComponentProps<typeof Field>, "children">;

const meta = {
  title: "Components/Field",
  tags: ["autodocs"],
  args: {
    label: "Field label",
    hint: "Supporting guidance",
    error: "",
    id: "field-story"
  },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    id: { control: "text" }
  },
  parameters: {
    docs: {
      description: {
        component: "Public field wrapper shared by form controls and available for custom labeled controls that need hints, errors, and ARIA wiring."
      }
    }
  }
} satisfies Meta<FieldStoryArgs>;

export default meta;
type Story = StoryObj<FieldStoryArgs>;

export const Playground: Story = {
  args: {
    label: "Field label",
    hint: "Supporting guidance",
    error: "",
    id: "field-story"
  },
  render: (args) => {
    const { label = "Field label", ...fieldArgs } = args;

    return (
      <Field label={label} {...fieldArgs}>
        {(controlProps) => <input className="ds-input" {...controlProps} />}
      </Field>
    );
  }
};

export const States: Story = {
  args: {},
  render: () => (
    <StoryFrame title="Field states" aiNote="Field centralizes visible labels, hints, errors, aria-describedby, and aria-invalid.">
      <StoryGrid>
        <Field id="field-hint" label="With hint" hint="This text is connected with aria-describedby.">
          {(controlProps) => <input className="ds-input" {...controlProps} />}
        </Field>
        <Field id="field-error" label="With error" error="This field needs attention.">
          {(controlProps) => <input className="ds-input" {...controlProps} />}
        </Field>
      </StoryGrid>
    </StoryFrame>
  )
};
