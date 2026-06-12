import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./Spinner";
import { Button } from "../Button";
import { StoryFrame, StoryRow } from "../storybook";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  args: {
    label: "Loading",
    size: "md"
  },
  argTypes: {
    label: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md"] }
  },
  parameters: {
    docs: {
      description: {
        component: "Spinner indicates progress and needs an accessible label."
      }
    }
  }
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Spinner {...args} />
};

export const States: Story = {
  render: () => (
    <StoryFrame title="Spinner states" aiNote="Prefer action-specific labels when spinner is used inside loading buttons.">
      <StoryRow label="Sizes">
        <Spinner label="Small loading indicator" size="sm" />
        <Spinner label="Medium loading indicator" />
      </StoryRow>
      <StoryRow label="Button loading">
        <Button loading loadingLabel="Generating UI">Generating</Button>
      </StoryRow>
    </StoryFrame>
  )
};
