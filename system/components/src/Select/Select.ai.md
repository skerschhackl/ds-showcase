# Select AI Contract

Use `Select` for choosing one option from a small finite set.

## Props

- `label`: visible field label
- `hint`: optional supporting text
- `error`: optional validation or failure message
- `options`: array of `{ label, value }`
- Native select props

## Rules

- Every generated select must have a visible `label`.
- Options should be mutually exclusive.
- Avoid Select for long search-heavy lists.
- Use labels such as `Plan`, `Role`, `Priority`, `Status`, `Time range`, or `Segment`.
- Use `hint` only for meaningful supporting guidance.
- Use `error` only for specific, actionable validation feedback.
- Placeholder or first-option text cannot replace the label or carry required instructions.
- The component wires `hint` and `error` to `aria-describedby` and sets `aria-invalid` when `error` is present; do not duplicate those ARIA props manually.

## AI Generation Notes

When a prompt asks for role, plan, status, priority, category, segment, or time range, map it to `Select`.
