# Skill: Accessibility Risk Check

Review generated UI for common accessibility risks.

## Source Rules

Read `specs/foundation/accessibility.md` first. Treat that file as the source of truth for accessibility requirements.

Also reference component-specific contracts when relevant:

- `system/components/src/Input/Input.ai.md`
- `system/components/src/Select/Select.ai.md`
- `system/components/src/Button/Button.ai.md`
- `system/components/src/Table/Table.ai.md`
- `system/components/src/Alert/Alert.ai.md`
- `system/components/src/Badge/Badge.ai.md`

## Workflow

1. Identify the generated components and interaction states.
2. Check them against `specs/foundation/accessibility.md`.
3. For each issue, cite the affected component or screen region.
4. Prioritize findings by user impact.
5. Return the smallest useful fix.

Return prioritized findings with component references.
