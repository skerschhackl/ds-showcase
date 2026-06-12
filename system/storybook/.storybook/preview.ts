import type { Preview } from "@storybook/react-vite";
import "@ds/components/styles.css";
import "./preview.css";

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true
    },
    options: {
      storySort: {
        order: ["Foundations", "Components"]
      }
    },
    a11y: {
      test: "todo"
    },
    backgrounds: {
      default: "Canvas",
      values: [
        { name: "Canvas", value: "#f7fbfc" },
        { name: "Surface", value: "#fbfdfc" },
        { name: "Raised", value: "#fcfefe" }
      ]
    }
  }
};

export default preview;
