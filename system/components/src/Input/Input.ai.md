# Input AI Contract

Use `Input` for single-line text entry with a visible label.

## Props

- `label`: visible field label
- `hint`: optional supporting text
- `error`: optional validation or failure message
- Native input props, including `placeholder`, `value`, `defaultValue`, and `onChange`

## Rules

- Every generated input must have a visible `label`.
- Use `hint` only for meaningful supporting guidance that helps completion.
- Use `error` only for specific, actionable validation feedback.
- Placeholder text cannot replace a label or carry required instructions.
- Use concise noun labels like `Billing email`, `Workspace name`, or `Invite by email`.
- The component wires `hint` and `error` to `aria-describedby` and sets `aria-invalid` when `error` is present; do not duplicate those ARIA props manually.
- When `error` is present, the visible error state includes both the error copy and the approved danger-border treatment.

## AI Generation Notes

When a prompt asks users to enter, search, name, invite, configure, or edit a simple value, map it to `Input`.
