# Molecule: Table

Use `Table` for comparable row-and-column data.

## Approved Props

- `columns`: string array
- `rows`: array of row arrays containing renderable cells
- `caption`: optional visible table context
- `ariaLabel`: optional accessible name when no visible caption is present

## AI Rules

- Use Table for invoices, members, queues, diagnostics, history, review lists, and row actions.
- Include clear column headers.
- Use `caption` or `ariaLabel` when a screen contains multiple tables or the table needs extra context.
- Row cells should match the number and order of `columns`.
- Use Badge in status cells.
- Status cells must include text such as `Failed`, `Ready`, or `Pending`; do not rely on badge color alone.
- Use Button in action cells when the row has a direct command.
- If the prompt requests delete, remove, archive, retry, approve, or export actions, include an `Actions` column.
- Row action buttons need explicit labels, such as `Delete invoice` or `Retry sync`.
- Do not use Table for unrelated card grids or freeform content.

## Related Contract

- `system/components/src/Table/Table.ai.md`
