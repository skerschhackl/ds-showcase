import type { GeneratedPage } from "@ds/ai-contracts";
import type { GeneratedScreen, KnownScreenKind } from "./liveComposer";

export type ScenarioId = KnownScreenKind;

export type ComplianceItem = { label: string; status: "Pass" | "Watch" | "Fail"; detail: string };

export type Scenario = {
  id: ScenarioId;
  label: string;
  prompt: string;
  title: string;
  summary: string;
  compliance: ComplianceItem[];
};

export type GeneratedOutput = {
  label: string;
  title: string;
  summary: string;
  prompt: string;
  compliance: ComplianceItem[];
  approvedComponents?: string[];
  unsupportedComponents?: string[];
  fingerprint: string;
  page?: GeneratedPage;
  screen: GeneratedScreen;
};

export type ComposerMode = "Live composer" | "Local composer";

export type GenerationSuccess = {
  status: "success";
  mode: ComposerMode;
  output: GeneratedOutput;
};

export type GenerationFailure = {
  status: "failed";
  mode: "Live composer";
  prompt: string;
  fingerprint: string;
  error: string;
  diagnostics?: string[];
  rawOutput?: unknown;
};

export type GenerationResult = GenerationSuccess | GenerationFailure;

export type AppView = "generator" | "components";
export type SemanticColor = { label: string; token: string; value: string };
export type HeroSignalItem = { label: string; detail: string; active?: boolean };
export type HeroContent = { badge: string; title: string; body: string; signalLabel: string; signal: HeroSignalItem[] };
