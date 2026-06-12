# Atom: Button

Use `Button` for explicit commands that change state, submit data, trigger generation, or open a workflow step.

## Approved Props

- `variant`: `primary`, `secondary`, or `ghost`
- `size`: `sm` or `md`
- `loading`: boolean
- `loadingLabel`: action-specific accessible loading text
- Native button props, including `onClick`, `disabled`, and `type`

## AI Rules

- Use one primary button per local action group.
- Use `secondary` for alternate but still important actions; it should keep a visible tinted fill and border so it reads as actionable on glass or pale surfaces.
- Use `ghost` for low-emphasis navigation or inspection actions.
- Use `loading` for pending action states; the button is disabled while loading.
- Loading buttons need action-specific `loadingLabel` text, such as `Generating UI`, `Saving invoice`, or `Retrying sync`.
- Do not use Button for status, tags, or decorative labels.
- Destructive actions must be explicit in the visible label, such as `Delete report`; avoid vague labels like `Confirm`.

## Related Contract

- `system/components/src/Button/Button.ai.md`
