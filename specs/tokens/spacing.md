# Tokens: Spacing

Spacing tokens define the only approved spacing scale.

## Available Tokens

- `--ds-space-1`
- `--ds-space-2`
- `--ds-space-3`
- `--ds-space-4`
- `--ds-space-5`
- `--ds-space-6`
- `--ds-space-8`
- `--ds-space-10`
- `--ds-space-12`

## AI Rules

- Use only spacing tokens for gaps, padding, margin, and layout offsets.
- Use smaller spacing for tables, compact controls, and dense repeated rows.
- Use `--ds-space-6` and above for soft panels, preview modules, and specimen layouts.
- If a generated layout feels too sparse, reduce by one token step before introducing new structure.
- If a generated layout feels cramped, increase by one token step before introducing more panels.

## Related Files

- `specs/foundation/spacing.md`
- `system/tokens/src/tokens.json`
