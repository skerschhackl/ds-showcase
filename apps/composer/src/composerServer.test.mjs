import { EventEmitter } from "node:events";
import { describe, expect, it } from "vitest";
import { createComposerConfig, handleComposerRequest } from "./composerServer.mjs";

const context = {
  schema: {},
  contracts: "Button: use for actions.\nTable: use for comparable rows."
};

describe("composer server boundary", () => {
  it("reports health with CORS metadata", async () => {
    const response = await dispatch({ method: "GET", url: "/health" });

    expect(response.status).toBe(200);
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("http://127.0.0.1:5173");
    expect(response.body).toMatchObject({
      ok: true,
      provider: "openai",
      model: "gpt-5.4-mini",
      mode: "missing-api-key"
    });
  });

  it("handles preflight and unknown routes", async () => {
    const preflight = await dispatch({ method: "OPTIONS", url: "/generate" });
    const missing = await dispatch({ method: "GET", url: "/missing" });

    expect(preflight.status).toBe(204);
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ error: "Not found" });
  });

  it("rejects invalid JSON and invalid generate requests before provider calls", async () => {
    let providerCalls = 0;
    const fetchJson = async () => {
      providerCalls += 1;
      return okModelResponse(validModelOutput());
    };

    const invalidJson = await dispatch({ body: "{" , env: { OPENAI_API_KEY: "test-key" }, fetchJson });
    const invalidPrompt = await dispatch({ body: {}, env: { OPENAI_API_KEY: "test-key" }, fetchJson });

    expect(invalidJson.status).toBe(400);
    expect(invalidJson.body).toEqual({ error: "Request body must be valid JSON" });
    expect(invalidPrompt.status).toBe(400);
    expect(invalidPrompt.body.error).toBe("Invalid generate request");
    expect(invalidPrompt.body.diagnostics.length).toBeGreaterThan(0);
    expect(providerCalls).toBe(0);
  });

  it("enforces request body size and body timeout limits", async () => {
    const oversized = await dispatch({
      body: { prompt: "This body is too large" },
      env: {
        OPENAI_API_KEY: "test-key",
        MAX_REQUEST_BODY_BYTES: "16"
      }
    });
    const timedOut = await dispatch({
      body: undefined,
      endBody: false,
      env: {
        OPENAI_API_KEY: "test-key",
        REQUEST_BODY_TIMEOUT_MS: "1"
      }
    });

    expect(oversized.status).toBe(413);
    expect(oversized.body.error).toContain("16 bytes or less");
    expect(timedOut.status).toBe(408);
    expect(timedOut.body).toEqual({ error: "Request body timed out" });
  });

  it("returns a controlled error when OpenAI mode has no API key", async () => {
    const response = await dispatch({ body: { prompt: "Build a billing screen" } });

    expect(response.status).toBe(500);
    expect(response.body.error).toContain("OPENAI_API_KEY is not set");
  });

  it("maps provider timeout and malformed JSON to boundary errors", async () => {
    const timeout = await dispatch({
      body: { prompt: "Build a billing screen" },
      env: { OPENAI_API_KEY: "test-key" },
      fetchJson: async () => ({ timedOut: true })
    });
    const malformed = await dispatch({
      body: { prompt: "Build a billing screen" },
      env: { OPENAI_API_KEY: "test-key" },
      fetchJson: async () => okModelResponse("not json")
    });

    expect(timeout.status).toBe(504);
    expect(timeout.body).toEqual({ error: "OpenAI request timed out" });
    expect(malformed.status).toBe(502);
    expect(malformed.body.error).toBe("OpenAI response was not valid JSON");
  });

  it("normalizes partial model output and surfaces diagnostics", async () => {
    const response = await dispatch({
      body: { prompt: "Create a team management screen with invite modal" },
      env: { OPENAI_API_KEY: "test-key" },
      fetchJson: async () => okModelResponse({
        title: "Team Modal",
        components: ["Alert", "Modal", "Table"],
        screen: {
          alert: { tone: "warning", title: "Modal requested" },
          table: {}
        }
      })
    });

    expect(response.status).toBe(200);
    expect(response.body.components).toEqual(["Alert", "Table"]);
    expect(response.body.unsupported).toEqual(["Modal"]);
    expect(response.body.screen.table.columns).toEqual(["Item", "Status", "Action"]);
    expect(response.body.diagnostics.length).toBeGreaterThan(0);
  });

  it("preserves explicit prompt headings over provider titles", async () => {
    const response = await dispatch({
      body: {
        prompt: "Generate a billing settings page with a heading at the top saying 'my bills' and a button to download all entries"
      },
      env: { OPENAI_API_KEY: "test-key" },
      fetchJson: async () => okModelResponse(validModelOutput())
    });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("my bills");
  });

  it("clamps requested components before they enter the system prompt", async () => {
    let providerBody;
    const response = await dispatch({
      body: {
        prompt: "Build a billing table with chart",
        allowedComponents: ["Table", "Chart", "Button", "Table"]
      },
      env: { OPENAI_API_KEY: "test-key" },
      fetchJson: async (_url, options) => {
        providerBody = JSON.parse(options.body);
        return okModelResponse(validModelOutput());
      }
    });

    expect(response.status).toBe(200);
    expect(providerBody.input[0].content).toContain("Allowed components: Table, Button.");
    expect(providerBody.input[0].content).not.toContain("Chart");
  });

  it("instructs live providers to preserve exact headings and requested button labels", async () => {
    let providerBody;
    const response = await dispatch({
      body: {
        prompt: "Generate a billing page with a heading saying 'my bills' and a button to download all entries",
        allowedComponents: ["Table", "Button", "Badge", "Card"]
      },
      env: { OPENAI_API_KEY: "test-key" },
      fetchJson: async (_url, options) => {
        providerBody = JSON.parse(options.body);
        return okModelResponse(validModelOutput());
      }
    });

    expect(response.status).toBe(200);
    expect(providerBody.input[0].content).toContain("set the top-level title to that exact heading text");
    expect(providerBody.input[0].content).toContain("download all entries");
    expect(providerBody.input[0].content).toContain('The only valid table action-cell object shape is { "action": "Label", "variant": "secondary" }');
    expect(providerBody.input[0].content).toContain("do not emit JSX-like Button objects");
    expect(providerBody.input[1].content).toContain("my bills");
  });

  it("supports Ollama provider failures through the same boundary", async () => {
    const response = await dispatch({
      body: { prompt: "Build a billing screen" },
      env: { AI_PROVIDER: "ollama" },
      fetchJson: async () => ({ error: "ECONNREFUSED" })
    });

    expect(response.status).toBe(502);
    expect(response.body.error).toContain("Could not reach Ollama");
  });
});

