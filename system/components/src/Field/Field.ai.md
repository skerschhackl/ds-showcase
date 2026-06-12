# Field AI Contract

Use `Field` as a low-level wrapper when building a custom form control that needs a visible label, optional hint, optional error, and programmatic ARIA wiring.

## Props

- `label`: visible field label
- `hint`: optional supporting text
- `error`: optional validation or failure message
- `id`: optional control id
- `idSuffix`: optional suffix used when the component generates an id
- `children`: render function that receives control props

## Rules

- Do not emit `Field` directly in composer JSON responses.
- Prefer `Input`, `Select`, or `Textarea` for generated screen fields.
- Use `Field` only when a human-authored component needs to wrap a custom control.
- The child control must spread the generated control props so `id`, `aria-describedby`, and `aria-invalid` are preserved.
- Placeholder text cannot replace the visible `label`.

## AI Generation Notes

When a prompt asks for a custom field, first map it to `Input`, `Select`, or `Textarea`. If none of those components can represent the requirement, report the missing component instead of generating a raw `Field` composition.
