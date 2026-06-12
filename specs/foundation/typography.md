# Foundation: Typography

Typography should make generated product UI scannable, calm, and explicit. Do not use oversized marketing type inside operational screens.

## Font Families

- UI: `var(--ds-typography-font-sans)` / Manrope
- Display: `var(--ds-typography-font-display)` / Hubot Sans
- Mono: `var(--ds-typography-font-mono)`

The design system self-hosts Manrope and Hubot Sans through `@ds/fonts/styles.css`. Components import that font stylesheet through `@ds/components/styles.css`, so apps do not need showcase-specific font setup. Tokens include system fallbacks so UI remains usable if a web font fails.

## Type Scale

- Caption: `var(--ds-typography-size-caption)` / `0.75rem`
- Label: `var(--ds-typography-size-label)` / `0.875rem`
- Body: `var(--ds-typography-size-body)` / `1rem`
- Body large: `var(--ds-typography-size-body-large)` / `1.125rem`
- Heading small: `var(--ds-typography-size-heading-sm)` / `1.25rem`
- Heading medium: `var(--ds-typography-size-heading-md)` / `1.5rem`
- Heading large: `var(--ds-typography-size-heading-lg)` / `2rem`
- Display small: `var(--ds-typography-size-display-sm)` / `2.5rem`
- Display medium: `var(--ds-typography-size-display-md)` / `3.5rem`
- Display large: `var(--ds-typography-size-display-lg)` / `5rem`

Use `var(--ds-typography-line-height-body)` for body text, `var(--ds-typography-line-height-heading)` for headings, and `var(--ds-typography-line-height-tight)` only for display type with enough space around it.

## AI Usage Rules

- Use `var(--ds-typography-font-sans)` for body text, controls, tables, forms, badges, alerts, and generated product UI.
- Use `var(--ds-typography-font-display)` only for showcase headings, display moments, typography specimens, and optional branded accents.
- Do not use `var(--ds-typography-font-display)` for body text, tables, forms, or compact generated product UI.
- Use `var(--ds-typography-font-mono)` only for code-like identifiers, hashes, commands, or technical values.
- Do not introduce additional font families.
- Use named typography size, line-height, and weight tokens instead of raw values.
- Use headings to communicate hierarchy, not decoration.
- Do not scale font size with viewport width.
- Letter spacing must be `0` unless matching the table header treatment.
- Use `font-kerning: normal`, disable synthetic weight/style, and use `text-rendering: optimizeLegibility` at the document level.
- Prefer high-level CSS properties such as `font-variant-ligatures` and `font-variant-numeric` over raw `font-feature-settings`.
- Use `font-variant-ligatures: common-ligatures` only for display headings or typography specimens.
- Use `font-variant-numeric: tabular-nums` only when digits need equal widths for alignment, such as metrics, tables, totals, invoices, dashboard values, and dates.
- Use `font-variant-numeric: slashed-zero` for technical values where `0` must be clearly distinguishable from `O`.
- Do not enable tabular numbers globally.
- Do not enable slashed zero globally.
- Do not enable discretionary ligatures or stylistic sets until they are inspected and approved.
- Keep labels concise and concrete.
- Use sentence case for body copy, labels, table cells, and button labels.
- Use compact headings inside cards, tables, side panels, and generated previews.
- Use `800` as the maximum display weight. Do not use `900` unless a matching font file is added and approved.

## Content Guidance

- Button labels should start with a verb: `Save`, `Retry sync`, `Delete`.
- Badge labels should be short states: `Ready`, `Failed`, `Review`, `Paid`.
- Alert titles should name the state: `Data sync failed`, `Billing workspace ready`.
- Supporting text should explain what changed or what action is needed.

## Related Tokens

- `--ds-typography-font-sans`
- `--ds-typography-font-display`
- `--ds-typography-font-mono`
- `--ds-typography-size-*`
- `--ds-typography-line-height-*`
- `--ds-typography-weight-*`
