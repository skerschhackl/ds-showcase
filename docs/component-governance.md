# Component Governance

Component governance is the human process for deciding what belongs in the design system.

For AI-facing component usage rules, use `specs/atoms`, `specs/molecules`, `specs/organisms`, and the colocated contracts in `system/components/src/*/*.ai.md`.

## Approved Set

The current approved implementation lives in `system/components`.

`Field` is a public low-level form wrapper, but it is not a composer-emitted screen primitive. Generated screen fields should use `Input`, `Select`, or `Textarea`; custom human-authored controls can use `Field` directly.

Form error states are a shared visual contract. When `error` is present, `Input`, `Select`, `Textarea`, and custom controls wrapped by `Field` must show both connected error copy and the approved danger-border treatment.

Before adding a component, check whether the need can be solved through composition. Add a component when it removes repeated implementation work, clarifies accessibility behavior, or standardizes a pattern that appears in multiple product surfaces.

## Change Process

When adding or changing a component:

1. Update the implementation in `system/components/src`.
2. Update the colocated `*.ai.md` contract.
3. Add or update component tests.
4. Update the relevant file in `specs/atoms`, `specs/molecules`, or `specs/organisms`.
5. Update eval cases if the component affects generation behavior.

## Review Questions

- Does this component encode a repeated product behavior?
- Does it clarify accessibility or interaction expectations?
- Does it reduce repeated custom UI?
- Does it use existing tokens?
- Can AI identify when to use it from the specs and component contract?
