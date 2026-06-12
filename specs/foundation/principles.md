# Foundation: Principles

## Intent

The design system is a governed interface language for product UI. It should help humans and AI agents generate screens that are consistent, accessible, reviewable, and friendly.

The visual direction is a playful creative operating system: soft, spacious, tactile, and expressive where it helps orientation. It should not become childish, ornamental, or less useful for real product workflows.

## Principles

1. Shared language beats isolated assets.
2. Components encode product behavior, not just appearance.
3. Tokens are the source of visual truth.
4. AI output must be reviewable against explicit rules.
5. New patterns earn their way into the system through repeated need.

## Decision Rules

- Choose the smallest approved component set that satisfies the prompt.
- Prefer product clarity over decorative complexity.
- Favor soft panels, clear hierarchy, and generous breathing room without losing task focus.
- Use expressive display moments for headings, metrics, and specimens; keep dense generated product UI readable.
- When a requested UI pattern is not available, flag it as a component gap.
- Do not invent new component APIs, color values, spacing values, or interaction patterns.

## Related Files

- `docs/principles.md`
- `docs/component-governance.md`
- `docs/ai-usage-guide.md`
