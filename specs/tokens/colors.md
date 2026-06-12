# Tokens: Colors

Use semantic color tokens for product UI. Primitive tokens define the palette and should only be used when creating or revising semantic tokens.

## Palette Direction

- The system should feel like a playful creative operating system: soft, spacious, tactile, and friendly without becoming childish or decorative.
- Teal is the primary action color.
- Purple is the creative accent for AI assistance, generation, and expressive moments.
- Coral is the warm accent for playful emphasis.
- Green, amber, red, and blue are reserved for status and system feedback.
- Neutral provides the canvas, surfaces, text, and borders.
- The canvas uses neutral `50` (`#f7fbfc`) for a soft pale blue-gray app background.
- Surfaces use neutral `0` (`#fbfdfc`) and `surfaceRaised` (`#fcfefe`) so cards stay airy and readable.
- Subtle fills use neutral `100` (`#eef4f8`).
- Borders use neutral `200` (`#dce8ee`) and strong borders use neutral `300` (`#cbdbe3`) so panels feel soft rather than boxed in.

## Neutral Ramp

- `neutral.0`: `#fbfdfc`
- `neutral.50`: `#f7fbfc`
- `neutral.100`: `#eef4f8`
- `neutral.200`: `#dce8ee`
- `neutral.300`: `#cbdbe3`
- `neutral.400`: `#9fb2bd`
- `neutral.500`: `#718590`
- `neutral.600`: `#596b75`
- `neutral.700`: `#3f5058`
- `neutral.800`: `#26353c`
- `neutral.900`: `#151f24`
- `neutral.950`: `#0b1216`

## Neutral Semantic Mapping

- `background` / `canvas`: neutral `50` (`#f7fbfc`)
- `surface`: neutral `0` (`#fbfdfc`)
- `surfaceRaised`: `#fcfefe`
- `neutralSoft` / `subtle`: neutral `100` (`#eef4f8`)
- `border`: neutral `200` (`#dce8ee`)
- `borderStrong`: neutral `300` (`#cbdbe3`)
- `text`: neutral `900` (`#151f24`)
- `muted`: neutral `600` (`#596b75`)

## Primitive Tokens

- Neutral: `--ds-color-primitive-neutral-0` through `--ds-color-primitive-neutral-950`
- Teal: `--ds-color-primitive-teal-50` through `--ds-color-primitive-teal-950`
- Purple: `--ds-color-primitive-purple-50` through `--ds-color-primitive-purple-950`
- Coral: `--ds-color-primitive-coral-50` through `--ds-color-primitive-coral-950`
- Green: `--ds-color-primitive-green-50` through `--ds-color-primitive-green-950`
- Amber: `--ds-color-primitive-amber-50` through `--ds-color-primitive-amber-950`
- Red: `--ds-color-primitive-red-50` through `--ds-color-primitive-red-950`
- Blue: `--ds-color-primitive-blue-50` through `--ds-color-primitive-blue-950`

## Core Surface Tokens

- `--ds-color-bg-canvas`: app canvas
- `--ds-color-bg-surface`: cards, inputs, selected tabs
- `--ds-color-bg-surface-raised`: raised surfaces
- `--ds-color-bg-subtle`: subdued section backgrounds
- `--ds-color-bg-inverse`: inverse background
- `--ds-color-text-semantic-primary`: primary text
- `--ds-color-text-semantic-secondary`: supporting text
- `--ds-color-text-semantic-tertiary`: low-emphasis text
- `--ds-color-text-semantic-disabled`: disabled text
- `--ds-color-text-semantic-inverse`: text on inverse/action backgrounds
- `--ds-color-border-semantic-subtle`: low-emphasis borders
- `--ds-color-border-semantic-default`: default borders
- `--ds-color-border-semantic-strong`: emphasized borders
- `--ds-color-border-semantic-focus`: focus borders

## Action Tokens

- `--ds-color-action-primary-bg`: primary action background
- `--ds-color-action-primary-bg-hover`: primary action hover background
- `--ds-color-action-primary-text`: primary action text
- `--ds-color-action-secondary-bg`: secondary action background
- `--ds-color-action-secondary-bg-hover`: secondary action hover background
- `--ds-color-action-secondary-text`: secondary action text

## Accent Tokens

- Creative: `--ds-color-accent-semantic-creative-bg`, `--ds-color-accent-semantic-creative-text`, `--ds-color-accent-semantic-creative-border`
- Warm: `--ds-color-accent-semantic-warm-bg`, `--ds-color-accent-semantic-warm-text`, `--ds-color-accent-semantic-warm-border`

## Expressive AI Tokens

- `--ds-gradient-ai-border`: thin ambient gradient border for the approved prompt textarea control

Use these only through approved patterns such as `.ds-ai-control`.

## Status Tokens

- Success: `--ds-color-status-success-bg`, `--ds-color-status-success-soft`, `--ds-color-status-success-text`, `--ds-color-status-success-border`, `--ds-color-status-success-icon`
- Warning: `--ds-color-status-warning-bg`, `--ds-color-status-warning-soft`, `--ds-color-status-warning-text`, `--ds-color-status-warning-border`, `--ds-color-status-warning-icon`
- Danger: `--ds-color-status-danger-bg`, `--ds-color-status-danger-soft`, `--ds-color-status-danger-text`, `--ds-color-status-danger-border`, `--ds-color-status-danger-icon`
- Info: `--ds-color-status-info-bg`, `--ds-color-status-info-soft`, `--ds-color-status-info-text`, `--ds-color-status-info-border`, `--ds-color-status-info-icon`

## Compatibility Tokens

The older flat tokens remain available for existing components: `--ds-color-background`, `--ds-color-surface`, `--ds-color-text`, `--ds-color-muted`, `--ds-color-border`, `--ds-color-primary`, `--ds-color-accent`, `--ds-color-success`, `--ds-color-warning`, `--ds-color-danger`, and related soft/surface/border variants.

Prefer the newer semantic tokens for new work.

## Theme Rules

- Light values are the default in `:root`.
- Dark mode is available through `:root[data-theme="dark"]`.
- If no explicit light theme is set, dark values also follow `prefers-color-scheme: dark`.

## AI Rules

- Use semantic tokens for UI decisions.
- Do not invent hex, rgb, or rgba values.
- Use primitive tokens only when defining a new semantic token.
- Use status tokens only for feedback, validation, alerts, health, or state.
- Use creative accent tokens for AI assistance, generation, suggestions, and selected creative states.
- Use warm accent tokens sparingly for playful emphasis, not error states.
- Use expressive AI tokens only for sanctioned prompt/generation surfaces, not standard product UI.
- Do not rely on color alone to communicate state.
- Keep product UI soft and readable; do not introduce dark, saturated, or high-contrast backgrounds unless using an approved inverse token.
