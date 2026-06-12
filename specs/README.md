# AI-Readable Design System Specs

This folder is the first reading surface for AI agents that need to generate or review UI with this design system.

The specs describe decisions, constraints, and usage rules in stable Markdown. Component-local `*.ai.md` files remain the detailed source-level contracts for each component.

## Reading Order

1. `foundation/principles.md`
2. `foundation/accessibility.md`
3. `foundation/typography.md`
4. `foundation/spacing.md`
5. `foundation/motion.md`
6. `tokens/README.md`
7. Relevant files in `atoms/`, `molecules/`, and `organisms/`

## Source Of Truth

- Token values come from `system/tokens/src/tokens.json`.
- CSS variables are generated in `system/tokens/src/styles.css`.
- Component prop contracts live beside implementation in `system/components/src/*/*.ai.md`.
- These specs summarize and organize that source material so AI can find the right rules quickly.

## AI Rules

- Use only approved components unless the output explicitly reports a component gap.
- Use `Textarea` for long-form prompts, notes, descriptions, comments, and review feedback.
- Use named design tokens, never raw visual values.
- Prefer existing atoms and molecules before proposing a new organism.
- If a prompt asks for an unavailable pattern, generate the closest approved fallback and report the missing component.
- Treat typography, spacing, accessibility, and component rules as hard constraints, not style suggestions.
