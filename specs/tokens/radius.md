# Tokens: Radius

Radius tokens define the only approved corner treatments.

## Available Tokens

- `--ds-radius-sm`: 8px, compact controls and small internal corners
- `--ds-radius-md`: 16px, inputs, selects, compact surfaces, and nested content blocks
- `--ds-radius-lg`: 28px, cards, alerts, preview modules, and primary product panels
- `--ds-radius-xl`: 40px, hero panels, showcase sections, and display-scale surfaces
- `--ds-radius-pill`: 999px, primary buttons, badges, tabs, segmented controls, and progress-like shapes

## AI Rules

- Use `--ds-radius-md` for form controls and compact framed UI.
- Use `--ds-radius-lg` for cards, generated-screen panels, and larger modules.
- Use `--ds-radius-xl` only for showcase or display-scale panels.
- Use `--ds-radius-pill` for badges, primary actions, tabs, and segmented controls.
- Do not exceed the token scale.
- Do not invent custom radius values.
- Do not mix multiple radius styles inside one component unless the component API already does it.
