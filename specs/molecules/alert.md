# Molecule: Alert

Use `Alert` for system feedback, important context, warnings, and errors.

## Approved Props

- `tone`: `neutral`, `success`, `warning`, or `danger`
- `title`: concise alert title
- `headingLevel`: optional heading level from 2 to 6
- children: supporting message

## AI Rules

- Use `danger` for failures that need attention.
- Use `warning` for review, risk, blocked states, or missing component states.
- Use `success` for completed or healthy system states.
- Use `neutral` for contextual system information.
- Keep alert body actionable.
- Choose a `headingLevel` that fits the surrounding page outline.
- Alert titles and bodies are programmatically connected by the component; prefer `title` and children over custom ARIA wiring.

## Related Contract

- `system/components/src/Alert/Alert.ai.md`
