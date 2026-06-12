# Accessibility Overview

Accessibility is a product quality requirement, not a final review pass.

For enforceable AI-facing rules, use `specs/foundation/accessibility.md`. For review workflow, use `ai/skills/accessibility-check.md`.

## Human Review Focus

- Confirm generated screens can be understood without relying on color alone.
- Confirm form controls, table headers, buttons, and loading states make sense to users.
- Confirm complex product layouts remain readable on smaller screens.
- Confirm component-level accessibility expectations are documented beside the component implementation.

## Maintenance

When accessibility guidance changes:

1. Update `specs/foundation/accessibility.md`.
2. Update affected component contracts in `system/components/src/*/*.ai.md`.
3. Update tests or eval cases if the rule should be enforced automatically.
