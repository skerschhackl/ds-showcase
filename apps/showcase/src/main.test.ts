import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

describe("showcase ambient AI control usage", () => {
  it("keeps the ambient treatment scoped to the prompt textarea", () => {
    expect(source).toContain('controlFrameClassName="ds-ai-control-frame"');
    expect(source).toContain('controlClassName="ds-ai-control"');
    expect(source).not.toContain("ds-ai-surface");
    expect(source).not.toContain('className="preview-panel ds-ai-control"');
    expect(source).not.toContain('className="hero__signal ds-ai-control"');
  });

  it("uses a stable generated screen panel heading", () => {
    expect(source).toContain("<h2>Generated Screen</h2>");
    expect(source).not.toContain("<h2>{generatedOutput.title}</h2>");
  });

  it("shows a compliance review skeleton while generation is pending", () => {
    expect(source).toContain("function ComplianceReviewSkeleton()");
    expect(source).toContain("isGenerating ? (");
    expect(source).toContain("<ComplianceReviewSkeleton />");
  });

  it("shows composer mode as a compact prompt-card pill instead of a status panel", () => {
    expect(source).toContain("configuredComposerMode");
    expect(source).toContain("lastComposerMode");
    expect(source).toContain('className="composer-mode-pill"');
    expect(source).toContain('tone="neutral"');
    expect(source).not.toContain('className="composer-mode-pill" tone="neutral" glass');
    expect(source).toContain("Configured mode");
    expect(source).toContain("Rendered by");
    expect(source).not.toContain('title="Generation status"');
  });

  it("presents prompt examples as starter chips instead of tab panels", () => {
    expect(source).toContain('className="prompt-examples"');
    expect(source).toContain('className="prompt-example-chips"');
    expect(source).toContain("Prompt starters");
    expect(source).not.toContain("aria-pressed={selectedId === scenario.id}");
    expect(source).not.toContain('idPrefix="prompt-examples"');
    expect(source).not.toContain('hint="Edit the current prompt, then generate again to update the screen."');
  });
});
