import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders a visible label and hint", () => {
    const markup = renderToStaticMarkup(
      <Textarea id="prompt" label="Prompt" hint="Describe the screen to generate." />
    );

    expect(markup).toContain("Prompt");
    expect(markup).toContain("Describe the screen to generate.");
    expect(markup).toContain("<label");
    expect(markup).toContain("ds-textarea");
    expect(markup).toContain("aria-describedby=\"prompt-hint\"");
    expect(markup).toContain("id=\"prompt-hint\"");
  });

  it("connects errors to the textarea and marks it invalid", () => {
    const markup = renderToStaticMarkup(<Textarea id="prompt" label="Prompt" error="Enter a prompt" />);

    expect(markup).toContain("aria-invalid=\"true\"");
    expect(markup).toContain("aria-describedby=\"prompt-error\"");
    expect(markup).toContain("id=\"prompt-error\"");
    expect(markup).toContain("Enter a prompt");
  });

  it("passes a custom class to the field wrapper", () => {
    const markup = renderToStaticMarkup(<Textarea label="Prompt" className="prompt-textarea" />);

    expect(markup).toContain("ds-field prompt-textarea");
  });

  it("passes a custom class to the textarea control", () => {
    const markup = renderToStaticMarkup(<Textarea label="Prompt" controlClassName="ds-ai-control" />);

    expect(markup).toContain("ds-textarea ds-ai-control");
  });

  it("can wrap the textarea control in a custom frame", () => {
    const markup = renderToStaticMarkup(
      <Textarea label="Prompt" controlClassName="ds-ai-control" controlFrameClassName="ds-ai-control-frame" />
    );

    expect(markup).toContain("class=\"ds-ai-control-frame\"");
    expect(markup).toContain("ds-textarea ds-ai-control");
  });

  // @ts-expect-error visible labels are required by the component API.
  <Textarea />;
});
