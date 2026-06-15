# AI Usage Guide

This repo separates AI guidance into three layers:

- `specs/`: AI-readable design system rules.
- `ai/skills`: reusable AI workflows.
- `ai/evals`: checks that validate generated output and documentation links.
- `packages/ai-contracts`: shared runtime AI contracts for validation and generated provider JSON Schema.

Start with `specs/README.md` when asking an AI agent to use the design system. Then use the relevant skill file for the task.

## Common Tasks

- Generate a screen specification: `ai/skills/screen-specification.md`
- Review design system compliance: `ai/skills/compliance-review.md`
- Check accessibility risk: `ai/skills/accessibility-check.md`
- Validate live composer output shape: `ai/live-composer.schema.json`
- Update runtime AI contracts: `packages/ai-contracts/src/generate-request.ts`, `packages/ai-contracts/src/live-composer-response.ts`, or `packages/ai-contracts/src/normalize.ts`
- Run evals: `npm run eval`
- Run live composer evals: `COMPOSER_EVAL_URL=http://127.0.0.1:8787/generate npm run eval`
- Run tests and link integrity checks: `npm run test`
- Run composer boundary tests: `npm --workspace @ds/composer run test`

## Source Of Truth

- Implementation: `system/`
- Runtime AI contract authority: `packages/ai-contracts`
- AI-readable rules: `specs/`
- AI workflows and evals: `ai/`
- Human explanation and process: `docs/`

Generated UI is not accepted because it looks plausible. It is accepted when it follows the component model, token system, accessibility requirements, and compliance workflow.

For generated form fields, validation states must be visible and programmatic: use component `error` props so `aria-invalid` is set, error copy is connected, and the control uses the approved danger-border treatment.

## Eval And Composer Testing Notes

AI evals should inspect structured screen plans, not only declarations about those plans. A passing eval should demonstrate that approved components were chosen, unsupported components were handled as gaps, visible labels and status text are present, action labels are explicit, token evidence can be inferred from rendered primitives, and prompt-specific terms survived into the generated UI plan.

Composer server tests should stay deterministic and offline. Use fake provider responses at the HTTP boundary to cover invalid requests, body limits, missing provider configuration, provider timeouts, malformed model output, normalized partial output, unsupported component handling, and `allowedComponents` clamping before prompt construction.

Composer and eval logic should distinguish row-scoped actions from page-level actions. Requests such as "download per member" or "approve each request" belong in table action cells with an `Actions` column. Requests such as "export all data shown" or "download all entries" belong in page-level `primaryAction` or `secondaryAction`. If a prompt asks for both, generated output should render both; an unrendered row action should not suppress a valid page-level action.

## Eval Expansion Plan

- Add long-form field cases that require `Textarea` for prompts, notes, descriptions, comments, and review feedback.
- Add adversarial cases that request raw HTML, JSX, CSS, unsupported components, or instructions to ignore the design system.
- Add malformed-output cases that verify normalization diagnostics are surfaced instead of silently hiding repairs.
- Add action-copy cases that reject vague labels such as `Confirm`, `Submit`, or `Click here` when the prompt requested a specific action.
- Add action-scope cases that require row actions and page-level actions to render independently when both are requested.
- Keep static fixture evals as the default local gate, and run live composer evals with `COMPOSER_EVAL_URL` in an optional CI job.

## Browser Verification Plan

- Use Storybook test-runner or Playwright with axe for component-level accessibility checks.
- Cover focus visibility, keyboard tab behavior, field errors, table captions, loading states, and reduced-motion behavior.
- Add showcase smoke tests for generating a screen, switching component gallery tabs, rendering unsupported-component warnings, and preserving explicit prompt headings.
- Add viewport checks for mobile, tablet, and desktop generated screens.
