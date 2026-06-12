# AI-Enabled Design System Showcase Plan

## Project Idea

Build a portfolio-grade design system showcase that demonstrates how a design system can serve both humans and AI agents.

The core idea:

> A design system is a shared interface language for people, products, and AI.

The repo should show not only reusable UI components, but also tokens, component usage contracts, prompts, skills, runtime schemas, and evals that help AI generate consistent product interfaces using approved design system patterns.

## Current Stack

- React
- TypeScript
- Vite
- npm workspaces
- Storybook with React Vite, docs, and accessibility addon
- Zod-backed AI/composer contracts
- Design tokens as JSON and CSS custom properties
- Vitest for contract, component, token, and eval checks

Keep the tooling purposeful. The memorable part of the project is the AI-enabled design system concept: governed components, trustworthy tokens, documented AI usage, and evals that prove generated UI follows the system.

## Current Repo Structure

```txt
ds-showcase/
├── apps/
│   ├── composer/
│   └── showcase/
├── system/
│   ├── components/
│   ├── fonts/
│   ├── storybook/
│   │   └── .storybook/
│   └── tokens/
├── packages/
│   └── ai-contracts/
├── specs/
│   ├── foundation/
│   ├── tokens/
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── ai/
│   ├── prompts/
│   ├── skills/
│   └── evals/
├── docs/
└── package.json
```

## Folder Purpose

### apps/showcase

The polished portfolio-facing app.

This is the main experience someone should open first. It shows the design system in context and includes the AI demo:

```txt
Prompt box -> Generate UI -> governed interface preview -> compliance review
```

The showcase supports a local deterministic composer and can render live composer responses when a composer endpoint is configured.

### apps/composer

The optional live composer server.

It validates request bodies, constrains allowed components, calls a configured model provider or local model path, normalizes responses, and returns data shaped by the shared AI contracts.

### system/components

Reusable React design system components.

Current component set:

- Alert
- Badge
- Button
- Card
- Field
- Input
- Select
- Spinner
- Table
- Tabs / TabPanel
- Textarea

Each component should keep its implementation, tests, Storybook stories, and AI usage contract close together where practical:

```txt
system/components/src/Button/
├── Button.tsx
├── Button.test.tsx
├── Button.stories.tsx
├── Button.ai.md
└── index.ts
```

The goal is not a huge library. The goal is a credible, accessible set of primitives that can create believable generated product screens.

### system/tokens

The source of visual truth.

Includes tokens for:

- color
- typography
- spacing
- radius
- shadows
- focus states

Tokens are authored as JSON and exported as CSS custom properties. Token quality gates should catch contrast issues, CSS drift, and semantic usage regressions.

### packages/ai-contracts

Shared runtime contracts between the composer, model output, and showcase renderer.

This package owns Zod schemas, inferred TypeScript types, normalization helpers, approved component enums, and generated JSON Schema for structured model output.

Keep it separate from `system/` because it is integration glue, not the design system itself.

### specs

AI-readable design system guidance.

Use `specs/` when an AI agent needs operational rules:

- `foundation/`: principles, accessibility, typography, spacing
- `tokens/`: token usage rules
- `atoms/`, `molecules/`, `organisms/`: component and pattern guidance

Specs should reference colocated component contracts instead of duplicating every detail.

### ai/prompts

Reusable prompts that instruct AI systems how to use the design system.

Examples:

- Generate a settings page using approved components
- Create an onboarding flow
- Rewrite UI copy using the design system voice
- Convert a product brief into a component plan

### ai/skills

Structured AI workflows and review procedures.

Examples:

- Review generated UI for design system compliance
- Check accessibility risks
- Convert a rough product idea into a screen specification
- Map product requirements to approved components

Skills should point to the source specs/contracts rather than repeat large rule blocks.

### ai/evals

Rubrics, static cases, deterministic composer runs, and optional live composer evals.

Eval areas:

- approved component usage
- unsupported component flagging
- token compliance
- accessibility
- table/status/action clarity
- vague copy avoidance
- design system drift

This makes the project feel serious: it does not just prompt AI, it evaluates whether the output follows the system.