async function dispatch({
  method = "POST",
  url = "/generate",
  body,
  env = {},
  fetchJson = async () => okModelResponse(validModelOutput()),
  endBody = true
} = {}) {
  const request = new MockRequest(method, url);
  const response = new MockResponse();
  const done = response.done;

  const handled = handleComposerRequest(request, response, {
    composerContext: context,
    config: createComposerConfig(env),
    fetchJson
  });

  if (body !== undefined) {
    const rawBody = typeof body === "string" ? body : JSON.stringify(body);
    request.emit("data", Buffer.from(rawBody));
  }

  if (endBody) {
    request.emit("end");
  }

  const result = await done;
  await handled;
  return result;
}

class MockRequest extends EventEmitter {
  constructor(method, url) {
    super();
    this.method = method;
    this.url = url;
    this.destroyed = false;
  }

  destroy() {
    this.destroyed = true;
  }
}

class MockResponse {
  constructor() {
    this.headers = {};
    this.status = 200;
    this.done = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  writeHead(status, headers = {}) {
    this.status = status;
    Object.assign(this.headers, headers);
  }

  end(body = "") {
    this.resolve({
      status: this.status,
      headers: this.headers,
      rawBody: body,
      body: body ? JSON.parse(body) : undefined
    });
  }
}

function okModelResponse(output) {
  return {
    response: { ok: true, status: 200 },
    body: { output_text: typeof output === "string" ? output : JSON.stringify(output) }
  };
}

function validModelOutput() {
  return {
    title: "Billing Settings",
    summary: "Manage billing settings.",
    components: ["Alert", "Card", "Input", "Select", "Table", "Badge", "Button", "Textarea"],
    unsupported: [],
    screen: {
      alert: { tone: "success", title: "Ready", body: "Billing controls are ready." },
      metrics: [{ label: "Plan", value: "Growth" }],
      fields: [{ label: "Billing email", kind: "input" }],
      table: {
        columns: ["Invoice", "Status"],
        rows: [["INV-1", { text: "Paid", tone: "success" }]]
      },
      primaryAction: "Save billing",
      secondaryAction: "Export invoices"
    }
  };
}
