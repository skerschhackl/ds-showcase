import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  LiveComposerResponseJsonSchema,
  approvedComponentNames,
  normalizeLiveComposerResponse,
  parseGenerateRequest
} from "@ds/ai-contracts";

const currentFile = fileURLToPath(import.meta.url);
const composerRoot = path.resolve(path.dirname(currentFile), "..");
const repoRoot = path.resolve(composerRoot, "..", "..");

export function createComposerConfig(env = process.env) {
  return {
    port: Number(env.PORT ?? 8787),
    host: env.HOST ?? "127.0.0.1",
    provider: env.AI_PROVIDER ?? "openai",
    openAiModel: env.OPENAI_MODEL ?? "gpt-5.4-mini",
    ollamaModel: env.OLLAMA_MODEL ?? "qwen2.5:7b",
    ollamaUrl: env.OLLAMA_URL ?? "http://127.0.0.1:11434",
    maxRequestBodyBytes: Number(env.MAX_REQUEST_BODY_BYTES ?? 64 * 1024),
    requestBodyTimeoutMs: Number(env.REQUEST_BODY_TIMEOUT_MS ?? 5000),
    modelRequestTimeoutMs: Number(env.MODEL_REQUEST_TIMEOUT_MS ?? 45000),
    corsOrigin: env.CORS_ORIGIN ?? "http://127.0.0.1:5173",
    openAiApiKey: env.OPENAI_API_KEY,
    ollamaTemperature: Number(env.OLLAMA_TEMPERATURE ?? 0.2)
  };
}

export async function loadComposerContext() {
  const contracts = await Promise.all(
    approvedComponentNames.map(async (component) => {
      const filePath = path.join(repoRoot, "system", "components", "src", component, `${component}.ai.md`);
      const contents = await fs.readFile(filePath, "utf8");
      return `# ${component}\n${contents}`;
    })
  );

  return {
    schema: LiveComposerResponseJsonSchema,
    contracts: contracts.join("\n\n")
  };
}

export function createComposerServer({
  composerContext,
  env = process.env,
  fetchJson = fetchJsonWithTimeout
}) {
  const config = createComposerConfig(env);

  return http.createServer(async (request, response) => {
    await handleComposerRequest(request, response, { composerContext, config, fetchJson });
  });
}

export async function handleComposerRequest(request, response, { composerContext, config, fetchJson = fetchJsonWithTimeout }) {
  setCorsHeaders(response, config);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      ok: true,
      provider: config.provider,
      model: config.provider === "ollama" ? config.ollamaModel : config.openAiModel,
      mode: getProviderMode(config)
    });
    return;
  }

  if (request.method === "POST" && request.url === "/generate") {
    await handleGenerate(request, response, composerContext, config, fetchJson);
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

async function handleGenerate(request, response, composerContext, config, fetchJson) {
  const body = await readJsonBody(request, config);

  if (!body.ok) {
    sendJson(response, body.status, { error: body.error });
    return;
  }

  const parsedRequest = parseGenerateRequest(body.data);

  if (!parsedRequest.success) {
    sendJson(response, 400, {
      error: "Invalid generate request",
      diagnostics: parsedRequest.error.issues.map(formatZodIssue)
    });
    return;
  }

  const { prompt, allowedComponents: requestedComponents } = parsedRequest.data;

  if (config.provider === "ollama") {
    await generateWithOllama(response, composerContext, config, fetchJson, prompt, requestedComponents);
    return;
  }

  await generateWithOpenAI(response, composerContext, config, fetchJson, prompt, requestedComponents);
}

async function generateWithOpenAI(response, composerContext, config, fetchJson, prompt, requestedComponents) {
  if (!config.openAiApiKey) {
    sendJson(response, 500, {
      error: "OPENAI_API_KEY is not set. The showcase will fall back to the local deterministic composer."
    });
    return;
  }

  const apiResult = await fetchJson("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.openAiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.openAiModel,
      input: [
        {
          role: "system",
          content: buildSystemPrompt(composerContext, requestedComponents)
        },
        {
          role: "user",
          content: prompt
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "design_system_screen",
          schema: composerContext.schema,
          strict: false
        }
      }
    })
  }, config.modelRequestTimeoutMs);

  if (apiResult.timedOut) {
    sendJson(response, 504, { error: "OpenAI request timed out" });
    return;
  }

  if (apiResult.error) {
    sendJson(response, 502, {
      error: "OpenAI request failed",
      details: apiResult.error
    });
    return;
  }

  const { response: apiResponse, body: apiBody } = apiResult;

  if (!apiResponse.ok) {
    sendJson(response, apiResponse.status, {
      error: "OpenAI request failed",
      details: apiBody
    });
    return;
  }

  const outputText = extractOpenAIOutputText(apiBody);
  const parsed = outputText ? parseJsonObject(outputText) : undefined;

  if (!parsed) {
    sendJson(response, 502, {
      error: "OpenAI response was not valid JSON",
      outputText,
      details: apiBody
    });
    return;
  }

  sendModelOutput(response, parsed, prompt);
}

