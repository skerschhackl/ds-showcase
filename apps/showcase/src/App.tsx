import { useMemo, useState } from "react";
import { ClipboardCheck, Play, RotateCcw, Search, Sparkles } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Table,
  Tabs,
  TabPanel,
  Textarea,
  getDefaultTabId,
  getDefaultTabPanelId
} from "@ds/components";
import { ComponentsGallery } from "./features/components-gallery/ComponentsGallery";
import {
  CustomGeneratedScreen,
  GeneratedScreenSkeleton,
  buildCustomOutput,
  composeWithLiveApi
} from "./generatedOutput";
import { promptActionSummary, promptCountSummary } from "./promptSummaries";
import { heroContent, scenarios } from "./scenarios";
import type {
  AppView,
  ComplianceItem,
  ComposerMode,
  GeneratedOutput,
  GenerationFailure,
  GenerationResult,
  ScenarioId
} from "./showcaseTypes";

const showcaseViewTabs = [
  { id: "generator", label: "Generator" },
  { id: "components", label: "Components" }
] satisfies Array<{ id: AppView; label: string }>;

export function App() {
  const [view, setView] = useState<AppView>("generator");
  const [selectedId, setSelectedId] = useState<ScenarioId>("billing");
  const [generationResult, setGenerationResult] = useState<GenerationResult>(() =>
    buildGenerationSuccess("Local composer", buildCustomOutput(scenarios[0].prompt))
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState(scenarios[0].prompt);
  const activeHero = heroContent[view];
  const selectedScenario = scenarios.find((scenario) => scenario.id === selectedId) ?? scenarios[0];
  const configuredComposerMode = import.meta.env.VITE_AI_COMPOSER_URL ? "Live composer" : "Local composer";

  const matchedOutput = useMemo(() => {
    return buildCustomOutput(input);
  }, [input]);

  function selectScenario(id: ScenarioId) {
    const scenario = scenarios.find((item) => item.id === id);
    if (scenario) {
      setSelectedId(scenario.id);
      setInput(scenario.prompt);
    }
  }

  async function generate() {
    setIsGenerating(true);

    try {
      if (configuredComposerMode === "Local composer") {
        setGenerationResult(buildGenerationSuccess("Local composer", matchedOutput));
        return;
      }

      const liveResult = await composeWithLiveApi(input);

      if (liveResult.output) {
        setGenerationResult(buildGenerationSuccess("Live composer", liveResult.output));
        return;
      }

      setGenerationResult(buildGenerationFailure(input, liveResult.error, liveResult.diagnostics, liveResult.rawOutput));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero__copy" key={`${view}-copy`}>
          <Badge tone="primary">{activeHero.badge}</Badge>
          <h1>{activeHero.title}</h1>
          <p>{activeHero.body}</p>
        </div>
        <div className="hero__signal" aria-label={activeHero.signalLabel} key={`${view}-signal`}>
          {activeHero.signal.map((item, index) => (
            <span
              className={`hero__signal-item${item.active ? " hero__signal-item--active" : ""}`}
              key={item.label}
            >
              <span className="hero__signal-main">
                <span className="hero__signal-step">{index + 1}</span>
                <strong>{item.label}</strong>
              </span>
              <small>{item.detail}</small>
            </span>
          ))}
        </div>
      </section>

      <nav className="showcase-tabs" aria-label="Showcase sections">
        <Tabs
          ariaLabel="Showcase view"
          active={view}
          idPrefix="showcase-view"
          onChange={setView}
          tabs={showcaseViewTabs}
        />
      </nav>

      <TabPanel
        id={getDefaultTabPanelId("showcase-view", "generator")}
        active={view === "generator"}
        labelledBy={getDefaultTabId("showcase-view", "generator")}
      >
        <section className="workspace" aria-label="AI design system demo">
          <Card className="prompt-composer">
            <div className="panel-heading">
              <Sparkles aria-hidden="true" size={20} />
              <div>
                <h2>Prompt to UI</h2>
                <p>Describe a product screen, then generate a governed UI from approved components.</p>
              </div>
              <Badge className="composer-mode-pill" tone="neutral">
                {isGenerating ? `Generating with ${configuredComposerMode.toLowerCase()}` : configuredComposerMode}
              </Badge>
            </div>

            <section className="prompt-examples" aria-labelledby="prompt-examples-title">
              <span id="prompt-examples-title" className="prompt-examples__label">Prompt starters</span>
              <div className="prompt-example-chips" role="group" aria-labelledby="prompt-examples-title">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    className="prompt-example-chip"
                    type="button"
                    onClick={() => selectScenario(scenario.id)}
                  >
                    {scenario.label}
                  </button>
                ))}
              </div>
            </section>

            <Textarea
              className="prompt-input-field"
              label="Prompt"
              controlFrameClassName="ds-ai-control-frame"
              controlClassName="ds-ai-control"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={5}
            />

            <div className="button-row">
              <Button variant="secondary" onClick={() => setInput(selectedScenario.prompt)}>
                <RotateCcw size={16} aria-hidden="true" />
                Reset
              </Button>
              <Button className="generate-button" onClick={generate} loading={isGenerating} loadingLabel="Generating UI">
                {!isGenerating ? <Play size={16} aria-hidden="true" /> : null}
                {isGenerating ? "Generating" : "Generate UI"}
              </Button>
            </div>
          </Card>

          <div className="result-layout">
            <Card className="preview-panel">
              <div className="panel-heading">
                <Search aria-hidden="true" size={20} />
                <div>
                  <h2>Generated Screen</h2>
                  <p>{previewSummary(isGenerating, generationResult)}</p>
                </div>
              </div>
              {isGenerating ? (
                <GeneratedScreenSkeleton />
              ) : generationResult.status === "success" ? (
                <CustomGeneratedScreen output={generationResult.output} />
              ) : (
                <GenerationFailurePanel failure={generationResult} />
              )}
            </Card>

            <Card className="review-panel">
              <div className="panel-heading">
                <ClipboardCheck aria-hidden="true" size={20} />
                <div>
                  <h2>Compliance Review</h2>
                  <p>{isGenerating ? "Checking generation evidence..." : "Live evidence for the current generated output."}</p>
                </div>
              </div>
              {isGenerating ? (
                <ComplianceReviewSkeleton />
              ) : (
                <>
                  <Table
                    caption="Generation evidence"
                    columns={["Signal", "Value"]}
                    rows={generationEvidenceRows(generationResult, configuredComposerMode)}
                  />
                  <Table
                    caption="Compliance checks"
                    columns={["Check", "Status", "Detail"]}
                    rows={complianceRows(generationResult)}
                  />
                </>
              )}
            </Card>
          </div>
        </section>
      </TabPanel>
      <TabPanel
        id={getDefaultTabPanelId("showcase-view", "components")}
        active={view === "components"}
        labelledBy={getDefaultTabId("showcase-view", "components")}
      >
        <ComponentsGallery />
      </TabPanel>
    </main>
  );
}