### docs

Human-facing project documentation.

Current docs should explain:

- project principles
- component governance
- AI usage flow
- accessibility approach
- how specs, skills, component contracts, and runtime contracts relate

### system/storybook

Storybook configuration and package ownership for the design system catalog.

Stories are colocated next to components in `system/components/src/*/*.stories.tsx`. Each component should expose a control-friendly `Playground` story plus state stories for meaningful variants such as disabled, loading, invalid, long text, captions, keyboard behavior, and AI usage notes.

## Current Scope Status

### Foundation

Done:

- npm workspaces
- React + TypeScript
- Vite showcase app
- local `@ds/components`, `@ds/tokens`, and `@ds/ai-contracts`
- root README and project docs

### Core Design System

Done:

- tokenized core components
- required labels for form controls
- shared `Field` wrapper for labels, hints, errors, and ARIA wiring
- tab and tabpanel relationships
- table captions and accessible labels
- button loading semantics
- reduced-motion CSS
- status/badge contrast checks
- Storybook catalog with colocated stories and controls

### Showcase App

Done:

- generator page
- components page
- deterministic prompt-to-screen composition
- optional live composer rendering
- loading states and generated-screen skeleton
- compliance evidence panel
- unsupported component detection

### AI Materials

Done:

- prompt files
- skill files
- specs structure
- colocated component `.ai.md` contracts
- Zod runtime contracts
- generated JSON Schema
- static and optional live eval paths

### Verification

Current checks:

- `npm run test`
- `npm run typecheck`
- `npm run build`
- `npm run build:storybook`
- `npm run eval`

### Generated Artifact Policy

Generated build outputs should remain local artifacts unless there is a deliberate publishing reason to commit them.

Current `.gitignore` already excludes:

- `dist`
- `apps/*/dist`
- `storybook-static`

That means `packages/ai-contracts/dist` and `system/storybook/storybook-static` may appear in local file listings after builds, but they should not be source-of-truth files. If this repo is later initialized or audited with Git, confirm generated artifacts are not tracked. If a static Storybook or showcase build needs to be published, prefer CI-generated deployment artifacts instead of committing the build folder.

Proposal:

1. Keep generated JS declarations in `packages/ai-contracts/dist` ignored locally and rebuild them before consumers run.
2. Keep `ai/live-composer.schema.json` committed because it is a small provider-facing artifact and tests verify it matches Zod.
3. Keep `system/storybook/storybook-static` ignored and publish Storybook from CI when needed.
4. Add a lightweight artifact policy check later if this becomes a Git repo, such as `git check-ignore` or a CI guard against tracked `dist` and `storybook-static` files.

## Next Priorities

### Visual And Interaction Testing

Add browser-level coverage for:

- focus states
- keyboard Tabs behavior in a real browser
- responsive generated screens
- Storybook/component snapshots
- generated-screen snapshots
- automated accessibility checks with axe through Storybook test-runner or Playwright
- viewport coverage for mobile, tablet, and desktop generated screens

Use Playwright or Storybook test-runner once the dependency choice is approved.

Proposed path:

1. Add Storybook test-runner with the accessibility addon enabled for component stories.
2. Add Playwright smoke tests for the showcase generator, components page, keyboard focus order, and generated-screen rendering.
3. Add screenshot snapshots for representative generated screens and component stories.
4. Run browser-level checks in CI after unit tests, with a smaller smoke subset available locally.

### Token Quality Gates

Strengthen automated checks for:

- all status/background text contrast pairs
- semantic token usage in component CSS
- generated CSS drift from token JSON
- forbidden raw color usage outside token source files

### Composer Evals

Keep static fixtures, but add stronger deterministic and live evals that check:

- approved components only
- required labels
- table captions or accessible labels when needed
- explicit row action labels
- row-scoped actions and page-level actions rendered independently when both are requested
- unsupported component flags
- no vague destructive copy like `Confirm`
- loading labels for async actions
- textarea fields for long-form prompts, notes, descriptions, comments, and feedback
- adversarial prompts that request raw HTML, JSX, CSS, unsupported components, or vague destructive actions
- malformed model output that needs normalization and should surface diagnostics

