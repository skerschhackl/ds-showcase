import { EventEmitter } from "node:events";
import { describe, expect, it } from "vitest";
import { createComposerConfig, handleComposerRequest } from "./composerServer.mjs";

const context = {
  schema: {},
  contracts: "Button: use for actions.\nTable: use for comparable rows."
};

describe("composer server boundary", () => {
  it("reports health with CORS metadata", async () => {
    const response = await dispatch({ method: "GET", url: "/health", origin: "http://localhost:5173" });

    expect(response.status).toBe(200);
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("http://localhost:5173");
    expect(response.headers.Vary).toBe("Origin");
    expect(response.body).toMatchObject({
      ok: true,
      provider: "openai",
      model: "gpt-5.4-mini",
      mode: "missing-api-key"
    });
  });

  it("allows both localhost and 127.0.0.1 showcase origins by default", async () => {
    const localhost = await dispatch({ method: "OPTIONS", url: "/generate", origin: "http://localhost:5173" });
    const loopback = await dispatch({ method: "OPTIONS", url: "/generate", origin: "http://127.0.0.1:5173" });

    expect(localhost.headers["Access-Control-Allow-Origin"]).toBe("http://localhost:5173");
    expect(loopback.headers["Access-Control-Allow-Origin"]).toBe("http://127.0.0.1:5173");
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

  it("rejects partial or old v1 model output with diagnostics", async () => {
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

    expect(response.status).toBe(502);
    expect(response.body.error).toBe("Model response did not match the v2 page schema");
    expect(response.body.diagnostics.length).toBeGreaterThan(0);
    expect(response.body.output.screen).toBeDefined();
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
    expect(providerBody.input[0].content).toContain("Allowed components:");
    expect(providerBody.input[0].content).not.toContain("Chart");
    expect(providerBody.input[0].content).not.toContain("# Alert");
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
    expect(providerBody.input[0].content).toContain("section actions");
    expect(providerBody.input[0].content).toContain("Do not put section types");
    expect(providerBody.input[0].content).toContain('The only valid table action-cell object shape is { "action": "Label", "variant": "secondary" }');
    expect(providerBody.input[0].content).toContain("do not emit JSX-like Button objects");
    expect(providerBody.input[0].content).not.toContain("Button object in the relevant table row");
    expect(providerBody.input[1].content).toContain("my bills");
    expect(providerBody.input[1].content).toContain("download all entries");
  });

  it("accepts renderable page output when component evidence contains section type names", async () => {
    const response = await dispatch({
      body: { prompt: "Generate a catalog landing page with search and featured items" },
      env: { OPENAI_API_KEY: "test-key" },
      fetchJson: async () => okModelResponse({
        title: "Catalog Landing Page",
        summary: "A catalog experience with product listings and search.",
        components: ["Card", "Input", "Button", "cardGrid", "cta"],
        unsupported: [],
        page: {
          sections: [
            {
              type: "hero",
              title: "Explore the catalog",
              body: "Browse featured items and find the right product quickly.",
              actions: []
            },
            {
              type: "form",
              fields: [{ label: "Search", kind: "input" }],
              actions: [{ label: "Search", variant: "primary" }]
            },
            {
              type: "cardGrid",
              title: "Featured items",
              cards: [
                {
                  title: "Starter bundle",
                  body: "A curated option for new customers.",
                  badge: { text: "Featured", tone: "primary" },
                  action: { label: "View details", variant: "secondary" }
                }
              ]
            },
            {
              type: "cta",
              title: "Browse all items",
              body: "",
              actions: [{ label: "Open catalog", variant: "primary" }]
            }
          ]
        }
      })
    });

    expect(response.status).toBe(200);
    expect(response.body.components).toEqual(["Card", "Input", "Button"]);
    expect(response.body.page.sections[1].type).toBe("form");
    expect(response.body.page.sections[1].title).toBeUndefined();
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
  endBody = true,
  origin
} = {}) {
  const request = new MockRequest(method, url, origin);
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
  constructor(method, url, origin) {
    super();
    this.method = method;
    this.url = url;
    this.headers = origin ? { origin } : {};
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
    components: ["Alert", "Card", "Input", "Select", "Table", "Badge", "Button"],
    unsupported: [],
    page: {
      sections: [
        {
          type: "pageHeader",
          title: "Billing Settings",
          body: "Manage billing settings.",
          actions: [{ label: "Save billing", variant: "primary" }]
        },
        {
          type: "form",
          title: "Billing contact",
          fields: [{ label: "Billing email", kind: "input" }],
          actions: [{ label: "Save billing", variant: "primary" }]
        },
        {
          type: "table",
          title: "Invoices",
          columns: ["Invoice", "Status"],
          rows: [["INV-1", { text: "Paid", tone: "success" }]]
        },
        {
          type: "alert",
          tone: "success",
          title: "Ready",
          body: "Billing controls are ready."
        }
      ]
    }
  };
}
