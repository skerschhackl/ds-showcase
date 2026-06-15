# Textarea AI Contract

Use `Textarea` for long-form text entry with a visible label, such as prompts, notes, descriptions, comments, or review feedback.

## Props

- `label`: visible field label
- `hint`: optional supporting text
- `error`: optional validation or failure message
- Native textarea props, including `placeholder`, `value`, `defaultValue`, `onChange`, and `rows`

## Rules

- Every textarea must have a visible `label`.
- Placeholder text cannot replace a label or carry required instructions.
- Use `hint` only when the field needs meaningful extra guidance.
- Use `error` only for specific, actionable validation feedback.
- Hints and errors are programmatically connected by the component; prefer `hint` and `error` props over custom markup.
- When `error` is present, the visible error state includes both the error copy and the approved danger-border treatment.
- Use `Textarea` for multi-line input only. Use `Input` for single-line values.

## AI Generation Notes

When a prompt asks users to write, describe, comment, summarize, or provide a longer free-form value, map it to `Textarea`.
