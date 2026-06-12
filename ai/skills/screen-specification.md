# Skill: Rough Idea to Screen Specification

Turn a product idea into a governed screen specification.

## Source Rules

Read these specs first:

1. `specs/README.md`
2. `specs/foundation/principles.md`
3. `specs/foundation/typography.md`
4. `specs/foundation/spacing.md`
5. `specs/tokens/README.md`
6. Relevant files in `specs/atoms`, `specs/molecules`, and `specs/organisms`

Use component-local `*.ai.md` files to confirm exact props and usage constraints.

When changing approved visual treatments, update the component CSS, token contract, specs, and tests together. Do not introduce raw color, shadow, duration, or motion values where sanctioned tokens already exist.

## Steps

1. Identify the primary user and the task they need to complete.
2. Choose the smallest set of approved components that can support the task.
3. Define the empty, loading, success, warning, and error states.
4. Write concise UI copy.
5. Add compliance criteria that an evaluator can check.
