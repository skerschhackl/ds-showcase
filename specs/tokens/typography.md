# Tokens: Typography

Typography tokens define font families, type sizes, line heights, and weights. Usage guidance lives in `specs/foundation/typography.md`.

## Available Tokens

- `--ds-typography-font-sans`
- `--ds-typography-font-display`
- `--ds-typography-font-mono`
- `--ds-typography-size-caption`
- `--ds-typography-size-label`
- `--ds-typography-size-body`
- `--ds-typography-size-body-large`
- `--ds-typography-size-heading-sm`
- `--ds-typography-size-heading-md`
- `--ds-typography-size-heading-lg`
- `--ds-typography-size-display-sm`
- `--ds-typography-size-display-md`
- `--ds-typography-size-display-lg`
- `--ds-typography-line-height-tight`
- `--ds-typography-line-height-heading`
- `--ds-typography-line-height-body`
- `--ds-typography-line-height-caption`
- `--ds-typography-weight-regular`
- `--ds-typography-weight-extralight`
- `--ds-typography-weight-light`
- `--ds-typography-weight-medium`
- `--ds-typography-weight-semibold`
- `--ds-typography-weight-bold`
- `--ds-typography-weight-extrabold`

## AI Rules

- Use `--ds-typography-font-sans` for generated product UI.
- Use `--ds-typography-font-display` only for showcase headings, large metric numerals, display moments, typography specimens, and optional branded accents.
- Use `--ds-typography-font-mono` only for code-like identifiers, hashes, or technical values.
- Do not use `--ds-typography-font-display` for body text, tables, forms, or compact generated product UI.
- Do not introduce new font families.
- Use named typography size, line-height, and weight tokens instead of raw CSS values.
- Do not use viewport-based font sizing.
- Use high-level CSS properties for OpenType behavior; avoid raw `font-feature-settings` unless a specific feature is approved.
- Use tabular numbers only in numeric UI contexts, not globally.

## Font Roles

- Manrope is the primary UI font for body text, controls, tables, forms, badges, alerts, and generated product UI.
- Hubot Sans is the display/accent font for portfolio-facing moments and brand-level labels. It is intentionally loaded only at `400`, `600`, and `800`.
- Mono is reserved for technical/code-like content.

## Rendering Rules

- Global text should use `font-kerning: normal`, no synthetic weight/style, and `text-rendering: optimizeLegibility`.
- Display headings may use `font-variant-ligatures: common-ligatures`.
- Numeric UI may use `font-variant-numeric: tabular-nums` when digits need equal widths for alignment.
- Technical numeric values may use `font-variant-numeric: slashed-zero` when `0` needs to be distinguishable from `O`.
- Numeric UI includes metrics, tables, totals, invoices, dashboard values, and dates where alignment matters.
- Do not enable tabular numbers globally.
- Do not enable slashed zero globally.
- Do not enable discretionary ligatures or stylistic sets until they are inspected and approved.

## Related Files

- `specs/foundation/typography.md`
- `system/tokens/src/tokens.json`
