# Tokens: Shadows

Shadow tokens provide soft, tactile elevation. Use them to make panels feel touchable without making the UI decorative or heavy.

## Available Tokens

- `--ds-shadow-sm`: low, soft elevation for cards, selected tabs, and calm panels
- `--ds-shadow-md`: broader elevation for hero panels, prominent preview surfaces, and temporary overlays
- `--ds-shadow-ai-glow`: low-opacity ambient glow for approved AI or creative generation surfaces only
- `--ds-focus-ring`: keyboard focus ring

## AI Rules

- Use shadows to clarify hierarchy, not decoration.
- Do not stack multiple shadows on nested surfaces.
- Do not remove or override the focus ring.
- Prefer low-contrast borders or no border for soft cards.
- Avoid dramatic drop shadows and layered elevation.
- Use glow only through approved AI/creative patterns such as `.ds-ai-control`.
- Do not apply `--ds-shadow-ai-glow` to tables, alerts, form fields, standard cards, or dense admin UI.
