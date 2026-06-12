# Organism: Compliance Review

The compliance review organism explains why a generated screen passes, needs review, or is blocked.

## Required Evidence

- Mode: local composer, live composer, or generating.
- Prompt fingerprint.
- Approved components used.
- Unsupported components requested.
- Rule outcomes for components, tokens, and specificity.

## AI Rules

- Compliance output must update when prompt output changes.
- Component gaps must name the missing pattern directly.
- Token compliance must confirm use of shared tokenized styles.
- Specificity must distinguish deterministic local composition from live model composition.
- Do not mark a screen as pass if it contains unsupported components.

## Related Files

- `docs/component-governance.md`
- `ai/skills/compliance-review.md`
- `ai/evals/rubric.md`
