# Card AI Contract

Use `Card` for soft grouped content such as metric summaries, workflow sections, generated preview modules, and repeated item surfaces.

## Props

- Native `div` props
- Optional `className`

## Rules

- Keep Card content focused on one concept.
- Do not nest cards inside cards.
- Prefer Card for summaries, not full page sections.
- Favor specimen-like cards with enough internal spacing over many tiny dense cards.

## AI Generation Notes

When a prompt asks for metrics, dashboard summaries, tiles, or grouped operational content, compose with `Card`. Use tokenized child text and approved Badge or Button components where needed.
