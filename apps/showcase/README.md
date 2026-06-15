# Showcase App

The showcase app is the portfolio-facing product surface. It keeps design-system primitives in `@ds/components` and app-specific composition in `apps/showcase/src`.

## Structure

- `src/main.tsx`: app shell, top-level state, and page composition.
- `src/app.css`: global app shell, hero, shared panel, and shared layout helpers.
- `src/features/generator`: prompt-to-UI composition, live composer client, generated preview rendering, and generator styles.
- `src/features/components-gallery`: component gallery, token palette display, and gallery styles.
- `src/scenarios.ts`: prompt examples and hero copy.
- `src/liveComposer.ts`: live response normalization helpers for the showcase boundary.

## CSS Naming

Showcase CSS uses a documented hybrid convention:

- Use BEM-style names for feature-owned blocks, elements, and modifiers, such as `hero__signal-item--active`, `generated-surface__header`, and `component-example__demo`.
- Use small layout/helper classes when the pattern is intentionally shared across feature blocks, such as `button-row`, `screen-stack`, `form-grid`, `badge-row`, `metric-label`, and `metric-value`.
- Keep `ds-*` class names owned by `@ds/components`. The showcase may scope overrides under an app-owned block, such as `.prompt-composer .ds-textarea`, when composing a specific product surface.
- Prefer design-token CSS variables for reusable color, spacing, radius, shadow, and typography decisions. Raw color values are reserved for showcase-only glass, gradients, and decorative atmospheric treatments.

When a helper class starts carrying feature-specific meaning, move it into the feature stylesheet and rename it as a BEM-style feature class.
