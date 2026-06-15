# Atom: Input

Use `Input` for single-line text entry with a visible label.

## Approved Props

- `label`: visible field label
- `hint`: optional supporting text
- `error`: optional validation or failure message
- Native input props, including `placeholder`, `value`, `defaultValue`, and `onChange`

## AI Rules

- Every generated input must have a visible label.
- Placeholder text cannot replace a label or carry required instructions.
- Use concise noun labels such as `Billing email`, `Workspace name`, or `Invite by email`.
- Use `hint` only when the field needs meaningful extra guidance.
- Use `error` only for specific, actionable validation feedback.
- Hints and errors are programmatically connected by the component; prefer `hint` and `error` props over custom markup.
- Error state must include the approved danger-border treatment; do not show error copy while leaving the input edge neutral.

## Related Contract

- `system/components/src/Input/Input.ai.md`
