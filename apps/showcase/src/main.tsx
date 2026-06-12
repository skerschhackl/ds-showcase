import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
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
import { ComponentsGallery } from "./ComponentsGallery";
import {
  CustomGeneratedScreen,
  GeneratedScreenSkeleton,
  buildCustomOutput,
  composeWithLiveApi
} from "./generatedOutput";
import { heroContent, scenarios } from "./scenarios";
import type { AppView, ComplianceItem, GeneratedOutput, ScenarioId } from "./showcaseTypes";
import "@ds/components/styles.css";
import "./styles.css";

const showcaseViewTabs = [
  { id: "generator", label: "Generator" },
  { id: "components", label: "Components" }
] satisfies Array<{ id: AppView; label: string }>;

function App() {
  const [view, setView] = useState<AppView>("generator");
  const [selectedId, setSelectedId] = useState<ScenarioId>("billing");
  const [generatedOutput, setGeneratedOutput] = useState<GeneratedOutput>(() =>
    buildCustomOutput(scenarios[0].prompt)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastComposerMode, setLastComposerMode] = useState<"Live composer" | "Local composer">("Local composer");
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
      const liveOutput = await composeWithLiveApi(input);
      setGeneratedOutput(liveOutput ?? matchedOutput);
      setLastComposerMode(liveOutput ? "Live composer" : "Local composer");
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
                <p>Examples only seed the prompt. Generate always uses the current prompt text.</p>
              </div>
              <Badge className="composer-mode-pill" tone="neutral">
                {isGenerating ? `Generating with ${configuredComposerMode.toLowerCase()}` : configuredComposerMode}
              </Badge>
            </div>

            <Tabs
              ariaLabel="Prompt examples"
              active={selectedId}
              idPrefix="prompt-examples"
              onChange={selectScenario}
              tabs={scenarios.map((scenario) => ({ id: scenario.id, label: scenario.label }))}
            />

            {scenarios.map((scenario) => (
              <TabPanel
                key={scenario.id}
                id={getDefaultTabPanelId("prompt-examples", scenario.id)}
                active={selectedId === scenario.id}
                labelledBy={getDefaultTabId("prompt-examples", scenario.id)}
              >
                <Textarea
                  label="Prompt"
                  controlFrameClassName="ds-ai-control-frame"
                  controlClassName="ds-ai-control"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  rows={5}
                  hint="Edit the current prompt, then generate again to update the screen."
                />
              </TabPanel>
            ))}

            <div className="button-row">
              <Button onClick={generate} loading={isGenerating} loadingLabel="Generating UI">
                {!isGenerating ? <Play size={16} aria-hidden="true" /> : null}
                {isGenerating ? "Generating" : "Generate UI"}
              </Button>
              <Button variant="secondary" onClick={() => setInput(selectedScenario.prompt)}>
                <RotateCcw size={16} aria-hidden="true" />
                Reset
              </Button>
            </div>
          </Card>

          <div className="result-layout">
            <Card className="preview-panel">
              <div className="panel-heading">
                <Search aria-hidden="true" size={20} />
                <div>
                  <h2>Generated Screen</h2>
                  <p>{isGenerating ? "Generating a governed screen from your prompt..." : generatedOutput.summary}</p>
                </div>
              </div>
              {isGenerating ? <GeneratedScreenSkeleton /> : <CustomGeneratedScreen output={generatedOutput} />}
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
                    rows={[
                      ["Configured mode", configuredComposerMode],
                      ["Rendered by", lastComposerMode],
                      ["Prompt", generatedOutput.fingerprint],
                      ["Components", (generatedOutput.approvedComponents ?? []).join(", ")],
                      ["Gaps", generatedOutput.unsupportedComponents?.length ? generatedOutput.unsupportedComponents.join(", ") : "None"]
                    ]}
                  />
                  <Table
                    caption="Compliance checks"
                    columns={["Check", "Status", "Detail"]}
                    rows={generatedOutput.compliance.map((item) => [
                      item.label,
                      <Badge tone={statusTone(item.status)}>{item.status}</Badge>,
                      item.detail
                    ])}
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

function statusTone(status: ComplianceItem["status"]) {
  return status === "Pass" ? "success" : status === "Fail" ? "danger" : "warning";
}

function ComplianceReviewSkeleton() {
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

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
