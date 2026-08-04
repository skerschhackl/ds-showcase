# Skill: Design System Compliance Review

Use this workflow to review AI-generated UI before it ships.

## Source Rules

Read these specs first:

1. `specs/README.md`
2. `specs/foundation/principles.md`
3. `specs/foundation/accessibility.md`
4. `specs/foundation/typography.md`
5. `specs/foundation/spacing.md`
6. `specs/tokens/README.md`
7. Relevant files in `specs/atoms`, `specs/molecules`, and `specs/organisms`

TypeScript component files define the prop API. Component-local `*.ai.md` files define AI-facing usage and generation rules.

For contract drift or AI-readiness reviews, also inspect:

- `docs/component-governance.md`
- `system/components/src/*/*.tsx`
- `system/components/src/*/*.ai.md`
- `packages/ai-contracts/src/approved-components.ts`
- `packages/ai-contracts/src/live-composer-response.ts`
- `ai/evals/*`
- `system/tokens/src/tokens.json`

## Workflow

1. List every visible component and map it to an approved component.
2. Check token usage against `specs/tokens`.
3. Check typography and spacing against `specs/foundation`.
4. Check component usage against the relevant atom, molecule, or organism spec.
5. Flag any custom visual pattern that bypasses the component library.
6. Check that important rules are enforced by types, schemas, tests, or evals where practical.
7. Return `pass`, `watch`, or `fail` with the smallest useful fix.

## Contract Review Heuristics

- Prefer types, schemas, tests, and evals over prose-only rules.
- Do not duplicate `*.ai.md` guidance into TypeScript comments.
- Add JSDoc only when a prop name and type hide behavior, accessibility wiring, semantic intent, or constraints.
- Treat unsupported components as intentional product gaps, not components to invent in generated UI.
- Review token names for semantic clarity: primitives may describe values, but semantic and component tokens should describe purpose.
- Define composition contracts before adding complex components such as modals, drawers, dropdowns, toasts, or date pickers.
