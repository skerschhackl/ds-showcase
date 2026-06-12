# Atom: Badge

Use `Badge` for short text status, category, or state labels.

## Approved Props

- `tone`: `neutral`, `primary`, `success`, `warning`, or `danger`
- Native span props

## AI Rules

- Badge text must communicate the status without relying on color.
- Do not use Badge as a button.
- Keep labels short: `Paid`, `Invited`, `Review`, `Failed`, `Ready`.
- Use inside tables, cards, or alert-adjacent metadata.
- Status text must be self-contained and contrast-safe for small text.
- Do not use badge tone as the only status signal.
- Use `neutral` for non-evaluative metadata such as mode, category, or source labels. Reserve `success` for explicit successful outcomes.

## Related Contract

- `system/components/src/Badge/Badge.ai.md`
