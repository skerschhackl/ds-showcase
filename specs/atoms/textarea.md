# Atom: Textarea

Use `Textarea` for multi-line text entry with a visible label.

## Approved Props

- `label`: visible field label
- `hint`: optional supporting text
- `error`: optional validation or failure message
- Native textarea props, including `placeholder`, `value`, `defaultValue`, `onChange`, and `rows`

## AI Rules

- Every textarea must have a visible label.
- Placeholder text cannot replace a label or carry required instructions.
- Use Textarea for prompts, notes, descriptions, comments, or review feedback.
- Runtime composer responses support `kind: "textarea"` in screen fields.
- Use Input for single-line values.
- Use `hint` only when the field needs meaningful extra guidance.
- Use `error` only for specific, actionable validation feedback.
- Hints and errors are programmatically connected by the component; prefer `hint` and `error` props over custom markup.

## Related Contract

- `system/components/src/Textarea/Textarea.ai.md`
