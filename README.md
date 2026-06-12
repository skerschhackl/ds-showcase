# AI-Enabled Design System Showcase

An AI-enabled design system showcase for generating, reviewing, and governing product UI with shared components, tokens, prompts, skills, and evals.

The design system is not just a component library. It is a governed interface language that both humans and AI agents can use.

## What Is Included

- `apps/showcase`: a React + Vite portfolio app with a deterministic AI UI generation demo, component overview, and color token palette display.
- `system/components`: reusable React components used by every generated screen.
- `system/fonts`: self-hosted design system fonts and font-face CSS.
- `system/storybook`: Storybook catalog for design-system components and foundations.
- `system/tokens`: design tokens as JSON and CSS custom properties.
- `packages/ai-contracts`: shared runtime AI contracts for request validation, model response validation, and generated provider JSON Schema.
- `ai/prompts`: reusable prompt templates for design-system-aware AI output.
- `ai/skills`: structured AI workflows for review, accessibility, and screen planning.
- `ai/evals`: rubrics and sample cases for checking generated UI.
- `specs`: AI-readable design system specs organized as foundation, tokens, atoms, molecules, and organisms.
- `docs`: human-facing governance, accessibility, and usage guidance.

## Run Locally

```bash
npm install
npm run dev
```

Then open the local Vite URL.

## Build

```bash
npm run build
npm run typecheck
npm run eval
```

## Storybook

```bash
npm run storybook
npm run build:storybook
```

Storybook is owned by the design system package at `system/storybook`; component stories remain colocated in `system/components/src`.

## Live Composer

The showcase works without secrets by using the local deterministic composer. To connect a live AI composer, set:

```bash
VITE_AI_COMPOSER_URL=http://localhost:8787/generate npm run dev
```

Start the local composer in a separate terminal:

```bash
OPENAI_API_KEY=sk-... npm run dev:composer
```

Then start the showcase:

```bash
VITE_AI_COMPOSER_URL=http://localhost:8787/generate npm run dev:showcase
```

The endpoint should accept:

```json
{
  "prompt": "Build a team management screen",
  "allowedComponents": ["Alert", "Badge", "Button", "Card", "Input", "Select", "Table", "Tabs", "Textarea"]
}
```

And return the shape documented in `ai/live-composer.schema.json`.

`ai/live-composer.schema.json` is generated from the Zod contract in `packages/ai-contracts`. Regenerate it with:

```bash
npm --workspace @ds/ai-contracts run build:json-schema
```

The composer server lives in `apps/composer`. It reads the component `*.ai.md` contracts and asks the model to return a governed screen plan using only approved components. If the server is not running, the showcase falls back to the local deterministic composer.

### Free Local AI With Ollama

Install Ollama, then pull a local model:

```bash
ollama pull qwen2.5:7b
```

Start the composer with the Ollama provider:

```bash
AI_PROVIDER=ollama OLLAMA_MODEL=qwen2.5:7b npm run dev:composer
```

Start the showcase in another terminal:

```bash
VITE_AI_COMPOSER_URL=http://localhost:8787/generate npm run dev:showcase
```

The composer will call Ollama at `http://127.0.0.1:11434/api/generate`. You can override that with `OLLAMA_URL`.

### OpenAI Provider

To use OpenAI instead:

```bash
AI_PROVIDER=openai OPENAI_API_KEY=sk-... npm run dev:composer
```

### Composer Limits

The composer validates `/generate` request bodies and protects the model boundary with size and timeout limits:

```bash
MAX_REQUEST_BODY_BYTES=65536
REQUEST_BODY_TIMEOUT_MS=5000
MODEL_REQUEST_TIMEOUT_MS=45000
```

Requests that exceed the body limit return `413`. Slow request bodies return `408`. Slow model provider calls return `504`.

## AI Contracts And Evals

Start with `specs/README.md` when asking an AI agent to use the design system. It describes the reading order, token rules, typography and spacing guidance, component hierarchy, and organism-level compositions.

Each approved component has a `*.ai.md` contract in `system/components/src`. These files define when an AI composer should use the component, which props are safe, and what governance rules apply.

Runtime AI request and response shape validation lives in `packages/ai-contracts`.

Run `npm run eval` to check sample AI outputs against the rubric in `ai/evals`.

By default, evals use deterministic fixture outputs from `ai/evals/cases.json`. To exercise real composer outputs, run the composer first and pass its endpoint:

```bash
COMPOSER_EVAL_URL=http://127.0.0.1:8787/generate npm run eval
```

Live evals call `/generate`, validate and normalize the response with `@ds/ai-contracts`, then score the generated component choices and unsupported-component handling.

## Future Work

- Add screenshot or visual-regression checks for generated scenarios.
- Expand eval fixtures with model outputs from real AI runs.
