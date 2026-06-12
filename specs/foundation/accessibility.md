# Foundation: Accessibility

Accessibility is part of the design system contract. Generated UI must be understandable by text, structure, and interaction behavior, not visual styling alone.

## Required Rules

- Inputs and selects must have visible labels.
- Placeholder text must not replace a label.
- Interactive controls must preserve focus states.
- Status must be represented with readable text, not color alone.
- Alerts must be used for important system feedback.
- Tables must be used for comparable row-and-column data.
- Dense layouts must remain readable at mobile widths.
- Loading states must expose progress text through accessible labels or status regions.

## Component Guidance

- Use `Alert` for errors, warnings, success confirmation, and important neutral context.
- Use `Badge` for short status text.
- Use `Button` only for actions.
- Use `Input`, `Select`, and `Textarea` only with visible labels.
- Use `Table` only when headers and rows are semantically comparable.
- Use `Spinner` for short action progress, usually inside a disabled button.

## Related Files

- `docs/accessibility.md`
- `system/components/src/*/*.ai.md`
