# Atom: Select

Use `Select` for choosing one option from a small finite set.

## Approved Props

- `label`: visible field label
- `hint`: optional supporting text
- `error`: optional validation or failure message
- `options`: array of `{ label, value }`
- Native select props

## AI Rules

- Every generated select must have a visible label.
- Options should be mutually exclusive.
- Avoid Select for long search-heavy lists.
- Use labels such as `Plan`, `Role`, `Priority`, `Status`, `Time range`, or `Segment`.
- Keep option labels short and scannable.
- Placeholder or first-option text cannot replace the label or carry required instructions.
- Hints and errors are programmatically connected by the component; prefer `hint` and `error` props over custom markup.

## Related Contract

- `system/components/src/Select/Select.ai.md`
