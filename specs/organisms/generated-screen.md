# Organism: Generated Screen

The generated screen organism renders a prompt-specific product screen from approved components.

## Required Structure

- One `Alert` describing the generated state or issue.
- Optional metric `Card` group for summary data.
- Optional form region using `Input`, `Select`, and `Textarea`.
- Optional `Table` for comparable row data.
- One local action group using `Button`.
- Optional `Badge` statuses inside cards, tables, or headers.

## AI Rules

- Generated screens must use only approved atoms and molecules.
- If the prompt asks for unsupported UI such as chart, modal, toast, drawer, date picker, sidebar, or file upload, use approved fallbacks and flag the gap.
- Keep product screens scannable, spacious enough to breathe, and task-focused.
- Use loading skeletons for the result surface while generation is in progress.
- Use `Button` loading state for the generate action itself.

## Related Files

- `apps/showcase/src/main.tsx`
- `apps/showcase/src/liveComposer.ts`
- `ai/live-composer.schema.json`
