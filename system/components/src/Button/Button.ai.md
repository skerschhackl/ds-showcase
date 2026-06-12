# Button AI Contract

Use `Button` for explicit commands that change state, submit data, trigger generation, or open a workflow step.

## Props

- `variant`: `primary`, `secondary`, or `ghost`
- `size`: `sm` or `md`
- `loading`: boolean
- `loadingLabel`: action-specific accessible loading text
- Native button props, including `onClick`, `disabled`, and `type`

## Rules

- Use one primary button per local action group.
- Use `secondary` for alternate but still important actions; it has a visible tinted fill and border.
- Use `ghost` for low-emphasis navigation or inspection actions.
- Do not use Button for status, tags, or decorative labels.
- When `loading` is true, provide an action-specific `loadingLabel`, such as `Generating UI`, `Saving invoice`, or `Retrying sync`.
- Destructive actions need explicit labels like `Delete invoice` or `Remove member`, not vague labels like `Confirm`.

## AI Generation Notes

When a prompt requests an action such as save, delete, retry, generate, invite, export, publish, or continue, map it to `Button`. Destructive actions should be explicit in the label and reviewed in compliance output.
