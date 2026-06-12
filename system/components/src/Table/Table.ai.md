# Table AI Contract

Use `Table` for comparable row-and-column data.

## Props

- `columns`: string array
- `rows`: array of row arrays containing React nodes
- `caption`: optional visible table context
- `ariaLabel`: optional accessible name when no visible caption is present

## Rules

- Use Table for invoices, members, queues, diagnostics, history, and review lists.
- Include clear column headers.
- Use `caption` or `ariaLabel` when a screen contains multiple tables or the table needs extra context.
- Row cells should match the number and order of `columns`.
- Use Badge in status cells.
- Status cells must include text such as `Failed`, `Ready`, or `Pending`; do not rely on badge color alone.
- Use Button in action cells when the row has a direct command.
- Row action buttons need explicit labels, such as `Delete invoice` or `Retry sync`.
- In JSON screen responses, table action cells must use the action-cell object shape:
  `{ "action": "Download all entries", "variant": "secondary" }`.
- `variant` is optional and must be one of `primary`, `secondary`, or `ghost`.
- Do not emit JSX-like button objects, nested props, component names, or raw object children in table cells.

## AI Generation Notes

When a prompt asks for a list, table, queue, history, members, invoices, checks, records, or row actions, map it to `Table`. If the prompt requests delete/remove/archive/export/download actions, include an `Actions` column with explicit action-cell objects.

## Valid Table Action Cells

Use:

```json
{ "action": "Download all entries", "variant": "secondary" }
```

Do not use:

```json
{ "type": "Button", "props": { "children": "Download all entries" } }
```

Do not use:

```json
{ "component": "Button", "label": "Download all entries" }
```
