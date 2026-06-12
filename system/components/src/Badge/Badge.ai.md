# Badge AI Contract

Use `Badge` for short text status, category, or state labels.

## Props

- `tone`: `neutral`, `primary`, `success`, `warning`, or `danger`
- Native span props

## Rules

- Badge text must communicate the status without relying on color.
- Do not use Badge as a button.
- Keep labels short: `Paid`, `Invited`, `Review`, `Failed`, `Ready`.
- Status text must be self-contained and contrast-safe for small text.
- Do not use tone as the only status signal; pair color with explicit text.
- Use `neutral` for non-evaluative metadata such as mode, category, or source labels. Do not use `success` for a mode label unless it communicates a completed success state.

## AI Generation Notes

When a prompt includes status, state, role, review, payment, error, or readiness, use Badge inside tables, cards, or alerts.
