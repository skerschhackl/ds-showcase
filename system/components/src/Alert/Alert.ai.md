# Alert AI Contract

Use `Alert` for system feedback, important context, warnings, and errors.

## Props

- `tone`: `neutral`, `success`, `warning`, or `danger`
- `title`: concise alert title
- `headingLevel`: optional heading level from 2 to 6
- children: supporting message

## Rules

- Use `danger` for failures that need attention.
- Use `warning` for review, risk, or missing component states.
- Use `success` for completed or healthy system states.
- Keep alert body actionable.
- Choose a `headingLevel` that fits the surrounding page outline.
- The component wires the title and body to `aria-labelledby` and `aria-describedby`; do not duplicate those ARIA props manually.

## AI Generation Notes

When a prompt mentions failed, error, missing, blocked, saved, ready, generated, or review-needed states, include an Alert.
