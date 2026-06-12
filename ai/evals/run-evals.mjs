import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeLiveComposerResponse } from "@ds/ai-contracts";

const root = path.dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(await fs.readFile(path.join(root, "cases.json"), "utf8"));
const composerEvalUrl = process.env.COMPOSER_EVAL_URL;
const evalTimeoutMs = Number(process.env.EVAL_TIMEOUT_MS ?? 45000);

const results = await Promise.all(cases.map(async (testCase) => {
  const findings = [];
  const output = composerEvalUrl
    ? await outputFromComposer(testCase.prompt, composerEvalUrl, findings)
    : outputFromFixture(testCase.output, testCase.prompt, findings);
  const expect = testCase.expect;

  for (const component of expect.requiredComponents ?? []) {
    if (!output.components.includes(component)) {
      findings.push(`Missing required component: ${component}`);
    }
  }

  for (const component of expect.forbiddenComponents ?? []) {
    if (output.components.includes(component)) {
      findings.push(`Uses forbidden component: ${component}`);
    }
  }

  for (const component of expect.requiresUnsupportedFlag ?? []) {
    if (!output.unsupported.includes(component)) {
      findings.push(`Missing unsupported-component flag: ${component}`);
    }
  }

  for (const token of expect.requiresTokenEvidence ?? ["surface", "border", "spacing"]) {
    if (!output.tokens.includes(token)) {
      findings.push(`Missing token evidence: ${token}`);
    }
  }

  if (expect.requiresVisibleLabels && !output.accessibility.includes("visible labels")) {
    findings.push("Missing visible-label accessibility evidence");
  }

  if (expect.requiresStatusText && !output.accessibility.includes("status text")) {
    findings.push("Missing status-text accessibility evidence");
  }

  if (expect.requiresTableStructure && !output.accessibility.includes("table structure")) {
    findings.push("Missing table structure evidence");
  }

  if (expect.requiresActionLabels && !output.renderChecks.includes("action labels")) {
    findings.push("Missing action labels in rendered plan");
  }

  if (expect.rejectsUnsupportedRendered && !output.renderChecks.includes("unsupported not rendered")) {
    findings.push("Unsupported components appear in the rendered component list");
  }

  for (const term of expect.promptTerms ?? []) {
    if (!output.promptTerms.includes(term.toLowerCase())) {
      findings.push(`Missing prompt-specific term: ${term}`);
    }
  }

  return {
    id: testCase.id,
    status: findings.length ? "fail" : "pass",
    findings
  };
}));

const failed = results.filter((result) => result.status === "fail");

for (const result of results) {
  const mark = result.status === "pass" ? "PASS" : "FAIL";
  console.log(`${mark} ${result.id}`);
  for (const finding of result.findings) {
    console.log(`  - ${finding}`);
  }
}

console.log(`\n${results.length - failed.length}/${results.length} eval cases passed.`);

if (failed.length) {
  process.exitCode = 1;
}

async function outputFromComposer(prompt, endpoint, findings) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), evalTimeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal: controller.signal
    });

    const payload = await response.json().catch(() => undefined);

    if (!response.ok) {
      findings.push(`Composer request failed: HTTP ${response.status}`);
      return emptyOutput();
    }

    return summarizeComposerPayload(payload, prompt, findings);
  } catch (error) {
    findings.push(error instanceof Error && error.name === "AbortError"
      ? "Composer request timed out"
      : `Composer request failed: ${error instanceof Error ? error.message : String(error)}`);
    return emptyOutput();
  } finally {
    clearTimeout(timeout);
  }
}

function outputFromFixture(output, prompt, findings) {
  if (output && typeof output === "object" && "screen" in output) {
    return summarizeComposerPayload(output, prompt, findings);
  }

  return {
    components: output.components ?? [],
    unsupported: output.unsupported ?? [],
    tokens: output.tokens ?? [],
    accessibility: output.accessibility ?? [],
    renderChecks: output.renderChecks ?? [],
    promptTerms: output.promptTerms ?? []
  };
}

function summarizeComposerPayload(payload, prompt, findings) {
  const normalized = normalizeLiveComposerResponse(payload, fallbackTitleFromPrompt(prompt));

  for (const diagnostic of normalized.diagnostics) {
    findings.push(`Composer response repaired at ${diagnostic.path || "root"}: ${diagnostic.message}`);
  }

  return summarizeLiveComposerOutput(normalized.data, prompt);
}