function buildGenerationSuccess(mode: ComposerMode, output: GeneratedOutput): GenerationResult {
  return { status: "success", mode, output };
}

function buildGenerationFailure(
  prompt: string,
  error: string,
  diagnostics?: string[],
  rawOutput?: unknown
): GenerationFailure {
  return {
    status: "failed",
    mode: "Live composer",
    prompt,
    fingerprint: promptFingerprint(prompt),
    error,
    diagnostics,
    rawOutput
  };
}

function previewSummary(isGenerating: boolean, result: GenerationResult) {
  if (isGenerating) {
    return "Generating a governed screen from your prompt...";
  }

  if (result.status === "failed") {
    return "Live composer failed. No local fallback was rendered.";
  }

  return result.output.summary;
}

function generationEvidenceRows(result: GenerationResult, configuredComposerMode: ComposerMode) {
  if (result.status === "failed") {
    return [
      ["Configured mode", configuredComposerMode],
      ["Rendered by", "None"],
      ["Prompt", result.fingerprint],
      ["Detected counts", promptCountSummary(result.prompt)],
      ["Detected actions", promptActionSummary(result.prompt)],
      ["Components", "None"],
      ["Gaps", "Live output did not pass validation"]
    ];
  }

  return [
    ["Configured mode", configuredComposerMode],
    ["Rendered by", result.mode],
    ["Prompt", result.output.fingerprint],
    ["Detected counts", promptCountSummary(result.output.prompt)],
    ["Detected actions", promptActionSummary(result.output.prompt)],
    ["Components", (result.output.approvedComponents ?? []).join(", ")],
    ["Gaps", result.output.unsupportedComponents?.length ? result.output.unsupportedComponents.join(", ") : "None"]
  ];
}

function complianceRows(result: GenerationResult) {
  if (result.status === "failed") {
    return [
      [
        "Live composer",
        <Badge tone="danger">Fail</Badge>,
        result.error
      ],
      [
        "Fallback",
        <Badge tone="success">Pass</Badge>,
        "No local/demo output was rendered over the failed live response."
      ]
    ];
  }

  return result.output.compliance.map((item) => [
    item.label,
    <Badge tone={statusTone(item.status)}>{item.status}</Badge>,
    item.detail
  ]);
}

export function GenerationFailurePanel({ failure }: { failure: GenerationFailure }) {
  const rawOutput = failure.rawOutput === undefined ? undefined : JSON.stringify(failure.rawOutput, null, 2);

  return (
    <div className="screen-stack">
      <div className="generation-detail generation-detail--failed">
        <div>
          <span className="metric-label">Prompt trace</span>
          <p>{failure.prompt}</p>
        </div>
        <div>
          <span className="metric-label">Rendered output</span>
          <div className="badge-row">
            <Badge tone="danger">None</Badge>
            <Badge tone="neutral">Live composer failed</Badge>
          </div>
        </div>
      </div>

      <Alert tone="danger" title="Live composer failed">
        {failure.error}
      </Alert>

      {failure.diagnostics?.length ? (
        <section className="page-section">
          <h3>Validation diagnostics</h3>
          <ul className="diagnostic-list">
            {failure.diagnostics.map((diagnostic, index) => (
              <li key={`${diagnostic}-${index}`}>{diagnostic}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {rawOutput ? (
        <section className="page-section">
          <h3>Raw model output</h3>
          <pre className="raw-output">{rawOutput}</pre>
        </section>
      ) : null}
    </div>
  );
}

function promptFingerprint(prompt: string) {
  const hash = Array.from(prompt).reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 9973, 17);
  return `prompt-${hash.toString().padStart(4, "0")}`;
}

function statusTone(status: ComplianceItem["status"]) {
  return status === "Pass" ? "success" : status === "Fail" ? "danger" : "warning";
}

export function ComplianceReviewSkeleton() {
  return (
    <div className="compliance-skeleton" aria-live="polite" aria-busy="true">
      <div className="skeleton-table">
        <span className="skeleton-line skeleton-line--label" />
        <span className="skeleton-line" />
        <span className="skeleton-line" />
        <span className="skeleton-line" />
      </div>
      <div className="skeleton-table">
        <span className="skeleton-line skeleton-line--label" />
        <span className="skeleton-line" />
        <span className="skeleton-line" />
        <span className="skeleton-line" />
      </div>
    </div>
  );
}