Proposed eval expansion:

1. Add fixture cases for long-form review notes, textarea prompts, invalid textarea rows, and field errors.
2. Add unsupported-pattern cases for Dialog, Toast, Tooltip, Chart, DatePicker, and FileUpload requests.
3. Add prompt-injection cases that ask the model to ignore component rules or emit raw code.
4. Add copy-quality cases that reject vague actions such as `Confirm`, `Submit`, or `Click here` when a specific action is requested.
5. Add action-scope cases such as "download per member" plus "export all data shown" to verify table action cells and page-level actions can coexist.
6. Add live composer snapshots behind `COMPOSER_EVAL_URL`, keeping deterministic fixture evals as the default local gate.

### Component Roadmap

Add only primitives that generated screens are currently pretending to have or repeatedly need:

- FormMessage, if Field needs richer message composition
- InlineNotification or Toast
- Dialog, or explicit unsupported-dialog handling if Dialog is intentionally out of scope

Each new component should include implementation, tests, Storybook stories, specs, and `.ai.md` guidance.

### AI Guide Change Process

When implementation or Storybook verification teaches a new reusable rule:

1. Bring the learning back for review.
2. After agreement, update the relevant `.ai.md`, `specs/`, and eval cases.
3. Add or update tests that enforce the rule.

Do not silently turn one-off Storybook examples into AI generation rules.

## Root Script Direction

Use simple npm workspace scripts:

```json
{
  "scripts": {
    "dev": "npm --workspace @ds/showcase run dev",
    "dev:composer": "npm --workspace @ds/composer run dev",
    "storybook": "npm --workspace @ds/storybook run dev",
    "build:storybook": "npm --workspace @ds/storybook run build",
    "prepare:contracts": "npm --workspace @ds/ai-contracts run build",
    "build": "npm run prepare:contracts && npm --workspace @ds/composer run build && npm --workspace @ds/showcase run build && npm --workspace @ds/components run build && npm --workspace @ds/fonts run build && npm --workspace @ds/storybook run build && npm --workspace @ds/tokens run build",
    "typecheck": "npm run prepare:contracts && npm --workspace @ds/composer run typecheck && npm --workspace @ds/showcase run typecheck && npm --workspace @ds/ai-contracts run typecheck && npm --workspace @ds/components run typecheck && npm --workspace @ds/fonts run typecheck && npm --workspace @ds/storybook run typecheck && npm --workspace @ds/tokens run typecheck",
    "test": "npm run prepare:contracts && npm --workspace @ds/components run test && npm --workspace @ds/ai-contracts run test && npm --workspace @ds/composer run test && npm --workspace @ds/showcase run test && vitest run ai/evals/spec-integrity.test.mjs",
    "eval": "npm run prepare:contracts && node ai/evals/run-evals.mjs"
  }
}
```

This keeps the repo easy to clone, understand, and run.

### Build Pipeline Cleanup

Root scripts prepare `@ds/ai-contracts` once, then run explicit workspace commands. This avoids repeated `Wrote ai/live-composer.schema.json` output while preserving the contract freshness guarantee.

Current policy:

1. Keep `@ds/ai-contracts` as the only package that writes `dist` and `ai/live-composer.schema.json`.
2. Root `build`, `typecheck`, `lint`, `test`, and `eval` call `prepare:contracts` once.
3. Consumer package `build`, `typecheck`, `lint`, and `test` scripts do not rebuild contracts.
4. Consumer package `dev` scripts still rebuild contracts for local startup convenience.
5. `@ds/ai-contracts` tests fail if `ai/live-composer.schema.json` differs from the Zod-generated schema.

This keeps the safety guarantee while making local command output quieter and more predictable.

## Portfolio Positioning

Suggested README framing:

> An AI-enabled design system showcase for generating, reviewing, and governing product UI with shared components, tokens, prompts, skills, contracts, and evals.

The strongest message:

> The design system is not just a component library. It is a governed interface language that both humans and AI agents can use.