function summarizeLiveComposerOutput(output, prompt) {
  const text = collectOutputText(output).toLowerCase();

  return {
    components: output.components,
    unsupported: output.unsupported,
    tokens: summarizeTokenEvidence(output),
    accessibility: [
      ...(fieldsHaveVisibleLabels(output.screen.fields) ? ["visible labels"] : []),
      ...(screenHasStatusText(output.screen) ? ["status text"] : []),
      ...(tableHasStructure(output.screen.table) ? ["table structure"] : [])
    ],
    renderChecks: [
      ...(screenHasActionLabels(output.screen) ? ["action labels"] : []),
      ...(unsupportedNotRendered(output) ? ["unsupported not rendered"] : [])
    ],
    promptTerms: prompt
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((term) => term.length > 3 && text.includes(term))
  };
}

function summarizeTokenEvidence(output) {
  const tokens = new Set();
  const hasFields = output.screen.fields.length > 0;
  const hasTable = output.screen.table.columns.length > 0 || output.screen.table.rows.length > 0;
  const hasMetrics = output.screen.metrics.length > 0;
  const hasActions = Boolean(output.screen.primaryAction || output.screen.secondaryAction);

  if (output.components.includes("Card") || hasMetrics) {
    tokens.add("surface");
  }
  if (output.components.includes("Card") || hasTable || hasFields) {
    tokens.add("border");
  }
  if (output.components.length > 0 || hasFields || hasTable || hasMetrics) {
    tokens.add("spacing");
  }
  if (hasFields || hasActions || rowActionCells(output.screen).length > 0) {
    tokens.add("focus");
  }
  if (screenHasStatusText(output.screen)) {
    tokens.add("status");
  }

  return Array.from(tokens);
}

function fieldsHaveVisibleLabels(fields) {
  return fields.length === 0 || fields.every((field) => Boolean(field.label));
}

function screenHasStatusText(screen) {
  if (screen.alert.title || screen.alert.body) {
    return true;
  }

  return screen.table.rows.some((row) =>
    row.some((cell) => Boolean(cell && typeof cell === "object" && "text" in cell && cell.text))
  );
}

function tableHasStructure(table) {
  return table.columns.length > 0 && table.rows.every((row) => row.length > 0);
}

function screenHasActionLabels(screen) {
  const namedScreenActions = Boolean(screen.primaryAction && screen.secondaryAction);
  const namedRowActions = rowActionCells(screen).every((cell) => Boolean(cell.action));
  return namedScreenActions && namedRowActions;
}

function unsupportedNotRendered(output) {
  const rendered = new Set(output.components.map((component) => component.toLowerCase()));
  return output.unsupported.every((component) => !rendered.has(component.toLowerCase()));
}

function rowActionCells(screen) {
  return screen.table.rows
    .flat()
    .filter((cell) => Boolean(cell && typeof cell === "object" && "action" in cell));
}

function collectOutputText(output) {
  return [
    output.title,
    output.summary,
    output.screen.alert.title,
    output.screen.alert.body,
    ...output.screen.metrics.flatMap((metric) => [metric.label, metric.value]),
    ...output.screen.fields.flatMap((field) => [field.label, field.placeholder, ...(field.options ?? [])]),
    ...output.screen.table.columns,
    ...output.screen.table.rows.flatMap((row) => row.map(cellText)),
    output.screen.primaryAction,
    output.screen.secondaryAction
  ].filter(Boolean).join(" ");
}

function cellText(cell) {
  if (cell == null) {
    return "";
  }

  if (typeof cell !== "object") {
    return String(cell);
  }

  if ("action" in cell) {
    return cell.action;
  }

  if ("text" in cell) {
    return cell.text;
  }

  return JSON.stringify(cell);
}

function fallbackTitleFromPrompt(prompt) {
  const words = prompt
    .replace(/^(generate|create|build|design|make)\s+(an?\s+)?/i, "")
    .replace(/\s+using\s+.*$/i, "")
    .replace(/\s+with\s+approved.*$/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 5);

  const title = words.length ? words.join(" ") : "Generated screen";
  return title
    .replace(/[^\w\s-]/g, "")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function emptyOutput() {
  return {
    components: [],
    tokens: [],
    accessibility: [],
    renderChecks: [],
    promptTerms: [],
    unsupported: []
  };
}
