# Tokens

Tokens are the visual source of truth. AI-generated UI must choose from these named variables rather than inventing values.

## Token Source

- Source: `system/tokens/src/tokens.json`
- Generated CSS: `system/tokens/src/styles.css`
- TypeScript package: `system/tokens/src/index.ts`

## Token Categories

- `colors.md`
- `typography.md`
- `spacing.md`
- `radius.md`
- `shadows.md`
- `foundation/motion.md` for expressive motion and AI ambient control rules

## AI Rules

- Use CSS custom properties in generated CSS.
- Do not use raw hex, rgb, rgba, pixel, rem, radius, or shadow values outside token source files.
- If a needed token does not exist, report a token gap instead of inventing one.
- Prefer semantic tokens such as `--ds-color-bg-surface`, `--ds-color-text-primary`, and `--ds-color-border-default`.
- Use `--ds-color-status-*` tokens for status UI and never rely on color alone.
- Use expressive AI tokens only through approved patterns such as `.ds-ai-control`.
