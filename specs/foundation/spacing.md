# Foundation: Spacing

Spacing uses a small token scale so generated UI feels consistent, spacious, and intentional. The system should feel soft and tactile, while still supporting focused product workflows.

## Scale

- `var(--ds-space-1)`: 0.25rem
- `var(--ds-space-2)`: 0.5rem
- `var(--ds-space-3)`: 0.75rem
- `var(--ds-space-4)`: 1rem
- `var(--ds-space-5)`: 1.25rem
- `var(--ds-space-6)`: 1.5rem
- `var(--ds-space-8)`: 2rem
- `var(--ds-space-10)`: 2.5rem
- `var(--ds-space-12)`: 3rem

## Layout Rules

- Use `--ds-space-1` for tight internal separation, such as tabs.
- Use `--ds-space-2` for label-to-control gaps and icon-to-text gaps.
- Use `--ds-space-3` for table cell padding and compact control padding.
- Use `--ds-space-4` for alert padding and small section gaps.
- Use `--ds-space-5` for compact card padding and dense repeated items.
- Use `--ds-space-6` for default card, panel, and generated-screen padding.
- Use `--ds-space-8` and above for page-level separation, hero panels, and specimen layouts.

## AI Usage Rules

- Use spacing tokens only. Do not invent pixel or rem values.
- Do not put UI cards inside other cards.
- Use soft full-width panels or clear layout bands for page structure.
- Keep repeated items aligned to a predictable grid.
- Preserve stable dimensions for fixed-format controls and tables so loading, hover, and dynamic labels do not shift layout.
- Give component overviews and generated previews enough room to breathe; do not compress everything into a dense grid by default.

## Related Tokens

- `system/tokens/src/tokens.json`
- `system/tokens/src/styles.css`
