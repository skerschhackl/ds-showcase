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

Component-local `*.ai.md` files are the source of truth for component props and component-specific rules.

## Workflow

1. List every visible component and map it to an approved component.
2. Check token usage against `specs/tokens`.
3. Check typography and spacing against `specs/foundation`.
4. Check component usage against the relevant atom, molecule, or organism spec.
5. Flag any custom visual pattern that bypasses the component library.
6. Return `pass`, `watch`, or `fail` with the smallest useful fix.