async function generateWithOllama(response, composerContext, config, fetchJson, prompt, requestedComponents) {
  const ollamaPrompt = [
    buildSystemPrompt(composerContext, requestedComponents),
    "Return JSON matching this schema:",
    JSON.stringify(composerContext.schema),
    "User prompt:",
    prompt
  ].join("\n\n");

  try {
    const apiResult = await fetchJson(`${config.ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.ollamaModel,
        prompt: ollamaPrompt,
        stream: false,
        format: "json",
        options: {
          temperature: config.ollamaTemperature
        }
      })
    }, config.modelRequestTimeoutMs);

    if (apiResult.timedOut) {
      sendJson(response, 504, { error: "Ollama request timed out" });
      return;
    }

    if (apiResult.error) {
      sendJson(response, 502, {
        error: "Could not reach Ollama. Make sure Ollama is running and the model is pulled.",
        details: apiResult.error
      });
      return;
    }

    const { response: apiResponse, body: apiBody } = apiResult;

    if (!apiResponse.ok) {
      sendJson(response, apiResponse.status, {
        error: "Ollama request failed",
        details: apiBody
      });
      return;
    }

    const outputText = typeof apiBody.response === "string" ? apiBody.response : "";
    const parsed = parseJsonObject(outputText);

    if (!parsed) {
      sendJson(response, 502, {
        error: "Ollama response was not valid JSON",
        outputText
      });
      return;
    }

    sendModelOutput(response, parsed, prompt);
  } catch (error) {
    sendJson(response, 502, {
      error: "Could not reach Ollama. Make sure Ollama is running and the model is pulled.",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

export function buildSystemPrompt(composerContext, requestedComponents) {
  return [
    "You are an AI design-system composer.",
    "Return one JSON object and no prose.",
    "Do not return JSX, HTML, CSS, markdown, or comments.",
    `Allowed components: ${requestedComponents.join(", ")}.`,
    "If the user asks for a component or pattern outside the allowed set, include it in unsupported and compose the closest approved fallback.",
    "If the user asks for an exact heading or title, set the top-level title to that exact heading text.",
    "If the user asks for a button action such as download all entries, export all entries, delete, remove, approve, archive, or retry, include that exact action label in primaryAction, secondaryAction, or a Button object in the relevant table row.",
    "Use Table for comparable row data. Use action-cell objects inside table rows when the user requests row actions like delete, remove, approve, archive, export, download, or retry. The only valid table action-cell object shape is { \"action\": \"Label\", \"variant\": \"secondary\" }; do not emit JSX-like Button objects, component objects, nested props, or children.",
    "Use Badge objects for status cells. Use Alert for system feedback. Use Input and Select for visible labeled controls. Use Textarea for long-form prompts, notes, descriptions, comments, and review feedback.",
    "Keep title, labels, and actions specific to the user's prompt.",
    "Component contracts:",
    composerContext.contracts
  ].join("\n\n");
}

function sendModelOutput(response, payload, prompt) {
  const normalized = normalizeLiveComposerResponse(payload, fallbackTitleFromPrompt(prompt));
  const explicitHeading = headingFromPrompt(prompt);
  const data = explicitHeading
    ? { ...normalized.data, title: normalizeHeading(explicitHeading) }
    : normalized.data;
  const responsePayload = normalized.diagnostics.length
    ? { ...data, diagnostics: normalized.diagnostics }
    : data;

  sendJson(response, 200, responsePayload);
}

async function readJsonBody(request, config) {
  return new Promise((resolve) => {
    const chunks = [];
    let size = 0;
    let settled = false;

    const finish = (result) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    const timer = setTimeout(() => {
      request.destroy();
      finish({ ok: false, status: 408, error: "Request body timed out" });
    }, config.requestBodyTimeoutMs);

    request.on("data", (chunk) => {
      size += chunk.length;

      if (size > config.maxRequestBodyBytes) {
        request.destroy();
        finish({ ok: false, status: 413, error: `Request body must be ${config.maxRequestBodyBytes} bytes or less` });
        return;
      }

      chunks.push(chunk);
    });

    request.on("end", () => {
      if (!chunks.length) {
        finish({ ok: true, data: {} });
        return;
      }

      try {
        finish({ ok: true, data: JSON.parse(Buffer.concat(chunks).toString("utf8")) });
      } catch {
        finish({ ok: false, status: 400, error: "Request body must be valid JSON" });
      }
    });

    request.on("error", () => {
      finish({ ok: false, status: 400, error: "Could not read request body" });
    });
  });
}

export async function fetchJsonWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    const body = await response.json().catch(() => undefined);
    return { response, body };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { timedOut: true };
    }

    return {
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    clearTimeout(timeout);
  }
}

function extractOpenAIOutputText(apiBody) {
  if (!apiBody || typeof apiBody !== "object") {
    return undefined;
  }

  if (typeof apiBody.output_text === "string") {
    return apiBody.output_text;
  }

  for (const item of apiBody.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return undefined;
}

function parseJsonObject(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      return undefined;
    }

    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return undefined;
    }
  }
}

function fallbackTitleFromPrompt(prompt) {
  const explicitHeading = headingFromPrompt(prompt);

  if (explicitHeading) {
    return normalizeHeading(explicitHeading);
  }

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

function headingFromPrompt(prompt) {
  const match = prompt.match(/heading(?:\s+at\s+the\s+top)?\s+(?:saying|called|titled|named)\s+["']([^"']+)["']/i);
  return match?.[1]?.trim();
}

function normalizeHeading(value) {
  return value
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatZodIssue(issue) {
  return {
    path: issue.path.join("."),
    message: issue.message
  };
}

function getProviderMode(config) {
  if (config.provider === "ollama") {
    return "ollama-local";
  }

  return config.openAiApiKey ? "openai-live" : "missing-api-key";
}

function setCorsHeaders(response, config) {
  response.setHeader("Access-Control-Allow-Origin", config.corsOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}
