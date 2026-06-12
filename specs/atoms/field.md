# Atom: Field

Use `Field` as a public low-level wrapper for custom labeled form controls.

## Approved Props

- `label`: visible field label
- `hint`: optional supporting text
- `error`: optional validation or failure message
- `id`: optional control id
- `idSuffix`: optional generated-id suffix
- `children`: render function that receives control props

## AI Rules

- Do not emit `Field` directly in composer JSON responses.
- Prefer `Input`, `Select`, or `Textarea` for generated screen fields.
- Use Field only for human-authored custom controls that need the shared label, hint, error, and ARIA behavior.
- Child controls must spread the provided control props.

## Related Contract

- `system/components/src/Field/Field.ai.md`
